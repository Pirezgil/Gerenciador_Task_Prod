# ESPECIFICAÇÃO TÉCNICA: Sistema de Lembretes Diferenciado por Tipo de Atividade

## 📋 ANÁLISE DO SISTEMA ATUAL

**Sistema Base Identificado:**
- **Banco**: Modelo `Reminder` (`backend/prisma/schema.prisma:432-455`)
- **Backend Types**: `backend/src/types/reminder.ts`
- **Frontend Types**: `src/types/reminder.ts`
- **Tipos de Atividades Mapeados**:
  - Task Normal: `type="task"`, `isAppointment=false`, `isRecurring=false`
  - Task Tijolo: `type="task"` com `energyPoints` elevados
  - Task Recorrente: `isRecurring=true` + modelo `TaskRecurrence`
  - Task Compromisso: `isAppointment=true` + modelo `TaskAppointment`
  - Hábito: Modelo `Habit` + `HabitFrequency`

---

## 🎯 ESPECIFICAÇÕES POR TIPO DE ATIVIDADE

### 1. TAREFAS NORMAIS E TAREFAS TIJOLOS

**Identificação no Sistema:**
- `Task.type = "task"`
- `Task.isAppointment = false` 
- `Task.isRecurring = false`
- Diferenciação por `energyPoints` (Tijolo = energyPoints > 8)

**Funcionalidade de Lembrete:**
```typescript
interface TaskReminderConfig {
  enabled: boolean;
  reminderDate: string; // "YYYY-MM-DD"
  reminderTime: string; // "HH:MM"
  notificationTypes: ('push' | 'email')[];
}
```

**Implementação Backend:**
- **Endpoint**: `POST /api/tasks/{taskId}/reminders`
- **Controller**: `tasksController.ts` → `createTaskReminder()`
- **Service**: `reminderService.ts` → `createSingleReminder()`
- **Database**: Criar registro em `Reminder` com:
  - `entityType: 'task'`
  - `type: 'scheduled'`
  - `scheduledTime: "HH:MM"`
  - `daysOfWeek: []` (array vazio para lembrete único)

**Implementação Frontend:**
- **Componente**: Adicionar `SingleReminderPicker` em `TaskDetailClient.tsx`
- **Hook**: `useCreateReminder()` em `src/hooks/api/useReminders.ts`

---

### 2. TAREFAS RECORRENTES

**Identificação no Sistema:**
- `Task.isRecurring = true`
- Relacionada com `TaskRecurrence.frequency` e `TaskRecurrence.daysOfWeek`

**Funcionalidade de Lembrete:**
```typescript
interface RecurringTaskReminderConfig {
  enabled: boolean;
  recurrenceType: 'daily' | 'specific_days';
  daysOfWeek: number[]; // [0,1,2,3,4,5,6] onde 0=domingo
  reminderTime: string; // "08:00"
  
  // Lembretes em intervalo
  intervalEnabled: boolean;
  intervalMinutes: number; // 30, 60, etc.
  intervalStartTime: string; // "09:00"
  intervalEndTime: string; // "18:00"
  notificationTypes: ('push' | 'email')[];
}
```

**Implementação Backend:**
- **Endpoint**: `POST /api/tasks/{taskId}/recurring-reminders`
- **Controller**: `tasksController.ts` → `createRecurringTaskReminders()`
- **Service**: `reminderService.ts` → `createRecurringReminders()`
- **Database**: Criar múltiplos registros em `Reminder`:
  1. Lembrete principal: `type: 'recurring'`, `scheduledTime`, `daysOfWeek`
  2. Lembretes de intervalo: múltiplos registros `type: 'recurring'` com horários calculados

**Implementação Frontend:**
- **Componente**: `RecurringReminderPicker` em `TaskDetailClient.tsx`
- **Lógica**: Calcular todos os horários de intervalo no frontend antes de enviar

---

### 3. HÁBITOS

**Identificação no Sistema:**
- Modelo `Habit` com `HabitFrequency`
- `HabitFrequency.type`, `HabitFrequency.daysOfWeek`

**Funcionalidade de Lembrete:**
```typescript
interface HabitReminderConfig {
  enabled: boolean;
  recurrenceType: 'daily' | 'specific_days';
  daysOfWeek: number[];
  reminderTime: string;
  
  // Lembretes em intervalo (igual às tarefas recorrentes)
  intervalEnabled: boolean;
  intervalMinutes: number;
  intervalStartTime: string;
  intervalEndTime: string;
  notificationTypes: ('push' | 'email')[];
}
```

**Implementação Backend:**
- **Endpoint**: `POST /api/habits/{habitId}/reminders`
- **Controller**: `habitsController.ts` → `createHabitReminders()`
- **Service**: `reminderService.ts` → `createHabitReminders()`
- **Database**: Mesma lógica das tarefas recorrentes, mas com `entityType: 'habit'`

**Implementação Frontend:**
- **Componente**: Reutilizar `RecurringReminderPicker` em `HabitDetailClient.tsx`

---

### 4. TAREFAS DE COMPROMISSO

**Identificação no Sistema:**
- `Task.isAppointment = true`
- Relacionada com `TaskAppointment.scheduledTime` e `TaskAppointment.preparationTime`

**Funcionalidade de Lembrete AUTOMÁTICO:**
```typescript
interface AppointmentAutoReminder {
  // Calculado automaticamente
  prepareReminder: {
    time: string; // compromisso - (2 * preparationTime + 10min)
    message: "Prepare-se para seu compromisso";
    type: "prepare";
  };
  urgentReminder: {
    time: string; // compromisso - (2 * preparationTime)
    message: "Compromisso ultra urgente!";
    type: "urgent";
  };
}
```

