# 🗄️ Plano de Migração para PostgreSQL
**Sistema de Gerenciamento de Tarefas**

---

## 📋 Resumo Executivo

Este documento mapeia toda a estrutura de dados atual do sistema (baseado em Zustand + localStorage) para PostgreSQL, incluindo esquemas de banco, relacionamentos e estratégia de migração.

---

## 🏗️ Estrutura de Dados Atual

### 1. **USUÁRIOS E AUTENTICAÇÃO**

#### Tabela: `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `user_settings`
```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_energy_budget INTEGER DEFAULT 12,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'bege')),
    timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo',
    notifications BOOLEAN DEFAULT true,
    sandbox_password TEXT,
    sandbox_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `sandbox_auth`
```sql
CREATE TABLE sandbox_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT false,
    last_unlock_time TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **PROJETOS**

#### Tabela: `projects`
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) DEFAULT '📁',
    color VARCHAR(7) DEFAULT '#3B82F6',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'planning')),
    deadline DATE,
    sandbox_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **TAREFAS**

#### Tabela: `tasks`
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'postponed')),
    energy_points INTEGER NOT NULL CHECK (energy_points IN (1, 3, 5)),
    type VARCHAR(20) DEFAULT 'task' CHECK (type IN ('task', 'brick')),
    is_recurring BOOLEAN DEFAULT false,
    is_appointment BOOLEAN DEFAULT false,
    due_date DATE,
    reschedule_date DATE,
    postponement_count INTEGER DEFAULT 0,
    postponement_reason TEXT,
    external_links TEXT[], -- Array de URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    postponed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `task_recurrence`
```sql
CREATE TABLE task_recurrence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
    days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) <= 7), -- 0-6 (domingo a sábado)
    last_completed TIMESTAMP WITH TIME ZONE,
    next_due TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `task_appointments`
```sql
CREATE TABLE task_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL,
    preparation_time INTEGER DEFAULT 0, -- minutos
    location TEXT,
    notes TEXT,
    reminder_time INTEGER, -- minutos antes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `task_comments`
```sql
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `task_attachments`
```sql
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(100) NOT NULL, -- MIME type
    size BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT attachments_parent_check CHECK (
        (task_id IS NOT NULL AND note_id IS NULL) OR 
        (task_id IS NULL AND note_id IS NOT NULL)
    )
);
```

#### Tabela: `task_history`
```sql
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'completed', 'postponed', 'rescheduled', 'edited')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB -- Flexível para diferentes tipos de detalhes
);
```

### 4. **NOTAS (CAIXA DE AREIA)**

#### Tabela: `notes`
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `sandbox_layout`
```sql
CREATE TABLE sandbox_layout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 300,
    height INTEGER DEFAULT 200,
    z_index INTEGER DEFAULT 1,
    is_expanded BOOLEAN DEFAULT false,
    color VARCHAR(7) DEFAULT '#FEF3C7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, note_id)
);
```

### 5. **HÁBITOS**

#### Tabela: `habits`
```sql
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '✅',
    color VARCHAR(7) DEFAULT '#10B981',
    target_count INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `habit_frequency`
```sql
CREATE TABLE habit_frequency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'custom')),
    interval_days INTEGER DEFAULT 1,
    days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) <= 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `habit_completions`
```sql
CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    count INTEGER DEFAULT 1,
    notes TEXT,
    
    UNIQUE(habit_id, date)
);
```

### 6. **TEMAS E PERSONALIZAÇÃO**

#### Tabela: `theme_configs`
```sql
CREATE TABLE theme_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    primary_color VARCHAR(7) NOT NULL,
    secondary_color VARCHAR(7) NOT NULL,
    surface_color VARCHAR(7) NOT NULL,
    background_color VARCHAR(7) NOT NULL,
    text_color VARCHAR(7) NOT NULL,
    text_secondary_color VARCHAR(7) NOT NULL,
    border_color VARCHAR(7) NOT NULL,
    shadow_color VARCHAR(7) NOT NULL,
    mode VARCHAR(10) DEFAULT 'light' CHECK (mode IN ('light', 'dark', 'auto')),
    border_radius VARCHAR(10) DEFAULT 'medium' CHECK (border_radius IN ('none', 'small', 'medium', 'large')),
    icon_size VARCHAR(10) DEFAULT 'medium' CHECK (icon_size IN ('small', 'medium', 'large')),
    spacing VARCHAR(15) DEFAULT 'normal' CHECK (spacing IN ('compact', 'normal', 'comfortable')),
    font_family VARCHAR(20) DEFAULT 'system' CHECK (font_family IN ('system', 'inter', 'lora')),
    font_size VARCHAR(10) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    animations BOOLEAN DEFAULT true,
    glassmorphism BOOLEAN DEFAULT false,
    is_preset BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. **SISTEMA DE ENERGIA E ESTATÍSTICAS**

#### Tabela: `daily_energy_logs`
```sql
CREATE TABLE daily_energy_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    budget_total INTEGER NOT NULL,
    energy_used INTEGER DEFAULT 0,
    energy_remaining INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);
```

