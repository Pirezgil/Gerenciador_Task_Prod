#!/bin/bash

# =============================================================================
# SCRIPT DE DEPLOY PARA NGROK - GERENCIADOR DE TAREFAS
# =============================================================================

set -e  # Parar execução se houver erro

echo "🚀 Iniciando deploy para produção com NGROK..."

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
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
    exit 1
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto!"
fi

# Parar containers existentes
log "Parando containers existentes..."
docker-compose down 2>/dev/null || true
docker stop gerenciador_frontend_prod gerenciador_backend_prod gerenciador_postgres_prod 2>/dev/null || true
docker rm gerenciador_frontend_prod gerenciador_backend_prod gerenciador_postgres_prod 2>/dev/null || true

# Limpar imagens antigas
log "Limpando imagens antigas..."
docker rmi gerenciador-task-frontend:latest 2>/dev/null || true
docker rmi gerenciador-task-backend:latest 2>/dev/null || true

# Verificar se o arquivo .env.ngrok existe
if [ ! -f ".env.ngrok" ]; then
    error "Arquivo .env.ngrok não encontrado! Configure suas variáveis de ambiente."
fi

# Solicitar URL do ngrok
if [ -z "$1" ]; then
    echo -e "${BLUE}Digite a URL do seu ngrok (ex: exemplo-abc-123.ngrok-free.app):${NC}"
    read NGROK_DOMAIN
else
    NGROK_DOMAIN="$1"
fi

# Validar domínio ngrok
if [[ ! "$NGROK_DOMAIN" =~ \.ngrok-free\.app$ ]]; then
    error "Domínio inválido! Use o formato: exemplo-abc-123.ngrok-free.app"
fi

log "Configurando para domínio: $NGROK_DOMAIN"

# Atualizar arquivo .env.ngrok com o domínio fornecido
sed -i "s/SEU_DOMINIO_NGROK_AQUI/$NGROK_DOMAIN/g" .env.ngrok

# Copiar arquivo de ambiente
cp .env.ngrok .env

log "Buildando imagem do backend..."
docker build -t gerenciador-task-backend -f deploy/Dockerfile.backend .

log "Buildando imagem do frontend..."
docker build -t gerenciador-task-frontend -f deploy/Dockerfile.frontend .

log "Criando network..."
docker network create gerenciador-network 2>/dev/null || true

log "Iniciando PostgreSQL..."
docker run -d \
  --name gerenciador_postgres_prod \
  --network gerenciador-network \
  --env-file .env.ngrok \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Aguardar PostgreSQL estar pronto
log "Aguardando PostgreSQL estar pronto..."
sleep 10

log "Iniciando backend..."
docker run -d \
  --name gerenciador_backend_prod \
  --network gerenciador-network \
  --env-file .env.ngrok \
  -p 3001:3001 \
  gerenciador-task-backend

log "Iniciando frontend..."
docker run -d \
  --name gerenciador_frontend_prod \
  --network gerenciador-network \
  --env-file .env.ngrok \
  -p 3000:3000 \
  gerenciador-task-frontend

# Aguardar containers estarem prontos
log "Aguardando containers estarem prontos..."
sleep 15

# Verificar status dos containers
log "Verificando status dos containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Executar migrations
log "Executando migrations do banco de dados..."
docker exec gerenciador_backend_prod npx prisma migrate deploy || warn "Erro ao executar migrations"

# Executar seed (opcional)
log "Executando seed do banco de dados..."
docker exec gerenciador_backend_prod npm run seed 2>/dev/null || warn "Seed não executado (pode não existir)"

# Verificar saúde dos serviços
log "Verificando saúde dos serviços..."

# Backend
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    log "✅ Backend está funcionando"
else
    warn "❌ Backend pode ter problemas"
fi

# Frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    log "✅ Frontend está funcionando"
else
    warn "❌ Frontend pode ter problemas"
fi

echo ""
echo "🎉 ${GREEN}Deploy concluído!${NC}"
echo "📱 Frontend: https://$NGROK_DOMAIN"
echo "🔧 Backend: https://$NGROK_DOMAIN/api"
echo "🐳 Portainer: http://localhost:9443"
echo ""
echo "📋 ${YELLOW}Comandos úteis:${NC}"
echo "  Ver logs: docker logs -f gerenciador_frontend_prod"
echo "  Ver logs: docker logs -f gerenciador_backend_prod"
echo "  Parar tudo: docker stop gerenciador_frontend_prod gerenciador_backend_prod gerenciador_postgres_prod"
echo ""
echo "⚠️  ${YELLOW}Lembre-se de:${NC}"
echo "  1. Manter o ngrok rodando: ngrok http 3000"
echo "  2. Usar HTTPS na URL fornecida"
echo "  3. Monitorar logs em caso de problemas"