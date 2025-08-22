# 🚀 Deploy com NGROK - Gerenciador de Tarefas

Este guia explica como fazer deploy da aplicação usando NGROK para acesso externo.

## 📋 Pré-requisitos

1. **Docker e Docker Compose** instalados
2. **NGROK** instalado e autenticado
3. **Git** para clonar o projeto

## 🛠️ Configuração Inicial

### 1. Clonar o Projeto
```bash
git clone <seu-repositorio>
cd Gerenciador_Task
```

### 2. Instalar e Configurar NGROK
```bash
# Instalar ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Autenticar (substitua pelo seu token)
ngrok config add-authtoken SEU_TOKEN_NGROK_AQUI
```

## 🚀 Deploy Automático

### Método 1: Script Automático (Recomendado)
```bash
# Tornar o script executável
chmod +x deploy/deploy-ngrok.sh

# Executar deploy
./deploy/deploy-ngrok.sh seu-dominio-ngrok.ngrok-free.app
```

### Método 2: Deploy Manual

#### 1. Configurar Variáveis de Ambiente
```bash
# Copiar e editar arquivo de ambiente
cp .env.ngrok .env

# Editar com seu domínio ngrok
nano .env.ngrok
# Alterar: SEU_DOMINIO_NGROK_AQUI para seu domínio real
```

#### 2. Build das Imagens
```bash
# Backend
docker build -t gerenciador-task-backend -f deploy/Dockerfile.backend .

# Frontend  
docker build -t gerenciador-task-frontend -f deploy/Dockerfile.frontend .
```

#### 3. Executar Containers
```bash
# Criar network
docker network create gerenciador-network

# PostgreSQL
docker run -d --name gerenciador_postgres_prod \
  --network gerenciador-network \
  --env-file .env.ngrok \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Backend
docker run -d --name gerenciador_backend_prod \
  --network gerenciador-network \
  --env-file .env.ngrok \
  -p 3001:3001 \
  gerenciador-task-backend

# Frontend
docker run -d --name gerenciador_frontend_prod \
  --network gerenciador-network \
  --env-file .env.ngrok \
  -p 3000:3000 \
  gerenciador-task-frontend
```

#### 4. Executar Migrations
```bash
docker exec gerenciador_backend_prod npx prisma migrate deploy
```

## 🌐 Configurar NGROK

### 1. Iniciar Túnel NGROK
```bash
# Em um terminal separado, manter rodando:
ngrok http 3000
```

### 2. Copiar URL Gerada
O ngrok irá mostrar algo como:
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
```

Use a URL HTTPS para acessar sua aplicação.

## ✅ Verificação de Funcionamento

### 1. Testar Endpoints
```bash
# Verificar backend
curl http://localhost:3001/health

# Verificar frontend
curl http://localhost:3000

# Verificar via ngrok (substitua pela sua URL)
curl https://seu-dominio.ngrok-free.app/api/health
```

### 2. Ver Logs
```bash
# Logs do frontend
docker logs -f gerenciador_frontend_prod

# Logs do backend
docker logs -f gerenciador_backend_prod

# Logs do PostgreSQL
docker logs -f gerenciador_postgres_prod
```

## 🔧 Comandos Úteis

### Gerenciamento de Containers
```bash
# Ver status
docker ps

# Parar todos os containers
docker stop gerenciador_frontend_prod gerenciador_backend_prod gerenciador_postgres_prod

# Remover containers
docker rm gerenciador_frontend_prod gerenciador_backend_prod gerenciador_postgres_prod

# Ver logs em tempo real
docker logs -f gerenciador_frontend_prod
```

### Rebuild e Restart
```bash
# Rebuild apenas frontend
docker build -t gerenciador-task-frontend -f deploy/Dockerfile.frontend .
docker stop gerenciador_frontend_prod
docker rm gerenciador_frontend_prod
docker run -d --name gerenciador_frontend_prod --network gerenciador-network --env-file .env.ngrok -p 3000:3000 gerenciador-task-frontend

# Rebuild apenas backend
docker build -t gerenciador-task-backend -f deploy/Dockerfile.backend .
docker stop gerenciador_backend_prod
docker rm gerenciador_backend_prod
docker run -d --name gerenciador_backend_prod --network gerenciador-network --env-file .env.ngrok -p 3001:3001 gerenciador-task-backend
```

## 🐳 Portainer (Interface Gráfica)

Se instalou o Portainer:
- Acesse: `https://seu-ip:9443`
- Gerencie containers, logs, volumes graficamente

## ❗ Problemas Comuns

### 1. "404 Not Found" no ngrok
- ✅ Verifique se o ngrok está apontando para a porta 3000
- ✅ Confirme que o frontend está rodando: `docker ps`

### 2. Erro de CORS
- ✅ Verifique se o domínio no `.env.ngrok` está correto
- ✅ Confirme que está usando HTTPS na URL do ngrok

### 3. Banco de dados não conecta
- ✅ Aguarde alguns segundos após iniciar o PostgreSQL
- ✅ Verifique se as credenciais no `.env.ngrok` estão corretas

### 4. Frontend não carrega
- ✅ Veja os logs: `docker logs gerenciador_frontend_prod`
- ✅ Verifique se o build foi bem-sucedido

### 5. API não responde
- ✅ Teste diretamente: `curl http://localhost:3001/health`
- ✅ Veja os logs do backend: `docker logs gerenciador_backend_prod`

## 🔐 Segurança

### URLs HTTPS Obrigatórias
- ✅ Sempre use URLs HTTPS do ngrok
- ✅ Nunca exponha credenciais nos logs
- ✅ Use senhas fortes no arquivo `.env.ngrok`

### Rate Limiting
- ✅ O sistema tem rate limiting ativo para produção
- ✅ APIs sensíveis têm proteção CSRF

## 🔄 Atualizações

### Deploy de Nova Versão
```bash
# 1. Parar containers atuais
docker stop gerenciador_frontend_prod gerenciador_backend_prod

# 2. Fazer pull do novo código
git pull origin main

# 3. Rebuild
docker build -t gerenciador-task-frontend -f deploy/Dockerfile.frontend .
docker build -t gerenciador-task-backend -f deploy/Dockerfile.backend .

# 4. Restart containers
docker start gerenciador_backend_prod
docker start gerenciador_frontend_prod

# 5. Executar migrations se necessário
docker exec gerenciador_backend_prod npx prisma migrate deploy
```

## 📱 Acesso Final

Após o deploy bem-sucedido, acesse:
- **Aplicação**: `https://seu-dominio.ngrok-free.app`
- **API Health**: `https://seu-dominio.ngrok-free.app/api/health`
- **Portainer**: `http://seu-ip:9443` (se instalado)

---

✅ **Deploy concluído com sucesso!** Sua aplicação está rodando em produção com NGROK.