# 🚀 Plano de Implementação do Backend
**Sistema de Gerenciamento de Tarefas - Arquitetura Completa**

---

## 📋 Resumo Executivo

Este documento apresenta um plano completo para criação do backend do Sistema de Gerenciamento de Tarefas, utilizando **Node.js + Express** com **TypeScript**, integrado ao banco **PostgreSQL** via **Prisma ORM**. O frontend Next.js já está completo e utiliza Zustand + localStorage.

---

## 🏗️ Arquitetura Proposta

### **Stack Tecnológica**
```typescript
Backend:
- Runtime: Node.js 18+
- Framework: Express.js + TypeScript
- ORM: Prisma
- Database: PostgreSQL 15+
- Validação: Zod
- Autenticação: JWT + bcrypt
- CORS: cors middleware
- Environment: dotenv
- Dev Tools: nodemon, ts-node

Hosting/Deploy:
- Backend: Railway / Render / Vercel
- Database: Railway PostgreSQL / Supabase
- Monitoramento: Health checks + logs
```

### **Estrutura de Pastas**
```
backend/
├── src/
│   ├── controllers/          # Controllers das rotas
│   │   ├── authController.ts
│   │   ├── tasksController.ts
│   │   ├── projectsController.ts
│   │   ├── notesController.ts
│   │   ├── habitsController.ts
│   │   └── userController.ts
│   ├── middleware/           # Middlewares customizados
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── cors.ts
│   ├── routes/              # Definição das rotas
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── projects.ts
│   │   ├── notes.ts
│   │   ├── habits.ts
│   │   └── users.ts
│   ├── services/            # Lógica de negócio
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── projectService.ts
│   │   ├── noteService.ts
│   │   ├── habitService.ts
│   │   └── emailService.ts
│   ├── lib/                 # Utilitários e configurações
│   │   ├── database.ts      # Configuração Prisma
│   │   ├── jwt.ts           # Utilitários JWT
│   │   ├── validation.ts    # Schemas Zod
│   │   └── constants.ts
│   ├── types/               # Definições TypeScript
│   │   ├── auth.ts
│   │   ├── task.ts
│   │   ├── user.ts
│   │   └── api.ts
│   └── app.ts               # Configuração Express
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   ├── migrations/          # Migrations SQL
│   └── seed.ts             # Dados iniciais
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🗄️ Integração com PostgreSQL

### **Setup do Banco de Dados**

#### 1. **Configuração do Prisma**
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelos principais (baseados no DATABASE_MIGRATION_PLAN.md)
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relacionamentos
  settings     UserSettings?
  tasks        Task[]
  projects     Project[]
  notes        Note[]
  habits       Habit[]
  sandboxAuth  SandboxAuth?

  @@map("users")
}

model UserSettings {
  id                String  @id @default(cuid())
  userId            String  @unique @map("user_id")
  dailyEnergyBudget Int     @default(12) @map("daily_energy_budget")
  theme             String  @default("light")
  timezone          String  @default("America/Sao_Paulo")
  notifications     Boolean @default(true)
  sandboxPassword   String? @map("sandbox_password")
  sandboxEnabled    Boolean @default(false) @map("sandbox_enabled")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

// ... outros modelos seguindo o DATABASE_MIGRATION_PLAN.md
```

#### 2. **Comandos de Setup**
```bash
# Instalar dependências
npm install prisma @prisma/client
npm install -D prisma

# Inicializar Prisma
npx prisma init

# Gerar schema
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Seed do banco
npx prisma db seed
```