#### Tabela: `dopamine_animations`
```sql
CREATE TABLE dopamine_animations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    total_leaves INTEGER DEFAULT 0,
    current_leaves INTEGER DEFAULT 0,
    tree_age INTEGER DEFAULT 0 CHECK (tree_age >= 0 AND tree_age <= 100),
    last_growth TIMESTAMP WITH TIME ZONE,
    last_completed_task UUID REFERENCES tasks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Estratégia de Migração

### **Fase 1: Preparação**
1. **Backup dos dados atuais** (localStorage)
2. **Setup do PostgreSQL** com Docker/Railway/Supabase
3. **Instalação das dependências**:
   ```bash
   npm install @prisma/client prisma pg @types/pg
   # ou
   npm install drizzle-orm drizzle-kit postgres
   ```

### **Fase 2: Criação do Schema**
1. Executar scripts SQL de criação das tabelas
2. Criar índices para performance:
   ```sql
   -- Índices essenciais
   CREATE INDEX idx_tasks_user_id ON tasks(user_id);
   CREATE INDEX idx_tasks_project_id ON tasks(project_id);
   CREATE INDEX idx_tasks_status ON tasks(status);
   CREATE INDEX idx_tasks_due_date ON tasks(due_date);
   CREATE INDEX idx_notes_user_id ON notes(user_id);
   CREATE INDEX idx_habits_user_id ON habits(user_id);
   CREATE INDEX idx_habit_completions_date ON habit_completions(date);
   ```

### **Fase 3: Criação da Camada de Dados**
1. **Setup do ORM** (Prisma ou Drizzle)
2. **Criação dos services/repositories**:
   ```typescript
   // Exemplo com Prisma
   class TaskService {
     async createTask(data: CreateTaskData): Promise<Task> {}
     async updateTask(id: string, data: UpdateTaskData): Promise<Task> {}
     async deleteTask(id: string): Promise<void> {}
     async getUserTasks(userId: string): Promise<Task[]> {}
   }
   ```

### **Fase 4: Migração dos Stores**
1. **Substituir localStorage por API calls**
2. **Manter compatibilidade temporária**
3. **Implementar cache local com React Query/SWR**

### **Fase 5: Migração dos Dados**
1. **Script de migração**:
   ```typescript
   async function migrateFromLocalStorage() {
     const userData = localStorage.getItem('auth-store');
     const tasksData = localStorage.getItem('tasks-store');
     const notesData = localStorage.getItem('notes-store');
     // ... migrar dados para PostgreSQL
   }
   ```

---

## 🛠️ Implementação Técnica

### **Stack Recomendada**
- **ORM**: Prisma (tipagem automática) ou Drizzle (performance)
- **Database**: PostgreSQL 15+
- **Hosting**: Railway, Supabase ou Vercel Postgres
- **Cache**: React Query para client-side caching
- **Validação**: Zod para validação de schemas

### **Estrutura de Pastas**
```
src/
├── lib/
│   ├── db/
│   │   ├── schema.prisma          # Schema do Prisma
│   │   ├── migrations/            # Migrations
│   │   └── seed.ts               # Dados iniciais
│   ├── services/
│   │   ├── taskService.ts
│   │   ├── userService.ts
│   │   ├── noteService.ts
│   │   └── habitService.ts
│   └── utils/
│       └── migrate.ts            # Script de migração
├── stores/                       # Stores refatorados
├── hooks/                        # React Query hooks
└── api/                          # API routes (Next.js)
```

### **Exemplo de API Route**
```typescript
// app/api/tasks/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  const tasks = await taskService.getUserTasks(userId);
  return Response.json(tasks);
}

export async function POST(request: Request) {
  const data = await request.json();
  const task = await taskService.createTask(data);
  return Response.json(task);
}
```

---

## 📊 Benefícios da Migração

### **Vantagens**
- ✅ **Persistência real** dos dados
- ✅ **Sincronização** entre dispositivos
- ✅ **Backup automático** e recuperação
- ✅ **Queries complexas** e relatórios
- ✅ **Escalabilidade** para múltiplos usuários
- ✅ **Integridade de dados** com constraints
- ✅ **Performance** com índices otimizados

### **Riscos e Mitigation**
- ⚠️ **Complexidade aumentada** → Usar ORMs e abstrações
- ⚠️ **Latência de rede** → Implementar cache inteligente
- ⚠️ **Custos de hosting** → Começar com tier gratuito
- ⚠️ **Ponto de falha único** → Implementar fallback offline

---

## 🎯 Cronograma Sugerido

| Fase | Duração | Descrição |
|------|---------|-----------|
| 1 | 1-2 dias | Setup inicial e backup |
| 2 | 2-3 dias | Criação do schema e testes |
| 3 | 3-5 dias | Implementação da camada de dados |
| 4 | 5-7 dias | Refatoração dos stores |
| 5 | 2-3 dias | Migração e testes finais |

**Total estimado: 2-3 semanas**

---

## 🔍 Considerações Finais

A migração para PostgreSQL transformará o sistema de um protótipo local em uma aplicação robusta e escalável. O investimento em tempo será compensado pela:

- **Confiabilidade** dos dados
- **Possibilidade de múltiplos usuários**
- **Relatórios e analytics avançados**
- **Backup e recuperação profissional**
- **Base sólida para futuras funcionalidades**

---

*Documento criado em: ${new Date().toISOString()}*
*Versão: 1.0*