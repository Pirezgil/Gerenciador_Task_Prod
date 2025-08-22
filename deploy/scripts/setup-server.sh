#!/bin/bash

# ====================================================================
# SCRIPT DE SETUP INICIAL DO SERVIDOR LINUX
# ====================================================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root"
   exit 1
fi

# Atualizar sistema
update_system() {
    log "Atualizando sistema..."
    apt update && apt upgrade -y
    apt install -y curl wget git vim htop ufw fail2ban
    log "Sistema atualizado ✓"
}

# Instalar Docker
install_docker() {
    log "Instalando Docker..."
    
    # Remover versões antigas
    apt remove -y docker docker-engine docker.io containerd runc || true
    
    # Instalar dependências
    apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Adicionar chave GPG
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Adicionar repositório
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Instalar Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Iniciar serviços
    systemctl enable docker
    systemctl start docker
    
    log "Docker instalado ✓"
}

# Instalar Node.js (para utilitários)
install_nodejs() {
    log "Instalando Node.js..."
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Instalar PM2 globalmente
    npm install -g pm2
    
    log "Node.js instalado ✓"
}

# Configurar usuário de deploy
setup_deploy_user() {
    log "Configurando usuário de deploy..."
    
    # Criar usuário deploy
    useradd -m -s /bin/bash deploy || true
    usermod -aG docker deploy
    
    # Configurar SSH (se necessário)
    mkdir -p /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chown deploy:deploy /home/deploy/.ssh
    
    log "Usuário de deploy configurado ✓"
}

# Configurar firewall
setup_firewall() {
    log "Configurando firewall..."
    
    # Configurar UFW
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Ativar firewall
    ufw --force enable
    
    log "Firewall configurado ✓"
}

# Configurar fail2ban
setup_fail2ban() {
    log "Configurando fail2ban..."
    
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log "Fail2ban configurado ✓"
}

# Instalar Certbot para SSL
install_certbot() {
    log "Instalando Certbot..."
    
    apt install -y snapd
    snap install core && snap refresh core
    snap install --classic certbot
    
    # Criar link simbólico
    ln -sf /snap/bin/certbot /usr/bin/certbot
    
    log "Certbot instalado ✓"
}

# Criar estrutura de diretórios
create_directories() {
    log "Criando estrutura de diretórios..."
    
    mkdir -p /var/www/gerenciador-task
    mkdir -p /var/backups/gerenciador-task
    mkdir -p /var/log/gerenciador-task
    
    # Definir permissões
    chown -R deploy:deploy /var/www/gerenciador-task
    chmod -R 755 /var/www/gerenciador-task
    
    log "Estrutura de diretórios criada ✓"
}

# Configurar logrotate
setup_logrotate() {
    log "Configurando logrotate..."
    
    cat > /etc/logrotate.d/gerenciador-task << EOF
/var/log/gerenciador-task/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 deploy deploy
}
EOF

    log "Logrotate configurado ✓"
}

# Configurar swap (se necessário)
setup_swap() {
    log "Verificando e configurando swap..."
    
    if ! swapon --show | grep -q "/swapfile"; then
        log "Criando arquivo de swap de 2GB..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
        
        # Otimizar configurações de swap
        echo 'vm.swappiness=10' | tee -a /etc/sysctl.conf
        echo 'vm.vfs_cache_pressure=50' | tee -a /etc/sysctl.conf
    fi
    
    log "Swap configurado ✓"
}

# Função principal
main() {
    log "=== INÍCIO DO SETUP DO SERVIDOR ==="
    
    update_system
    install_docker
    install_nodejs
    setup_deploy_user
    setup_firewall
    setup_fail2ban
    install_certbot
    create_directories
    setup_logrotate
    setup_swap
    
    log "=== SETUP DO SERVIDOR CONCLUÍDO! ==="
    log "Próximos passos:"
    log "1. Configure o arquivo .env.production"
    log "2. Clone o repositório em /var/www/gerenciador-task"
    log "3. Execute o script de deploy"
    log "4. Configure o SSL com: certbot --nginx"
}

# Executar setup
main "$@"