#### 3. **Variáveis de Ambiente**
```env
# .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gerenciador_tasks"
JWT_SECRET="seu_jwt_secret_super_seguro"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

---

## 🔌 API Endpoints

### **Autenticação**
```typescript
POST   /api/auth/register     # Registro de usuário
POST   /api/auth/login        # Login
POST   /api/auth/refresh      # Refresh token
POST   /api/auth/logout       # Logout
GET    /api/auth/me           # Dados do usuário logado
```

### **Tarefas**
```typescript
GET    /api/tasks             # Listar tarefas do usuário
POST   /api/tasks             # Criar nova tarefa
GET    /api/tasks/:id         # Buscar tarefa específica
PUT    /api/tasks/:id         # Atualizar tarefa
DELETE /api/tasks/:id         # Deletar tarefa
POST   /api/tasks/:id/complete    # Completar tarefa
POST   /api/tasks/:id/postpone    # Adiar tarefa
POST   /api/tasks/:id/comments    # Adicionar comentário
```

### **Projetos**
```typescript
GET    /api/projects          # Listar projetos
POST   /api/projects          # Criar projeto
GET    /api/projects/:id      # Buscar projeto
PUT    /api/projects/:id      # Atualizar projeto
DELETE /api/projects/:id      # Deletar projeto
POST   /api/projects/:id/tasks    # Adicionar tarefa ao projeto
```

### **Notas (Sandbox)**
```typescript
GET    /api/notes             # Listar notas
POST   /api/notes             # Criar nota
PUT    /api/notes/:id         # Atualizar nota
DELETE /api/notes/:id         # Deletar nota
POST   /api/sandbox/auth      # Autenticar sandbox
```

### **Hábitos**
```typescript
GET    /api/habits            # Listar hábitos
POST   /api/habits            # Criar hábito
PUT    /api/habits/:id        # Atualizar hábito
DELETE /api/habits/:id        # Deletar hábito
POST   /api/habits/:id/complete   # Marcar conclusão do dia
```

---

## 🔧 Implementação Técnica

### **1. Configuração Base do Express**
```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { taskRoutes } from './routes/tasks';

const app = express();
export const prisma = new PrismaClient();

// Middlewares globais
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
// ... outras rotas

// Middleware de erro global
app.use(errorHandler);

export default app;
```

### **2. Middleware de Autenticação**
```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

### **3. Controller de Tarefas**
```typescript
// src/controllers/tasksController.ts
import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { createTaskSchema, updateTaskSchema } from '../lib/validation';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const tasks = await taskService.getUserTasks(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const validatedData = createTaskSchema.parse(req.body);
    
    const task = await taskService.createTask(userId, validatedData);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos' });
  }
};

export const completeTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    
    const task = await taskService.completeTask(id, userId);
    res.json(task);
  } catch (error) {
    res.status(404).json({ error: 'Tarefa não encontrada' });
  }
};
```

### **4. Service de Tarefas**
```typescript
// src/services/taskService.ts
import { prisma } from '../app';
import { Task, TaskStatus } from '../types/task';

export const getUserTasks = async (userId: string) => {
  return await prisma.task.findMany({
    where: { userId },
    include: {
      project: true,
      comments: {
        orderBy: { createdAt: 'desc' }
      },
      attachments: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const createTask = async (userId: string, data: CreateTaskData) => {
  return await prisma.task.create({
    data: {
      ...data,
      userId,
      status: 'pending'
    },
    include: {
      project: true,
      comments: true,
      attachments: true
    }
  });
};

export const completeTask = async (taskId: string, userId: string) => {
  // Verificar se a tarefa pertence ao usuário
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  // Atualizar tarefa e criar entrada no histórico
  return await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      history: {
        create: {
          action: 'completed',
          details: { completedAt: new Date().toISOString() }
        }
      }
    },
    include: {
      project: true,
      comments: true,
      attachments: true
    }
  });
};
```

---

## 🔄 Migração dos Dados

### **Script de Migração do localStorage**
```typescript
// src/lib/migration.ts
import { prisma } from '../app';

export const migrateFromLocalStorage = async (localStorageData: any, userId: string) => {
  try {
    // Migrar configurações do usuário
    if (localStorageData.authStore?.user?.settings) {
      await prisma.userSettings.upsert({
        where: { userId },
        create: {
          userId,
          ...localStorageData.authStore.user.settings
        },
        update: localStorageData.authStore.user.settings
      });
    }

    // Migrar tarefas
    if (localStorageData.tasksStore?.todayTasks) {
      for (const task of localStorageData.tasksStore.todayTasks) {
        await prisma.task.create({
          data: {
            ...task,
            userId,
            id: undefined // Deixar o Prisma gerar novo ID
          }
        });
      }
    }

    // Migrar projetos
    if (localStorageData.tasksStore?.projects) {
      for (const project of localStorageData.tasksStore.projects) {
        await prisma.project.create({
          data: {
            ...project,
            userId,
            id: undefined,
            backlog: {
              create: project.backlog.map((task: any) => ({
                ...task,
                userId,
                id: undefined
              }))
            }
          }
        });
      }
    }

    // Migrar notas
    if (localStorageData.notesStore?.notes) {
      for (const note of localStorageData.notesStore.notes) {
        await prisma.note.create({
          data: {
            ...note,
            userId,
            id: undefined
          }
        });
      }
    }

    return { success: true, message: 'Migração concluída com sucesso' };
  } catch (error) {
    console.error('Erro na migração:', error);
    throw new Error('Falha na migração dos dados');
  }
};
```

