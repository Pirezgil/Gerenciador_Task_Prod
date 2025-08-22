# 🚀 **DEPLOY EM PRODUÇÃO - SERVIDOR LINUX**

## **📋 VISÃO GERAL**

Este guia fornece instruções completas para deploy do Sistema Gerenciador de Tarefas em um servidor Linux usando Docker, Nginx e PostgreSQL.

### **🔧 Stack de Produção**
- **Frontend**: Next.js (modo standalone)
- **Backend**: Node.js/Express
- **Database**: PostgreSQL 15
- **Reverse Proxy**: Nginx com SSL
- **Containerização**: Docker & Docker Compose
- **Process Manager**: Docker containers
- **SSL**: Let's Encrypt (Certbot)

---

## **⚡ QUICK START**

### **1. Preparação do Servidor**
```bash
# Executar como root
sudo bash deploy/scripts/setup-server.sh
```

### **2. Configuração**
```bash
# Clonar projeto
cd /var/www/gerenciador-task
git clone <seu-repositorio> .

# Configurar variáveis
cp deploy/.env.production.example deploy/.env.production
nano deploy/.env.production
```

### **3. Deploy**
```bash
# Executar como usuário deploy
sudo -u deploy bash deploy/scripts/deploy.sh
```

### **4. SSL**
```bash
# Configurar certificado SSL
certbot --nginx -d seudominio.com
```

---

## **📝 GUIA DETALHADO**

### **Pré-requisitos**
- Servidor Linux (Ubuntu 20.04+ recomendado)
- Mínimo 2GB RAM, 20GB storage
- Domínio configurado apontando para o servidor
- Acesso root ao servidor

### **1. Setup Inicial do Servidor**

#### **1.1 Executar Script de Setup**
```bash
# Baixar e executar script
wget https://raw.githubusercontent.com/seu-repo/deploy/scripts/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

#### **1.2 Verificar Instalações**
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Node.js
node --version
npm --version

# Verificar Nginx
nginx -v
```

### **2. Configuração do Projeto**

#### **2.1 Clonar Repositório**
```bash
cd /var/www/gerenciador-task
sudo -u deploy git clone <seu-repositorio> .
```

#### **2.2 Configurar Variáveis de Ambiente**
```bash
# Copiar template
cp deploy/.env.production.example deploy/.env.production

# Editar configurações
nano deploy/.env.production
```

**Variáveis Obrigatórias:**
```env
DOMAIN_NAME=seudominio.com
POSTGRES_PASSWORD=senha_super_segura
JWT_SECRET=chave_jwt_min_32_caracteres
VAPID_PUBLIC_KEY=sua_chave_vapid_publica
VAPID_PRIVATE_KEY=sua_chave_vapid_privada
```

#### **2.3 Gerar Chaves VAPID**
```bash
# Instalar web-push globalmente
npm install -g web-push

# Gerar chaves VAPID
web-push generate-vapid-keys
```

### **3. Deploy da Aplicação**

#### **3.1 Primeiro Deploy**
```bash
# Executar script de deploy
sudo -u deploy bash deploy/scripts/deploy.sh
```

#### **3.2 Verificar Serviços**
```bash
# Verificar containers
docker ps

# Ver logs
docker-compose -f deploy/docker-compose.prod.yml logs -f

# Testar endpoints
curl http://localhost:3000  # Frontend
curl http://localhost:3001/health  # Backend
```

### **4. Configuração SSL**

#### **4.1 Certificado Let's Encrypt**
```bash
# Parar nginx temporariamente
docker-compose -f deploy/docker-compose.prod.yml stop nginx

# Obter certificado
certbot certonly --standalone -d seudominio.com -d www.seudominio.com

# Copiar certificados para projeto
mkdir -p deploy/ssl
cp /etc/letsencrypt/live/seudominio.com/fullchain.pem deploy/ssl/
cp /etc/letsencrypt/live/seudominio.com/privkey.pem deploy/ssl/

# Reiniciar nginx
docker-compose -f deploy/docker-compose.prod.yml up -d nginx
```

#### **4.2 Renovação Automática**
```bash
# Adicionar ao crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /var/www/gerenciador-task/deploy/docker-compose.prod.yml restart nginx" | crontab -
```

