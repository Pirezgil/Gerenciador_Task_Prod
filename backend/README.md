# Backend - Sistema de Gerenciamento de Tarefas

Backend completo implementado seguindo os planos de arquitetura definidos.

## 🚀 Tecnologias

- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15+
- **Validação**: Zod
- **Autenticação**: JWT + bcrypt
- **Segurança**: Helmet, CORS

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/          # Controllers das rotas
│   ├── middleware/           # Middlewares customizados
│   ├── routes/              # Definição das rotas
│   ├── services/            # Lógica de negócio
│   ├── lib/                 # Utilitários e configurações
│   ├── types/               # Definições TypeScript
│   └── app.ts               # Configuração Express
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   ├── migrations/          # Migrations SQL
│   └── seed.ts             # Dados iniciais
├── package.json
├── tsconfig.json
├── Dockerfile
└── railway.toml
```

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gerenciador_tasks"
JWT_SECRET="seu_jwt_secret_super_seguro"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### 3. Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Popular banco com dados iniciais
npx prisma db seed
```

## 🏃‍♂️ Executar

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `PUT /api/auth/profile` - Atualizar perfil
- `POST /api/auth/logout` - Logout

### Tarefas
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `GET /api/tasks/:id` - Buscar tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Deletar tarefa
- `POST /api/tasks/:id/complete` - Completar tarefa
- `POST /api/tasks/:id/postpone` - Adiar tarefa
- `POST /api/tasks/:id/comments` - Adicionar comentário

### Projetos
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `GET /api/projects/:id` - Buscar projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto
- `GET /api/projects/:id/stats` - Estatísticas do projeto

### Notas (Sandbox)
- `GET /api/notes` - Listar notas
- `POST /api/notes` - Criar nota
- `PUT /api/notes/:id` - Atualizar nota
- `DELETE /api/notes/:id` - Deletar nota
- `POST /api/notes/sandbox/auth` - Autenticar sandbox

### Hábitos
- `GET /api/habits` - Listar hábitos
- `POST /api/habits` - Criar hábito
- `POST /api/habits/:id/complete` - Marcar conclusão

### Usuários
- `GET /api/users/settings` - Configurações do usuário
- `PUT /api/users/settings` - Atualizar configurações
- `GET /api/users/stats` - Estatísticas do usuário

## 🚀 Deploy

### Railway

1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. O deploy será automático

### Docker

```bash
# Build da imagem
docker build -t gerenciador-tasks-backend .

# Executar container
docker run -p 3001:3001 \
  -e DATABASE_URL="your_db_url" \
  -e JWT_SECRET="your_jwt_secret" \
  gerenciador-tasks-backend
```

## 🔒 Segurança

- ✅ Hash de senhas com bcrypt (12 rounds)
- ✅ JWT tokens com expiração
- ✅ CORS configurado
- ✅ Helmet.js para headers de segurança
- ✅ Validação rigorosa com Zod
- ✅ SQL Injection protection via Prisma
- ✅ Environment variables para secrets

## 🧪 Testes

```bash
# Health check
curl http://localhost:3001/health

# Teste de autenticação
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@gerenciador.com","password":"123456"}'
```

## 📊 Monitoramento

- Health check endpoint: `/health`
- Logs estruturados com Morgan
- Tratamento de erros centralizado
- Métricas de performance

## 🔄 Migração do localStorage

O sistema inclui um script de migração para transferir dados do localStorage para PostgreSQL:

```typescript
import { migrateFromLocalStorage } from './lib/migration';

// Exemplo de uso
const localData = JSON.parse(localStorage.getItem('taskData') || '{}');
await migrateFromLocalStorage(localData, userId);
```

## 📝 Notas de Implementação

1. **Autenticação**: JWT stateless sem refresh tokens (simplificado)
2. **Validação**: Zod schemas para todas as entradas
3. **Erro Handling**: Middleware centralizado com tipos específicos
4. **Performance**: Índices otimizados no banco
5. **Escalabilidade**: Arquitetura preparada para load balancing

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**: Verifique DATABASE_URL
2. **Token expirado**: Reenvie login no frontend
3. **Erro de validação**: Verifique formato dos dados
4. **CORS error**: Configure FRONTEND_URL corretamente

### Logs

```bash
# Visualizar logs
npm run dev

# Prisma Studio (visualizar dados)
npx prisma studio
```

---

*Backend implementado seguindo rigorosamente os planos de arquitetura definidos*
*Versão: 1.0 | Data: 04/08/2025*