---

## 🚀 Deploy e Produção

### **1. Railway Deploy**
```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[environment]
NODE_ENV = "production"
```

### **2. Docker (Opcional)**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### **3. Scripts Úteis**
```json
// package.json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "migrate": "npx prisma migrate deploy",
    "seed": "npx prisma db seed",
    "generate": "npx prisma generate",
    "studio": "npx prisma studio"
  }
}
```

---

## 🔒 Segurança e Melhores Práticas

### **Medidas de Segurança**
- ✅ **Hash de senhas** com bcrypt (12 rounds)
- ✅ **JWT tokens** com expiração
- ✅ **CORS configurado** para domínio específico
- ✅ **Helmet.js** para headers de segurança
- ✅ **Rate limiting** para APIs críticas
- ✅ **Validação rigorosa** com Zod
- ✅ **SQL Injection protection** via Prisma
- ✅ **Environment variables** para secrets
- ✅ **HTTPS obrigatório** em produção

### **Monitoramento**
```typescript
// src/lib/monitoring.ts
export const logAPICall = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};
```

---

## 📅 Cronograma de Implementação

| Fase | Duração | Descrição |
|------|---------|-----------|
| **Fase 1** | 2-3 dias | Setup inicial + configuração do Prisma |
| **Fase 2** | 3-4 dias | Implementação das APIs core (auth, tasks) |
| **Fase 3** | 2-3 dias | APIs de projetos, notas e hábitos |
| **Fase 4** | 2-3 dias | Integração frontend + testes |
| **Fase 5** | 1-2 dias | Deploy + migração de dados |

**Total estimado: 10-15 dias**

---

## 🎯 Próximos Passos

### **Implementação Imediata**
1. **Criar estrutura base** do projeto backend
2. **Configurar Prisma** com PostgreSQL
3. **Implementar autenticação** JWT
4. **Criar APIs essenciais** (tasks, projects)
5. **Testar integração** com frontend existente

### **Comandos para Iniciar**
```bash
# 1. Criar projeto backend
mkdir backend && cd backend
npm init -y

# 2. Instalar dependências
npm install express typescript ts-node @types/node @types/express
npm install prisma @prisma/client bcrypt jsonwebtoken zod cors helmet morgan
npm install -D nodemon @types/bcrypt @types/jsonwebtoken @types/cors

# 3. Configurar TypeScript
npx tsc --init

# 4. Inicializar Prisma
npx prisma init

# 5. Criar estrutura de pastas
mkdir -p src/{controllers,middleware,routes,services,lib,types}
```

---

## 💡 Considerações Finais

Este plano fornece uma base sólida e escalável para o backend, seguindo as melhores práticas de:

- **Arquitetura limpa** com separação de responsabilidades
- **Segurança robusta** com múltiplas camadas de proteção
- **TypeScript** para tipagem forte e melhor DX
- **Prisma ORM** para queries type-safe e migrations
- **Estrutura modular** para fácil manutenção
- **Deploy simplificado** com Railway/Render
- **Monitoramento** e logs estruturados

O frontend Next.js já está pronto e funcionando com Zustand. A integração será feita gradualmente, mantendo compatibilidade com o localStorage durante a transição.

---

*Documento criado para implementação do backend do Sistema de Gerenciamento de Tarefas*  
*Versão: 1.0 | Data: 04/08/2025*