---

## **🔧 MANUTENÇÃO**

### **Logs**
```bash
# Ver todos os logs
docker-compose -f deploy/docker-compose.prod.yml logs

# Logs específicos
docker-compose -f deploy/docker-compose.prod.yml logs frontend
docker-compose -f deploy/docker-compose.prod.yml logs backend
docker-compose -f deploy/docker-compose.prod.yml logs postgres
```

### **Backup**
```bash
# Backup manual do banco
docker exec gerenciador_postgres pg_dump -U gerenciador_user gerenciador_task > backup_$(date +%Y%m%d).sql

# Backup dos uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### **Atualizações**
```bash
# Atualizar código
cd /var/www/gerenciador-task
git pull origin main

# Redesployar
sudo -u deploy bash deploy/scripts/deploy.sh
```

### **Restart Serviços**
```bash
# Restart específico
docker-compose -f deploy/docker-compose.prod.yml restart backend

# Restart completo
docker-compose -f deploy/docker-compose.prod.yml down
docker-compose -f deploy/docker-compose.prod.yml up -d
```

---

## **📊 MONITORAMENTO**

### **Health Checks**
- Frontend: `https://seudominio.com/health`
- Backend: `https://seudominio.com/api/health`
- Banco: Status via Docker

### **Métricas**
```bash
# Status dos containers
docker stats

# Uso de disco
df -h

# Uso de memória
free -h

# Processos
htop
```

### **Alertas (Opcional)**
Configure monitoramento com:
- **Uptime Robot** para disponibilidade
- **Sentry** para erros
- **Prometheus + Grafana** para métricas avançadas

---

## **🔒 SEGURANÇA**

### **Firewall**
```bash
# Status do UFW
ufw status

# Adicionar regra (se necessário)
ufw allow from IP_CONFIAVEL to any port 22
```

### **Fail2Ban**
```bash
# Status
fail2ban-client status

# Verificar jails
fail2ban-client status sshd
```

### **Atualizações de Segurança**
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Atualizar containers
docker-compose -f deploy/docker-compose.prod.yml pull
docker-compose -f deploy/docker-compose.prod.yml up -d
```

---

## **🚨 TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Frontend não carrega**
```bash
# Verificar logs
docker-compose -f deploy/docker-compose.prod.yml logs frontend

# Verificar build
docker-compose -f deploy/docker-compose.prod.yml build frontend --no-cache
```

#### **2. Backend com erro 500**
```bash
# Verificar logs
docker-compose -f deploy/docker-compose.prod.yml logs backend

# Verificar variáveis de ambiente
docker-compose -f deploy/docker-compose.prod.yml exec backend env | grep NODE_ENV
```

#### **3. Banco não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose -f deploy/docker-compose.prod.yml ps postgres

# Testar conexão
docker-compose -f deploy/docker-compose.prod.yml exec postgres psql -U gerenciador_user -d gerenciador_task
```

#### **4. SSL não funciona**
```bash
# Verificar certificados
ls -la deploy/ssl/

# Testar configuração nginx
docker-compose -f deploy/docker-compose.prod.yml exec nginx nginx -t

# Recarregar nginx
docker-compose -f deploy/docker-compose.prod.yml exec nginx nginx -s reload
```

### **Comandos de Diagnóstico**
```bash
# Verificar portas abertas
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Verificar espaço em disco
du -sh /var/www/gerenciador-task/*

# Verificar uso de memória por container
docker stats --no-stream
```

---

## **📞 SUPORTE**

### **Logs Importantes**
- **Sistema**: `/var/log/syslog`
- **Nginx**: `/var/log/nginx/`
- **Docker**: `docker-compose logs`
- **Aplicação**: Container logs

### **Contato**
Para suporte, forneça:
1. Versão do sistema operacional
2. Logs de erro
3. Configurações (sem senhas)
4. Passos para reproduzir o problema

---

## **📚 RECURSOS ADICIONAIS**

- [Documentação Docker](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**✅ Deploy concluído com sucesso!**
Sua aplicação estará disponível em: `https://seudominio.com`