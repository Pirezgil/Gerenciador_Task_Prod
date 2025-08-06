# ANÁLISE DE COMUNICAÇÃO FRONTEND-BACKEND-DATABASE

## RESUMO EXECUTIVO

Esta análise identificou **7 problemas críticos** e **15 problemas menores** na comunicação entre frontend, backend e banco de dados do sistema Gerenciador de Tarefas.

### STATUS GERAL
- ✅ **Frontend**: Estrutura sólida com React Query e hooks bem organizados
- ⚠️ **Backend**: Funcional mas com lacunas em funcionalidades específicas
- ✅ **Database**: Schema bem estruturado com Prisma
- ❌ **Integração**: Múltiplas inconsistências identificadas

---

## PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. 🚨 ROTA AUSENTE: Adicionar Tarefa ao Projeto
**Arquivo:** `backend/src/routes/projects.ts`
**Problema:** Frontend chama `POST /projects/:id/tasks` mas a rota não existe no backend
**Impacto:** Impossível adicionar tarefas a projetos específicos

**Solução:**
```typescript
// Em backend/src/routes/projects.ts - Adicionar:
router.post('/:id/tasks', validate(createTaskInProjectSchema), projectsController.addTaskToProject);
```

### 2. 🚨 INCONSISTÊNCIA DE TIPOS: authApi.getMe()
**Arquivo:** `backend/src/controllers/authController.ts:82`
**Problema:** Backend retorna `{ user }` mas frontend espera o usuário diretamente
**Impacto:** Hook `useMe()` pode falhar

**Solução:**
```typescript
// Alterar backend/src/controllers/authController.ts linha 82:
return res.json({
  success: true,
  data: user, // Remover o wrapper { user }
  timestamp: new Date().toISOString()
});
```

### 3. 🚨 ROTA AUSENTE: Atualizar Configurações do Usuário
**Arquivo:** `backend/src/routes/users.ts`
**Problema:** Frontend chama `PUT /users/settings` mas rota não existe
**Impacto:** Funcionalidade de configurações não funciona

**Solução:**
```typescript
// Em backend/src/routes/users.ts - Adicionar:
router.put('/profile', authenticate, validate(updateUserProfileSchema), userController.updateProfile);
```

### 4. 🚨 TYPES INCOMPATÍVEIS: Task Interface
**Arquivos:** `src/types/task.ts` vs `backend/src/types/task.ts`
**Problema:** Definições diferentes entre frontend e backend
**Impacto:** Dados podem ser perdidos ou mal interpretados

**Solução:**
```typescript
// Alinhar ambos os arquivos para usar:
export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'completed' | 'postponed';
  energyPoints: 1 | 3 | 5;
  projectId?: string;
  type: 'task' | 'brick';
  isRecurring: boolean;
  isAppointment: boolean;
  dueDate?: string;
  rescheduleDate?: string;
  postponementCount: number;
  postponementReason?: string;
  plannedForToday: boolean;
  externalLinks: string[];
  createdAt: string;
  completedAt?: string;
  postponedAt?: string;
  updatedAt: string;
  // Frontend inclui mas backend não mapeia:
  comments: Comment[];
  attachments: Attachment[];
  history: HistoryEntry[];
  // Backend inclui relações:
  project?: ProjectSummary;
  recurrence?: TaskRecurrence;
  appointment?: TaskAppointment;
}
```

### 5. 🚨 FIELD AUSENTE NO DATABASE: updatedAt em Tasks
**Problema:** Backend responde com `updatedAt` mas pode não estar sendo preenchido
**Solução:** Verificar se Prisma está atualizando automaticamente o campo

### 6. 🚨 CONTROLLER AUSENTE: projectsController.addTaskToProject
**Arquivo:** `backend/src/controllers/projectsController.ts`
**Problema:** Método referenciado na rota mas não implementado
**Impacto:** Endpoint `/projects/:id/tasks` falha

**Solução:**
```typescript
export const addTaskToProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
    }

    const { id: projectId } = req.params;
    const taskData: CreateTaskRequest = req.body;
    
    const task = await projectService.addTaskToProject(projectId, req.userId, taskData);
    
    res.status(201).json({
      success: true,
      message: 'Tarefa adicionada ao projeto com sucesso',
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Projeto não encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Projeto não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
};
```

### 7. 🚨 SERVICE MÉTODO AUSENTE: projectService.addTaskToProject
**Arquivo:** `backend/src/services/projectService.ts`
**Problema:** Método chamado pelo controller mas não implementado

**Solução:**
```typescript
export const addTaskToProject = async (projectId: string, userId: string, taskData: CreateTaskRequest): Promise<TaskResponse> => {
  // Verificar se projeto existe e pertence ao usuário
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: userId
    }
  });

  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  // Criar tarefa vinculada ao projeto
  const task = await prisma.task.create({
    data: {
      ...taskData,
      userId,
      projectId,
      status: 'pending'
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      },
      comments: true,
      attachments: true,
      recurrence: true,
      appointment: true
    }
  });

  return formatTaskResponse(task);
};
```

