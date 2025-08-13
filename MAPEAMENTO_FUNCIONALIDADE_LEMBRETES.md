# MAPEAMENTO DE FUNCIONALIDADE: Sistema de Lembretes para Tarefas e Hábitos

**Data:** 08/08/2025  
**Analista:** Claude (Engenheira de Sistemas - Feature Tracing)  
**Sistema:** Gerenciador_Task  
**Fluxo:** FRONTEND → BACKEND → BANCO DE DADOS → BACKEND → FRONTEND

---

## ANÁLISE ATUAL DO SISTEMA

### 🔍 Estrutura Identificada

**BANCO DE DADOS (Prisma Schema):**
- ✅ Modelo `Task` (linhas 97-132) já possui campo `rescheduleDate` e `postponedAt`
- ✅ Modelo `TaskAppointment` (linhas 149-163) já possui `reminderTime` (linha 156)
- ✅ Modelo `Habit` (linhas 244-264) existe mas SEM campos de lembrete
- ✅ Modelo `User` possui `notifications: Boolean` em `UserSettings` (linha 50)

**FRONTEND ATUAL:**
- ✅ `NewTaskModal.tsx` (linhas 124, 448-449) já implementa `reminderTime: 15` para compromissos
- ✅ `NewHabitModal.tsx` não possui funcionalidade de lembrete
- ✅ Componentes de UI existem para tarefas e hábitos

**BACKEND ATUAL:**  
- ✅ `taskService.ts` gerencia tarefas com appointment
- ✅ `habitService.ts` gerencia hábitos básicos
- ✅ Rotas `/api/tasks` e `/api/habits` funcionais

---

## FUNCIONALIDADE: Sistema de Lembretes Unificado

### 1. **ORIGEM (Frontend - Interface do Usuário)**

**Componentes Principais:**
- `src/components/shared/NewTaskModal.tsx` (adicionar campos de lembrete)
- `src/components/habits/NewHabitModal.tsx` (adicionar funcionalidade completa)
- `src/components/shared/TaskEditModal.tsx` (atualizar para lembretes)
- `src/components/shared/HabitEditModal.tsx` (atualizar para lembretes)
- **NOVO:** `src/components/reminders/ReminderModal.tsx` (modal de configuração)

**Campos do Formulário para Tarefas:**
- ✅ **Existente:** Checkbox "Compromisso com Horário" 
- ✅ **Existente:** `reminderTime` (15 minutos padrão)
- 🆕 **Adicionar:** Lembrete customizável (5, 10, 15, 30, 60 minutos)
- 🆕 **Adicionar:** Múltiplos lembretes por tarefa
- 🆕 **Adicionar:** Tipo de notificação (push, email, ambos)

**Campos do Formulário para Hábitos:**
- 🆕 **Adicionar:** Checkbox "Ativar Lembretes"  
- 🆕 **Adicionar:** Horário de lembrete
- 🆕 **Adicionar:** Frequência do lembrete (diário, personalizado)
- 🆕 **Adicionar:** Dias específicos da semana
- 🆕 **Adicionar:** Mensagem personalizada do lembrete

### 2. **ENVIO DE DADOS (Frontend - Lógica do Cliente)**

**Hooks de Mutação:**
- ✅ **Existente:** `src/hooks/api/useTasks.ts` - `useCreateTask`, `useUpdateTask`
- ✅ **Existente:** `src/hooks/api/useHabits.ts` - `useCreateHabit`, `useUpdateHabit`  
- 🆕 **Criar:** `src/hooks/api/useReminders.ts` - `useCreateReminder`, `useUpdateReminder`, `useDeleteReminder`

**Payload da API (Tarefas):**
```typescript
{
  // dados existentes...
  reminders?: [{
    type: 'before_due' | 'scheduled' | 'recurring',
    minutesBefore: number,
    notificationTypes: ['push', 'email'],
    customMessage?: string,
    isActive: boolean
  }]
}
```

**Payload da API (Hábitos):**  
```typescript
{
  // dados existentes...
  reminders?: [{
    scheduledTime: string, // "08:00"
    daysOfWeek: number[], // [1,2,3,4,5]
    notificationTypes: ['push', 'email'],
    message: string,
    isActive: boolean
  }]
}
```

### 3. **RECEPÇÃO (Backend - Camada de Roteamento)**

