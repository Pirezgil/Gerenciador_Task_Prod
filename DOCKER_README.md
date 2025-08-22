# 🐳 Deploy Local com Docker Desktop

## Pré-requisitos

✅ **Docker Desktop** instalado e rodando
- Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
- Mac: [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)
- Linux: [Docker Desktop for Linux](https://docs.docker.com/desktop/linux/install/)

## 🚀 Deploy Rápido

### Opção 1: Script Automatizado (Recomendado)

**Windows:**
```cmd
docker-run.bat
```

**Linux/Mac:**
```bash
./docker-run.sh
```

### Opção 2: Comandos Manuais

1. **Inicie o Docker Desktop**
   - Abra o Docker Desktop e aguarde inicializar

2. **Execute os comandos:**
   ```bash
   # Build das imagens
   docker-compose -f docker-compose.local.yml --env-file .env.docker build
   
   # Subir containers
   docker-compose -f docker-compose.local.yml --env-file .env.docker up -d
   ```

## 📋 URLs do Sistema

- **Frontend (Next.js):** http://localhost:3000
- **Backend (API):** http://localhost:3001
- **PostgreSQL:** localhost:5432

## 🛠 Comandos Úteis

### Monitoramento
```bash
# Ver status dos containers
docker-compose -f docker-compose.local.yml ps

# Ver logs em tempo real
docker-compose -f docker-compose.local.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.local.yml logs -f frontend
docker-compose -f docker-compose.local.yml logs -f backend
```

### Gerenciamento
```bash
# Parar todos os containers
docker-compose -f docker-compose.local.yml down

# Parar e remover volumes (CUIDADO: apaga dados do banco)
docker-compose -f docker-compose.local.yml down -v

# Rebuild de uma imagem específica
docker-compose -f docker-compose.local.yml build frontend
docker-compose -f docker-compose.local.yml build backend

# Restart de um serviço
docker-compose -f docker-compose.local.yml restart backend
```

### Banco de Dados
```bash
# Acessar PostgreSQL via linha de comando
docker exec -it gerenciador_postgres_local psql -U gerenciador_user -d gerenciador_task

# Backup do banco
docker exec gerenciador_postgres_local pg_dump -U gerenciador_user gerenciador_task > backup.sql

# Restaurar backup
docker exec -i gerenciador_postgres_local psql -U gerenciador_user gerenciador_task < backup.sql
```

## 🔧 Configurações

### Variáveis de Ambiente (`.env.docker`)

```env
# Database
POSTGRES_PASSWORD=senha123
DATABASE_URL=postgresql://gerenciador_user:senha123@postgres:5432/gerenciador_task

# JWT
JWT_SECRET=minha_chave_jwt_super_secreta_local_desenvolvimento_123456789

# URLs
DOMAIN_NAME=localhost
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Environment
NODE_ENV=production
```

## 📊 Estrutura dos Containers

### 🐘 PostgreSQL
- **Container:** `gerenciador_postgres_local`
- **Porta:** 5432
- **Usuário:** `gerenciador_user`
- **Banco:** `gerenciador_task`
- **Volume:** `postgres_data` (dados persistentes)

### 🟢 Backend (Node.js)
- **Container:** `gerenciador_backend_local`
- **Porta:** 3001
- **Dockerfile:** `backend/Dockerfile`
- **Volume:** `uploads_data` (arquivos enviados)

### ⚛️ Frontend (Next.js)
- **Container:** `gerenciador_frontend_local`
- **Porta:** 3000
- **Dockerfile:** `deploy/Dockerfile.frontend`

## 🚨 Troubleshooting

### Docker Desktop não está rodando
```
ERRO: error during connect: Get "http://...dockerDesktopLinuxEngine..."
```
**Solução:** Inicie o Docker Desktop manualmente e aguarde a inicialização completa.

### Porta em uso
```
ERRO: Port 3000/3001 is already in use
```
**Solução:** Pare outros serviços nessas portas ou altere as portas no `docker-compose.local.yml`.

### Build falha por falta de memória
**Solução:** 
1. Aumente a memória do Docker Desktop (Settings > Resources > Memory)
2. Feche outras aplicações pesadas

### Frontend não conecta com Backend
**Verificar:**
1. Containers estão rodando: `docker-compose -f docker-compose.local.yml ps`
2. Logs do backend: `docker-compose -f docker-compose.local.yml logs backend`
3. URLs corretas no arquivo `.env.docker`

### Banco não conecta
**Verificar:**
1. PostgreSQL iniciou: `docker-compose -f docker-compose.local.yml logs postgres`
2. Credenciais corretas no `.env.docker`
3. Migrations foram executadas

## 🔄 Processo de Desenvolvimento

1. **Primeira vez:** Execute o script de deploy
2. **Alterações no código:** 
   - Frontend: Rebuild com `docker-compose -f docker-compose.local.yml build frontend`
   - Backend: Rebuild com `docker-compose -f docker-compose.local.yml build backend`
3. **Reiniciar serviços:** `docker-compose -f docker-compose.local.yml restart`

## ⚡ Performance

Para melhor performance:
- Aloque pelo menos 4GB de RAM para Docker Desktop
- Use SSD se possível
- Feche aplicações desnecessárias durante o build

---

✅ **Sistema pronto para desenvolvimento local com Docker Desktop!**