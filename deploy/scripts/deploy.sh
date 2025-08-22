#!/bin/bash

# ====================================================================
# SCRIPT DE DEPLOY EM PRODUÇÃO - GERENCIADOR DE TAREFAS
# ====================================================================

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Variáveis
PROJECT_DIR="/var/www/gerenciador-task"
BACKUP_DIR="/var/backups/gerenciador-task"
COMPOSE_FILE="docker-compose.prod.yml"

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root por segurança"
   exit 1
fi

# Carregar variáveis de ambiente
if [ -f .env.production ]; then
    source .env.production
    log "Variáveis de ambiente carregadas"
else
    error "Arquivo .env.production não encontrado!"
    exit 1
fi

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    command -v docker >/dev/null 2>&1 || { error "Docker não está instalado"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { error "Docker Compose não está instalado"; exit 1; }
    command -v git >/dev/null 2>&1 || { error "Git não está instalado"; exit 1; }
    
    log "Todas as dependências verificadas ✓"
}

# Criar backup
create_backup() {
    log "Criando backup..."
    
    mkdir -p "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
    
    # Backup do banco de dados
    if docker ps | grep -q gerenciador_postgres; then
        log "Fazendo backup do banco de dados..."
        docker exec gerenciador_postgres pg_dump -U gerenciador_user gerenciador_task > "$BACKUP_PATH/database.sql"
    fi
    
    # Backup dos uploads
    if [ -d "$PROJECT_DIR/uploads" ]; then
        log "Fazendo backup dos uploads..."
        cp -r "$PROJECT_DIR/uploads" "$BACKUP_PATH/"
    fi
    
    log "Backup criado em: $BACKUP_PATH"
}

# Deploy da aplicação
deploy_application() {
    log "Iniciando deploy da aplicação..."
    
    cd "$PROJECT_DIR"
    
    # Atualizar código
    log "Atualizando código fonte..."
    git pull origin main
    
    # Substituir variáveis no nginx
    log "Configurando Nginx..."
    envsubst < deploy/nginx/sites/gerenciador.conf > deploy/nginx/sites/gerenciador_final.conf
    
    # Build e deploy com docker-compose
    log "Fazendo build das imagens..."
    docker-compose -f deploy/$COMPOSE_FILE build --no-cache
    
    log "Parando serviços antigos..."
    docker-compose -f deploy/$COMPOSE_FILE down
    
    log "Subindo novos serviços..."
    docker-compose -f deploy/$COMPOSE_FILE up -d
    
    # Executar migrações
    log "Executando migrações do banco..."
    docker-compose -f deploy/$COMPOSE_FILE exec -T backend npm run migrate
    
    log "Deploy concluído! ✓"
}

# Verificar saúde dos serviços
health_check() {
    log "Verificando saúde dos serviços..."
    
    sleep 30  # Aguardar serviços subirem
    
    # Verificar backend
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log "Backend: ✓ Saudável"
    else
        error "Backend: ✗ Com problemas"
        return 1
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        log "Frontend: ✓ Saudável"
    else
        error "Frontend: ✗ Com problemas"
        return 1
    fi
    
    # Verificar nginx
    if curl -f http://localhost/health >/dev/null 2>&1; then
        log "Nginx: ✓ Saudável"
    else
        error "Nginx: ✗ Com problemas"
        return 1
    fi
    
    log "Todos os serviços estão saudáveis! ✓"
}

# Limpeza de imagens antigas
cleanup() {
    log "Limpando imagens Docker antigas..."
    docker image prune -f
    docker system prune -f
    log "Limpeza concluída ✓"
}

# Função principal
main() {
    log "=== INÍCIO DO DEPLOY EM PRODUÇÃO ==="
    
    check_dependencies
    create_backup
    deploy_application
    health_check
    cleanup
    
    log "=== DEPLOY CONCLUÍDO COM SUCESSO! ==="
    log "Aplicação disponível em: https://$DOMAIN_NAME"
}

# Executar deploy
main "$@"