**Endpoints da API:**
- ✅ **Existente:** `POST /api/tasks` (backend/src/routes/tasks.ts:21)
- ✅ **Existente:** `PUT /api/tasks/:id` (backend/src/routes/tasks.ts:24)
- ✅ **Existente:** `POST /api/habits` (backend/src/routes/habits.ts:13)  
- ✅ **Existente:** `PUT /api/habits/:id` (backend/src/routes/habits.ts:14)
- 🆕 **Criar:** `GET /api/reminders` - listar lembretes do usuário
- 🆕 **Criar:** `POST /api/reminders` - criar lembrete avulso
- 🆕 **Criar:** `PUT /api/reminders/:id` - atualizar lembrete
- 🆕 **Criar:** `DELETE /api/reminders/:id` - deletar lembrete

**Arquivos de Rota:**
- ✅ `backend/src/routes/tasks.ts` (atualizar controllers)
- ✅ `backend/src/routes/habits.ts` (atualizar controllers)  
- 🆕 `backend/src/routes/reminders.ts` (criar novo)

**Controllers:**
- ✅ `backend/src/controllers/tasksController.ts` (atualizar)
- ✅ `backend/src/controllers/habitsController.ts` (atualizar)
- 🆕 `backend/src/controllers/remindersController.ts` (criar novo)

### 4. **PROCESSAMENTO (Backend - Lógica de Negócio)**

**Arquivos de Serviço:**
- ✅ `backend/src/services/taskService.ts` (atualizar métodos create/update)
- ✅ `backend/src/services/habitService.ts` (atualizar métodos create/update)
- 🆕 `backend/src/services/reminderService.ts` (criar novo)
- 🆕 `backend/src/services/notificationService.ts` (criar novo)
- 🆕 `backend/src/services/reminderScheduler.ts` (criar novo - cron jobs)

**Validação:**
- ✅ `backend/src/lib/validation.ts` - atualizar `createTaskSchema` e `updateTaskSchema`
- ✅ `backend/src/lib/validation.ts` - atualizar `createHabitSchema` 
- 🆕 Adicionar `createReminderSchema`, `updateReminderSchema`

### 5. **PERSISTÊNCIA (Backend - Camada de Dados)**

**Operações do Prisma:**

**Modelos EXISTENTES (atualizar):**
```prisma
// TaskAppointment JÁ POSSUI reminderTime
model TaskAppointment {
  reminderTime Int? @map("reminder_time") // ✅ JÁ EXISTS
  // adicionar campos para múltiplos lembretes
}
```

**Modelos NOVOS (criar):**
```prisma
model Reminder {
  id               String    @id @default(cuid())
  userId           String    @map("user_id")
  entityId         String?   @map("entity_id") // taskId ou habitId
  entityType       String    @map("entity_type") // 'task', 'habit', 'standalone'
  type             String    // 'before_due', 'scheduled', 'recurring'
  scheduledTime    String?   @map("scheduled_time") // "08:00" for habits
  minutesBefore    Int?      @map("minutes_before") // for tasks
  daysOfWeek       Int[]     @map("days_of_week")
  notificationTypes String[] @map("notification_types") // ['push', 'email']
  message          String?
  isActive         Boolean   @default(true) @map("is_active")
  lastSentAt       DateTime? @map("last_sent_at")
  nextScheduledAt  DateTime? @map("next_scheduled_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("reminders")
}
```

**Operações:**
- `prisma.reminder.create()` - criar lembretes
- `prisma.reminder.findMany()` - buscar lembretes ativos 
- `prisma.reminder.update()` - atualizar configurações
- `prisma.reminder.delete()` - remover lembretes

### 6. **RESPOSTA (Backend -> Frontend)**

**Formato da Resposta de Sucesso (Task):**
```json
{
  "id": "task_id",
  "description": "Tarefa exemplo",
  // campos existentes...
  "reminders": [{
    "id": "reminder_id", 
    "type": "before_due",
    "minutesBefore": 15,
    "notificationTypes": ["push"],
    "isActive": true,
    "nextScheduledAt": "2025-08-08T14:45:00Z"
  }]
}
```

**Formato da Resposta de Sucesso (Habit):**
```json
{
  "id": "habit_id",
  "name": "Beber água",
  // campos existentes...
  "reminders": [{
    "id": "reminder_id",
    "scheduledTime": "08:00", 
    "daysOfWeek": [1,2,3,4,5],
    "message": "Hora de beber água! 💧",
    "isActive": true
  }]
}
```

**Tratamento de Erros:**
- `400`: Dados de lembrete inválidos
- `409`: Conflito de horários de lembrete
- `422`: Limite de lembretes excedido (max 5 por item)

