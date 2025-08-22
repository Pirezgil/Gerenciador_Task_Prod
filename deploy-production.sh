#!/bin/bash

# ===================================
# SCRIPT DE DEPLOY PRODUÇÃO - UBUNTU
# ===================================

set -e  # Para em caso de erro

echo "🚀 Iniciando deploy em produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado!"
fi

if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
    error "Docker Compose não está instalado!"
fi

# Verificar se arquivo .env.prod existe
if [ ! -f ".env.prod" ]; then
    error "Arquivo .env.prod não encontrado! Crie o arquivo com suas configurações de produção."
fi

# Verificar se as variáveis obrigatórias estão configuradas
source .env.prod
if [ "$POSTGRES_PASSWORD" = "SUA_SENHA_POSTGRES_SEGURA_AQUI" ] || [ "$SERVER_IP" = "SEU_IP_SERVIDOR_AQUI" ]; then
    error "Configure as variáveis no arquivo .env.prod antes de continuar!"
fi

log "Parando containers existentes..."
docker compose -f docker-compose.prod.yml down || true

log "Removendo imagens antigas..."
docker compose -f docker-compose.prod.yml down --rmi all || true

log "Limpando volumes órfãos..."
docker volume prune -f

log "Construindo imagens..."
docker compose -f docker-compose.prod.yml build --no-cache

log "Subindo containers..."
docker compose -f docker-compose.prod.yml up -d

log "Aguardando containers iniciarem..."
sleep 30

log "Verificando status dos containers..."
docker compose -f docker-compose.prod.yml ps

log "Verificando logs do backend..."
docker compose -f docker-compose.prod.yml logs --tail=20 backend

log "Verificando saúde dos serviços..."
# Aguardar health checks
sleep 60

# Verificar se serviços estão respondendo
log "Testando conectividade dos serviços..."

# Teste Backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✅ Backend está respondendo"
else
    warn "❌ Backend não está respondendo"
    docker compose -f docker-compose.prod.yml logs backend
fi

# Teste Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend está respondendo"
else
    warn "❌ Frontend não está respondendo"
    docker compose -f docker-compose.prod.yml logs frontend
fi

# Teste PostgreSQL
if docker exec gerenciador_postgres_prod pg_isready -U gerenciador_user > /dev/null 2>&1; then
    log "✅ PostgreSQL está respondendo"
else
    warn "❌ PostgreSQL não está respondendo"
    docker compose -f docker-compose.prod.yml logs postgres
fi

log "Configurando backup automático..."
# Criar script de backup
cat > backup-auto.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/gerenciador_task"
mkdir -p $BACKUP_DIR
docker exec gerenciador_postgres_prod pg_dump -U gerenciador_user gerenciador_task > $BACKUP_DIR/backup-$(date +%Y%m%d_%H%M%S).sql
# Manter apenas os últimos 7 dias
find $BACKUP_DIR -name "backup-*.sql" -mtime +7 -delete
EOF
chmod +x backup-auto.sh

# Adicionar ao cron (backup diário às 2h da manhã)
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup-auto.sh") | crontab -

log "Mostrando informações do sistema..."
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Acesse sua aplicação:"
echo "   🌐 Frontend: http://$SERVER_IP:3000"
echo "   🔧 Backend:  http://$SERVER_IP:3001"
echo "   🐘 PostgreSQL: $SERVER_IP:5432"
echo
echo "🔧 Comandos úteis:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo "   docker compose -f docker-compose.prod.yml ps"
echo "   docker compose -f docker-compose.prod.yml restart"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"