**Cálculo de Horários:**
```typescript
function calculateAppointmentReminders(
  appointmentTime: string, // "10:00"
  preparationTime: number // 10 (minutos)
) {
  const appointment = new Date(`2024-01-01 ${appointmentTime}`);
  const doublePrep = preparationTime * 2;
  
  return {
    prepareTime: new Date(appointment.getTime() - (doublePrep + 10) * 60000),
    urgentTime: new Date(appointment.getTime() - doublePrep * 60000)
  };
}
```

**Implementação Backend:**
- **Trigger**: Ao criar/editar `TaskAppointment`, automaticamente criar lembretes
- **Service**: `taskService.ts` → `createAppointmentTask()` chama `reminderService.createAppointmentReminders()`
- **Database**: Criar 2 registros em `Reminder` automaticamente:
  - Lembrete 1: `type: 'before_due'`, `minutesBefore: (2 * prepTime + 10)`
  - Lembrete 2: `type: 'before_due'`, `minutesBefore: (2 * prepTime)`

**Implementação Frontend:**
- **Automático**: Nenhuma UI adicional necessária
- **Visualização**: Mostrar os lembretes calculados em `TaskDetailClient.tsx` como informação

---

## 🔧 ALTERAÇÕES NECESSÁRIAS NO BANCO DE DADOS

### Extensão do Modelo Reminder:
```prisma
model Reminder {
  // ... campos existentes ...
  
  // Novos campos para suporte aos intervalos
  intervalEnabled     Boolean   @default(false) @map("interval_enabled")
  intervalMinutes     Int?      @map("interval_minutes")  
  intervalStartTime   String?   @map("interval_start_time")
  intervalEndTime     String?   @map("interval_end_time")
  
  // Campo para identificar sub-tipo de lembrete
  subType            String?   @map("sub_type") // 'main', 'interval', 'prepare', 'urgent'
  parentReminderId   String?   @map("parent_reminder_id")
}
```

---

## 📂 NOVOS COMPONENTES NECESSÁRIOS

### Frontend Components:
1. **`SingleReminderPicker.tsx`** - Para tarefas normais/tijolos
2. **`RecurringReminderPicker.tsx`** - Para recorrentes e hábitos  
3. **`AppointmentReminderDisplay.tsx`** - Mostrar lembretes automáticos calculados
4. **`IntervalReminderConfig.tsx`** - Configuração de intervalos

### Backend Services:
1. **`appointmentReminderService.ts`** - Lógica específica para compromissos
2. **`intervalReminderService.ts`** - Geração de lembretes em intervalo
3. **`reminderCalculator.ts`** - Utilitários para cálculos de horários

---

## 🔄 FLUXO DE IMPLEMENTAÇÃO

### Fase 1 - Estrutura Base:
1. Atualizar `schema.prisma` com novos campos
2. Executar migração do banco
3. Atualizar tipos TypeScript (backend + frontend)

### Fase 2 - Backend:
4. Implementar serviços de cálculo de lembretes
5. Atualizar controllers para suportar novos tipos
6. Criar endpoints específicos por tipo de atividade

### Fase 3 - Frontend:
7. Criar componentes de configuração de lembretes
8. Integrar componentes nas páginas de detalhes existentes
9. Implementar hooks para comunicação com a API

### Fase 4 - Testes e Refinamento:
10. Testar cada tipo de atividade
11. Validar cálculos automáticos de compromissos
12. Otimizar performance e UX

---

## 📊 EXEMPLOS PRÁTICOS

### Exemplo 1 - Tarefa Normal:
```
Tarefa: "Estudar TypeScript"
Configuração: Data: 10/08/2024, Horário: 14:00
Resultado: 1 lembrete em 10/08 às 14:00
```

### Exemplo 2 - Tarefa Recorrente:
```
Tarefa: "Fazer exercícios"  
Configuração:
- Dias: Segunda, Quarta, Sexta
- Lembrete Principal: 06:00
- Intervalo: 30min entre 06:00-18:00

Resultado: 
- Lembrete 06:00 (seg, qua, sex)
- Lembretes 06:30, 07:00, 07:30... até 18:00 (seg, qua, sex)
```

### Exemplo 3 - Compromisso:
```
Compromisso: "Reunião com cliente"
Horário: 10:00, Preparação: 15min

Cálculo Automático:
- Lembrete "Prepare-se": 09:20 (10:00 - 30min - 10min)
- Lembrete "Ultra Urgente": 09:30 (10:00 - 30min)
```

### Exemplo 4 - Hábito:
```
Hábito: "Meditar"
Configuração:
- Recorrência: Diariamente  
- Lembrete Principal: 07:00
- Intervalo: 2h entre 07:00-21:00

Resultado:
- Lembretes diários: 07:00, 09:00, 11:00, 13:00, 15:00, 17:00, 19:00, 21:00
```

---

## 🚨 CONSIDERAÇÕES IMPORTANTES

### Performance:
- Lembretes de intervalo podem gerar muitos registros no banco
- Implementar limpeza automática de lembretes antigos
- Usar índices otimizados para consultas por `nextScheduledAt`

### UX/UI:
- Interface intuitiva para configuração de intervalos
- Preview dos lembretes que serão criados
- Validação de horários (início < fim)

### Notificações:
- Integração com sistema de push notifications existente
- Rate limiting para evitar spam de notificações
- Opção de "snooze" em lembretes de intervalo

---

*Documento gerado seguindo as diretrizes do perfil Analista de Fluxo de Funcionalidades Ponta-a-Ponta*