### 7. **ATUALIZAÇÃO (Frontend - Sincronização da UI)**

**Mecanismo de Atualização:**
- ✅ **React Query**: Invalidação automática das keys `['tasks']` e `['habits']`
- 🆕 **Nova Key**: `['reminders', userId]` para lembretes
- ✅ **Zustand**: Store existente para modals
- 🆕 **Novo Store**: `useRemindersStore` para gerenciar estado dos lembretes
- 🆕 **Service Worker**: Para notificações push no browser
- 🆕 **Cron Job Simulator**: Verificação periódica de lembretes no frontend

**Componentes de UI Atualizados:**
- 🆕 `src/components/reminders/ReminderCard.tsx` - card individual
- 🆕 `src/components/reminders/RemindersList.tsx` - lista de lembretes  
- 🆕 `src/components/reminders/NotificationToast.tsx` - toast de notificação
- 🆕 `src/components/reminders/ReminderSettings.tsx` - configurações gerais

---

## INFRAESTRUTURA ADICIONAL NECESSÁRIA

### 🔧 Serviços de Background
1. **Scheduler Service** (`backend/src/services/reminderScheduler.ts`)
   - Cron jobs para verificar lembretes pendentes
   - Integração com node-cron ou bull queue
   
2. **Notification Service** (`backend/src/services/notificationService.ts`)  
   - Push notifications (Firebase/OneSignal)
   - Email notifications (SendGrid/Nodemailer)
   - SMS notifications (Twilio - futuro)

### 🗄️ Migrações do Banco
1. **Adicionar tabela `Reminder`** ao schema.prisma
2. **Adicionar relacionamento** User -> Reminder
3. **Migração** para dados existentes de `TaskAppointment.reminderTime`

### 🎨 Componentes de UI Novos
1. **ReminderPicker** - seletor visual de lembretes
2. **NotificationCenter** - central de notificações
3. **ReminderStatus** - status visual dos lembretes ativos

---

## ORDEM DE IMPLEMENTAÇÃO SUGERIDA

### Fase 1: Base de Dados
1. ✅ Atualizar `schema.prisma` com modelo `Reminder`
2. ✅ Criar migration do banco
3. ✅ Atualizar tipos TypeScript

### Fase 2: Backend Core  
1. ✅ Criar `reminderService.ts`
2. ✅ Criar `remindersController.ts`
3. ✅ Adicionar rotas em `routes/reminders.ts`
4. ✅ Atualizar validações

### Fase 3: Frontend Base
1. ✅ Criar hooks `useReminders.ts`  
2. ✅ Criar store `useRemindersStore.ts`
3. ✅ Atualizar `NewTaskModal` e `NewHabitModal`

### Fase 4: Notificações
1. ✅ Implementar `notificationService.ts`
2. ✅ Configurar Service Worker
3. ✅ Criar `reminderScheduler.ts`

### Fase 5: UI Avançada
1. ✅ Componentes de lembretes
2. ✅ Central de notificações  
3. ✅ Configurações do usuário

---

## CONSIDERAÇÕES TÉCNICAS ADICIONAIS

### 🔐 Segurança e Permissões
- **Validação de Usuário**: Lembretes só podem ser criados/editados pelo próprio usuário
- **Rate Limiting**: Máximo 5 lembretes por tarefa/hábito
- **Sanitização**: Mensagens customizadas devem ser sanitizadas para prevenir XSS

### ⚡ Performance
- **Indexação**: Índices no banco para `userId`, `nextScheduledAt`, `isActive`
- **Cache**: Redis para lembretes ativos em memória
- **Batching**: Processar notificações em lotes para melhor performance

### 🔄 Sincronização
- **Offline First**: Service Worker para funcionar offline
- **Sync on Reconnect**: Sincronização automática quando voltar online
- **Real-time Updates**: WebSockets para atualizações em tempo real

---

**🎯 RESULTADO ESPERADO:** Sistema completo de lembretes que permite aos usuários configurar notificações personalizáveis tanto para tarefas quanto para hábitos, com suporte a múltiplos tipos de notificação e horários flexíveis, seguindo o fluxo completo FRONTEND → BACKEND → BANCO DE DADOS → BACKEND → FRONTEND.

---

**📊 MÉTRICAS DE SUCESSO:**
- ✅ Usuários conseguem criar lembretes em menos de 3 cliques
- ✅ Notificações são entregues com precisão de ±1 minuto
- ✅ 95% de disponibilidade do sistema de lembretes
- ✅ Interface responsiva e acessível em todos os dispositivos