---

## PROBLEMAS MENORES

### Frontend Issues

1. **Hook useTask usa getTasks()**: Ineficiente, deveria ter endpoint específico `GET /tasks/:id`
2. **Fallback localStorage**: Hook `useUser()` tem fallback para localStorage que pode causar inconsistências
3. **Query Key inconsistente**: `queryKeys.tasks.detail()` pode conflitar com cache
4. **Error handling**: Alguns hooks não têm tratamento específico de erro

### Backend Issues

5. **Refresh Token não implementado**: Endpoint retorna 501
6. **Validation Schema ausente**: `createTaskInProjectSchema` não existe
7. **Error Messages**: Algumas mensagens de erro poderiam ser mais específicas
8. **CORS Headers**: Configuração muito permissiva para produção
9. **Rate Limiting**: Não implementado
10. **Logging**: Logs de debug deveriam ser removidos em produção

### Database Issues

11. **Index ausente**: Campo `plannedForToday` em tasks deveria ter índice para queries frequentes
12. **Constraint ausente**: `energyPoints` deveria ter constraint para aceitar apenas 1, 3, 5
13. **Cascade Delete**: Verificar se todas as relações têm cascade apropriado

### API Issues

14. **Paginação ausente**: Endpoints `GET /tasks` e `GET /projects` deveriam suportar paginação
15. **Filtros limitados**: Query parameters para filtros poderiam ser mais robustos

---

## ROTAS EXISTENTES vs ESPERADAS

### ✅ ROTAS FUNCIONAIS
```
GET    /api/auth/me
POST   /api/auth/login
POST   /api/auth/register
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/complete
POST   /api/tasks/:id/postpone
POST   /api/tasks/:id/comments
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/users/settings
```

### ❌ ROTAS AUSENTES (chamadas pelo frontend)
```
POST   /api/projects/:id/tasks    # Crítico
PUT    /api/users/profile         # Crítico
PUT    /api/users/settings        # Médio
GET    /api/tasks/:id            # Menor (otimização)
```

---

## PLANO DE CORREÇÃO PRIORITIZADO

### FASE 1: Correções Críticas (2-3 horas)
1. Implementar `POST /projects/:id/tasks`
2. Corrigir resposta de `authApi.getMe()`
3. Alinhar interfaces Task entre frontend/backend
4. Implementar `PUT /users/profile`

### FASE 2: Melhorias de Estabilidade (1-2 horas)
1. Adicionar `GET /api/tasks/:id`
2. Implementar validação de energia (1,3,5)
3. Adicionar índices no banco
4. Melhorar error handling

### FASE 3: Otimizações (1 hora)
1. Implementar paginação básica
2. Otimizar queries do Prisma
3. Remover logs de debug
4. Melhorar mensagens de erro

---

## COMANDOS PARA TESTES

Após implementar as correções, executar os testes:

```bash
# Backend (porta 3001)
cd backend
npm run dev

# Frontend (porta 3000)  
npm run dev

# Testar endpoints críticos:
curl -X POST http://localhost:3001/api/projects/[PROJECT_ID]/tasks \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test","energyPoints":3}'

curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer [TOKEN]"
```

---

## ARQUIVOS QUE PRECISAM SER MODIFICADOS

### Backend
- `backend/src/routes/projects.ts` ✏️
- `backend/src/controllers/projectsController.ts` ✏️  
- `backend/src/services/projectService.ts` ✏️
- `backend/src/controllers/authController.ts` ✏️
- `backend/src/routes/users.ts` ✏️
- `backend/src/types/task.ts` ✏️
- `backend/src/lib/validation.ts` ✏️

### Frontend
- `src/types/task.ts` ✏️
- `src/hooks/api/useTasks.ts` (opcional)

### Database
- `backend/prisma/schema.prisma` (adicionar constraints/índices)

---

## CONCLUSÃO

O sistema tem uma base sólida mas precisa de 7 correções críticas para funcionar completamente. As inconsistências principais estão na comunicação entre frontend e backend, especialmente em:

1. **Rotas ausentes** no backend que o frontend tenta chamar
2. **Formato de resposta** inconsistente em alguns endpoints  
3. **Definições de tipos** divergentes entre frontend/backend
4. **Funcionalidades incompletas** como adicionar tarefas a projetos

Com as correções implementadas seguindo este plano, o sistema deve funcionar de forma estável e completa.

---

**Documento gerado automaticamente por Claude Code em:** `2025-08-04`  
**Para próxima interação:** Use este documento como referência para implementar as correções na ordem de prioridade listada.