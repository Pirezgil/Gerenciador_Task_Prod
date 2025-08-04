# 🎯 Guia de Integração Frontend com Backend

## 📋 Resumo da Implementação

Sistema frontend **COMPLETAMENTE REFATORADO** para consumir APIs do backend PostgreSQL em vez do localStorage.

---

## 🏗️ Estrutura Implementada

### **1. Cliente HTTP & Cache**
```
src/lib/
├── api.ts              # Cliente Axios + APIs endpoints
├── queryClient.ts      # TanStack Query config + cache
└── constants.ts        # Constantes (existente)

src/providers/
└── QueryProvider.tsx   # Provider React Query
```

### **2. Hooks de API**
```
src/hooks/api/
├── useAuth.ts          # Autenticação (login, registro, logout)
├── useTasks.ts         # CRUD tarefas + otimistic updates
├── useProjects.ts      # CRUD projetos + backlog
└── index.ts            # Exports centralizados
```

### **3. Stores Refatorados** 
```
src/stores/
└── authStore.v2.ts     # Store auth simplificado (sem API logic)
```

### **4. Componentes de Auth**
```
src/components/auth/
├── AuthProvider.tsx    # Provider auth integrado
└── LoginForm.tsx       # Form login com hooks API
```

### **5. Componentes Atualizados**
```
src/components/
├── bombeiro/TaskItem.v2.tsx    # TaskItem usando hooks API
└── shared/MigrationHelper.tsx  # Helper migração localStorage → API
```

---

## 🔄 Como Migrar Componentes Existentes

### **Antes (localStorage):**
```typescript
// ❌ Método antigo
import { useTasksStore } from '@/stores/tasksStore';

function TaskList() {
  const { todayTasks, completeTask } = useTasksStore();
  
  return (
    <div>
      {todayTasks.map(task => (
        <div key={task.id}>
          {task.description}
          <button onClick={() => completeTask(task.id)}>
            Completar
          </button>
        </div>
      ))}
    </div>
  );
}
```

### **Depois (API):**
```typescript
// ✅ Método novo
import { useTasks, useCompleteTask } from '@/hooks/api/useTasks';

function TaskList() {
  const { data: tasks = [], isLoading } = useTasks();
  const completeTask = useCompleteTask();
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          {task.description}
          <button 
            onClick={() => completeTask.mutate(task.id)}
            disabled={completeTask.isPending}
          >
            {completeTask.isPending ? 'Salvando...' : 'Completar'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Passos para Ativação

### **1. Atualizar Layout Principal**
```typescript
// src/app/layout.tsx - JÁ IMPLEMENTADO ✅
<QueryProvider>
  <ThemeProvider>
    <AuthMiddleware>
      {children}
    </AuthMiddleware>
  </ThemeProvider>
</QueryProvider>
```

### **2. Substituir AuthStore**
```bash
# Renomear stores
mv src/stores/authStore.ts src/stores/authStore.old.ts
mv src/stores/authStore.v2.ts src/stores/authStore.ts
```

### **3. Atualizar Imports nos Componentes**
```typescript
// Substituir imports antigos:
import { useTasksStore } from '@/stores/tasksStore';

// Por novos hooks API:
import { useTasks, useCreateTask } from '@/hooks/api/useTasks';
```

### **4. Configurar Variáveis de Ambiente**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🔧 Hooks Disponíveis

### **Autenticação**
```typescript
import { 
  useLogin,           // Login usuário
  useRegister,        // Registro usuário  
  useLogout,          // Logout
  useMe,              // Dados usuário atual
  useIsAuthenticated  // Status autenticação
} from '@/hooks/api/useAuth';
```

### **Tarefas**
```typescript
import { 
  useTasks,           // Listar tarefas
  useCreateTask,      // Criar tarefa
  useUpdateTask,      // Atualizar tarefa
  useCompleteTask,    // Completar tarefa
  usePostponeTask,    // Adiar tarefa
  useDeleteTask,      // Deletar tarefa
  useAddComment,      // Adicionar comentário
  useTodayTasks,      // Tarefas de hoje
  useTasksStats       // Estatísticas
} from '@/hooks/api/useTasks';
```

### **Projetos**
```typescript
import { 
  useProjects,        // Listar projetos
  useCreateProject,   // Criar projeto
  useUpdateProject,   // Atualizar projeto
  useDeleteProject,   // Deletar projeto
  useAddTaskToProject // Adicionar tarefa ao projeto
} from '@/hooks/api/useProjects';
```

---

## ⚡ Recursos Implementados

### **✅ Otimistic Updates**
- Updates instantâneos na UI
- Rollback automático em caso de erro
- UX fluída mesmo com latência

### **✅ Cache Inteligente**
- Cache automático com React Query
- Invalidação seletiva de dados
- Sincronização entre abas

### **✅ Loading States**
- Estados de loading para todas operações
- Disabled buttons durante mutations
- Feedback visual para usuário

### **✅ Error Handling**
- Tratamento de erros HTTP
- Retry automático
- Fallback para localStorage quando necessário

### **✅ Token Management**
- JWT automático nas requisições
- Refresh token quando necessário
- Logout automático quando token expira

### **✅ Migration Helper**
- Componente para migrar dados localStorage → API
- Interface amigável
- Backup automático

---

## 🔄 Plano de Rollout

### **Fase 1: Preparação** ✅
- [x] Cliente HTTP configurado
- [x] React Query setup
- [x] Hooks de API criados
- [x] Stores simplificados

### **Fase 2: Componentes Core**
- [ ] Atualizar `TasksPageClient.tsx`
- [ ] Atualizar `BombeiroPage.tsx`
- [ ] Atualizar `ArquitetoPage.tsx`
- [ ] Atualizar modais de criação

### **Fase 3: Componentes Avançados**
- [ ] Atualizar `CaixaDeAreiaPage.tsx`
- [ ] Atualizar `HabitList.tsx`
- [ ] Atualizar sistema de comentários

### **Fase 4: Testes & Refinamentos**
- [ ] Testar fluxos completos
- [ ] Ajustar cache strategies
- [ ] Implementar error boundaries
- [ ] Performance optimizations

---

## 🚨 Pontos Críticos

### **1. Backup de Dados**
```bash
# Antes de ativar, fazer backup do localStorage
# O MigrationHelper faz isso automaticamente
```

### **2. Configuração Backend**
```bash
# Backend deve estar rodando em:
http://localhost:3001

# Para testar:
curl http://localhost:3001/health
```

### **3. Variáveis de Ambiente**
```bash
# Verificar se está configurado:
echo $NEXT_PUBLIC_API_URL
```

### **4. CORS**
```typescript
// Backend deve permitir origin do frontend:
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})
```

---

## 📊 Benefícios da Migração

### **Antes (localStorage)**
- ❌ Dados perdidos ao limpar navegador
- ❌ Sem sincronização entre dispositivos  
- ❌ Sem backup automático
- ❌ Limitação de storage
- ❌ Sem queries complexas

### **Depois (API + PostgreSQL)**
- ✅ Persistência real dos dados
- ✅ Sincronização multi-device
- ✅ Backup automático
- ✅ Storage ilimitado
- ✅ Queries e relatórios avançados
- ✅ Múltiplos usuários

---

## 🎯 Próximos Passos

1. **Ativar backend** em desenvolvimento
2. **Testar migração** com dados de exemplo
3. **Atualizar componentes** um por vez
4. **Testar fluxos** críticos
5. **Deploy** quando estável

---

*Guia criado para migração completa frontend → backend integration*  
*Versão: 1.0 | Data: 04/08/2025*