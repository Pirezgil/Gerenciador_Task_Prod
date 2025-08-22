# 🌐 Configuração Ngrok - Gerenciador de Tarefas

## ✅ Setup Concluído!

Seu sistema está configurado para acesso externo via ngrok com URL estática.

## 🚀 Como usar

### 1. Iniciar os containers Docker
```bash
# Windows
docker-run-ngrok.bat

# Linux/Mac
./docker-run-ngrok.sh
```

### 2. Executar o ngrok (em outro terminal)
```bash
ngrok http --url=antelope-leading-deeply.ngrok-free.app 80
```

## 📍 URLs de Acesso

- **Local**: http://localhost
- **Externo**: https://antelope-leading-deeply.ngrok-free.app

## 🔧 Comandos Úteis

```bash
# Ver logs
docker-compose -f docker-compose.ngrok.yml logs -f

# Parar containers
docker-compose -f docker-compose.ngrok.yml down

# Reiniciar containers
docker-compose -f docker-compose.ngrok.yml restart

# Status dos containers
docker ps
```

## 🏗️ Arquitetura

```
Internet → ngrok → Nginx (porta 80) → Frontend (porta 3000) / Backend (porta 3001)
```

### Roteamento Nginx:
- `/api/*` → Backend (porta 3001)
- `/health` → Backend health check
- `/uploads/*` → Backend uploads
- `/*` → Frontend (porta 3000)

## ⚙️ Configurações

### Arquivos importantes:
- `.env.ngrok` - Variáveis de ambiente para ngrok
- `docker-compose.ngrok.yml` - Configuração Docker para ngrok
- `nginx.ngrok.conf` - Configuração do proxy reverso

### URLs configuradas:
- Frontend: `https://antelope-leading-deeply.ngrok-free.app`
- API: `https://antelope-leading-deeply.ngrok-free.app/api`

## 🔒 Segurança

- Headers CORS configurados
- Proxy headers corretos
- Suporte a HTTPS via ngrok
- Headers de segurança incluídos

## 📝 Notas

1. O ngrok deve estar rodando para acesso externo funcionar
2. O banco PostgreSQL permanece local (host.docker.internal)
3. Uploads são mantidos em volume Docker
4. Logs são acessíveis via Docker Compose

## 🐛 Troubleshooting

### Porta em uso
Se a porta 80 estiver em uso:
```bash
# Verificar processos
netstat -ano | findstr :80

# Parar processo (substitua PID)
taskkill /F /PID [PID]
```

### Ngrok não conecta
1. Verificar se a URL estática está correta
2. Confirmar que os containers estão rodando na porta 80
3. Verificar logs do nginx: `docker logs gerenciador_nginx_ngrok`