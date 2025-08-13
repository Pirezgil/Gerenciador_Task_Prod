// ============================================================================
// REMINDERS HOOKS - Hooks React Query para operações de lembretes
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { reminderErrorHandler, withReminderRetry } from '@/lib/errorHandling';
import type { 
  Reminder, 
  CreateReminderData, 
  UpdateReminderData, 
  ReminderFilter, 
  TaskReminderConfig, 
  RecurringTaskReminderConfig, 
  HabitReminderConfig 
} from '@/types/reminder';
import api from '@/lib/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

const reminderKeys = {
  all: ['reminders'] as const,
  lists: () => [...reminderKeys.all, 'list'] as const,
  list: (filters: ReminderFilter) => [...reminderKeys.lists(), { filters }] as const,
  details: () => [...reminderKeys.all, 'detail'] as const,
  detail: (id: string) => [...reminderKeys.details(), id] as const,
  entity: (entityId: string, entityType: 'task' | 'habit') => 
    [...reminderKeys.all, 'entity', entityType, entityId] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

// Hook para buscar todos os lembretes do usuário
export function useReminders(filters?: ReminderFilter) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: reminderKeys.list(filters || {}),
    queryFn: () => withReminderRetry(
      () => remindersApi.getReminders(filters),
      'buscar lembretes'
    ),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: isAuthenticated,
    onError: reminderErrorHandler.fetch
  });
}

// Hook para buscar um lembrete específico
export function useReminder(reminderId: string) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: reminderKeys.detail(reminderId),
    queryFn: () => withReminderRetry(
      () => remindersApi.getReminder(reminderId),
      'buscar lembrete específico'
    ),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated && !!reminderId,
    onError: reminderErrorHandler.fetch
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

// Hook para criar novo lembrete
export function useCreateReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reminderData: CreateReminderData) => 
      withReminderRetry(
        () => remindersApi.createReminder(reminderData),
        'criar lembrete'
      ),
    onSuccess: (newReminder) => {
      // Invalidar listas de lembretes
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      
      // Se o lembrete está associado a uma entidade, invalidar também as queries relacionadas
      if (newReminder.entityId && newReminder.entityType === 'task') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      if (newReminder.entityId && newReminder.entityType === 'habit') {
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      }
    },
    onError: reminderErrorHandler.create
  });
}

// Hook para atualizar lembrete
export function useUpdateReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reminderId, updates }: { reminderId: string; updates: UpdateReminderData }) =>
      withReminderRetry(
        () => remindersApi.updateReminder(reminderId, updates),
        'atualizar lembrete'
      ),
    onSuccess: (updatedReminder) => {
      // Atualizar o lembrete específico no cache
      queryClient.setQueryData(
        reminderKeys.detail(updatedReminder.id),
        updatedReminder
      );
      
      // Invalidar listas de lembretes
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      
      // Invalidar queries de entidades relacionadas se necessário
      if (updatedReminder.entityId && updatedReminder.entityType === 'task') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      if (updatedReminder.entityId && updatedReminder.entityType === 'habit') {
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      }
    },
    onError: reminderErrorHandler.update
  });
}

// Hook para deletar lembrete
export function useDeleteReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reminderId: string) => 
      withReminderRetry(
        () => remindersApi.deleteReminder(reminderId),
        'deletar lembrete'
      ),
    onSuccess: (_, deletedReminderId) => {
      // Remover o lembrete específico do cache
      queryClient.removeQueries({ queryKey: reminderKeys.detail(deletedReminderId) });
      
      // Invalidar listas de lembretes
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      
      // Invalidar queries de tasks e habits para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    onError: reminderErrorHandler.delete
  });
}

// Hook para marcar lembrete como enviado (usado internamente pelo sistema)
export function useMarkReminderSent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reminderId: string) => 
      withReminderRetry(
        () => remindersApi.markReminderSent(reminderId),
        'marcar lembrete como enviado'
      ),
    onSuccess: (_, reminderId) => {
      // Invalidar o lembrete específico para atualizar lastSentAt e nextScheduledAt
      queryClient.invalidateQueries({ queryKey: reminderKeys.detail(reminderId) });
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
    },
    onError: reminderErrorHandler.markSent
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Hook para buscar lembretes de uma tarefa específica
export function useTaskReminders(taskId: string) {
  return useReminders({ entityType: 'task', entityId: taskId });
}

// Hook para buscar lembretes de um hábito específico
export function useHabitReminders(habitId: string) {
  return useReminders({ entityType: 'habit', entityId: habitId });
}

// Hook para buscar lembretes ativos
export function useActiveReminders() {
  return useReminders({ isActive: true });
}

// ============================================================================
// NOVOS HOOKS ESPECÍFICOS PARA TIPOS DE LEMBRETES
// ============================================================================

// Hook para buscar lembretes de tarefa com query key específica
export function useTaskRemindersSpecific(taskId: string | undefined) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: reminderKeys.entity(taskId || '', 'task'),
    queryFn: async () => {
      if (!taskId) return [];
      const response = await api.get(`/tasks/${taskId}/reminders`);
      return response.data.data as Reminder[];
    },
    enabled: isAuthenticated && !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para buscar lembretes de hábito com query key específica
export function useHabitRemindersSpecific(habitId: string | undefined) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: reminderKeys.entity(habitId || '', 'habit'),
    queryFn: async () => {
      if (!habitId) return [];
      const response = await api.get(`/habits/${habitId}/reminders`);
      return response.data.data as Reminder[];
    },
    enabled: isAuthenticated && !!habitId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// ============================================================================
// HOOKS PARA CRIAR LEMBRETES ESPECÍFICOS
// ============================================================================

// Hook para criar lembrete único de tarefa
export function useCreateTaskReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      config 
    }: { 
      taskId: string; 
      config: TaskReminderConfig;
    }) => {
      const response = await api.post(`/tasks/${taskId}/reminders`, config);
      return response.data.data as Reminder;
    },
    onSuccess: (data, variables) => {
      // Invalidar cache dos lembretes da tarefa
      queryClient.invalidateQueries({
        queryKey: reminderKeys.entity(variables.taskId, 'task')
      });
      
      // Adicionar otimisticamente ao cache
      queryClient.setQueryData(
        reminderKeys.entity(variables.taskId, 'task'),
        (old: Reminder[] | undefined) => old ? [...old, data] : [data]
      );
    },
    onError: reminderErrorHandler.create
  });
}

// Hook para criar lembretes recorrentes de tarefa
export function useCreateRecurringTaskReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      config 
    }: { 
      taskId: string; 
      config: RecurringTaskReminderConfig;
    }) => {
      const response = await api.post(`/tasks/${taskId}/recurring-reminders`, config);
      return response.data.data as Reminder[];
    },
    onSuccess: (data, variables) => {
      // Invalidar cache dos lembretes da tarefa
      queryClient.invalidateQueries({
        queryKey: reminderKeys.entity(variables.taskId, 'task')
      });
      
      // Adicionar otimisticamente ao cache
      queryClient.setQueryData(
        reminderKeys.entity(variables.taskId, 'task'),
        (old: Reminder[] | undefined) => old ? [...old, ...data] : data
      );
    },
    onError: reminderErrorHandler.create
  });
}

// Hook para criar lembretes de hábito
export function useCreateHabitReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      habitId, 
      config 
    }: { 
      habitId: string; 
      config: HabitReminderConfig;
    }) => {
      const response = await api.post(`/habits/${habitId}/reminders`, config);
      return response.data.data as Reminder[];
    },
    onSuccess: (data, variables) => {
      // Invalidar cache dos lembretes do hábito
      queryClient.invalidateQueries({
        queryKey: reminderKeys.entity(variables.habitId, 'habit')
      });
      
      // Adicionar otimisticamente ao cache
      queryClient.setQueryData(
        reminderKeys.entity(variables.habitId, 'habit'),
        (old: Reminder[] | undefined) => old ? [...old, ...data] : data
      );
    },
    onError: reminderErrorHandler.create
  });
}

// ============================================================================
// HOOKS PARA DELETAR LEMBRETES ESPECÍFICOS
// ============================================================================

// Hook para deletar lembrete de tarefa
export function useDeleteTaskReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      reminderId, 
      taskId 
    }: { 
      reminderId: string;
      taskId: string;
    }) => {
      await api.delete(`/tasks/reminders/${reminderId}`);
      return { reminderId, taskId };
    },
    onSuccess: (variables) => {
      // Invalidar cache dos lembretes da tarefa
      queryClient.invalidateQueries({
        queryKey: reminderKeys.entity(variables.taskId, 'task')
      });
      
      // Remover otimisticamente do cache
      queryClient.setQueryData(
        reminderKeys.entity(variables.taskId, 'task'),
        (old: Reminder[] | undefined) => 
          old ? old.filter(reminder => reminder.id !== variables.reminderId) : []
      );
    },
    onError: reminderErrorHandler.delete
  });
}

// Hook para deletar lembrete de hábito
export function useDeleteHabitReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      reminderId, 
      habitId 
    }: { 
      reminderId: string;
      habitId: string;
    }) => {
      await api.delete(`/habits/reminders/${reminderId}`);
      return { reminderId, habitId };
    },
    onSuccess: (variables) => {
      // Invalidar cache dos lembretes do hábito
      queryClient.invalidateQueries({
        queryKey: reminderKeys.entity(variables.habitId, 'habit')
      });
      
      // Remover otimisticamente do cache
      queryClient.setQueryData(
        reminderKeys.entity(variables.habitId, 'habit'),
        (old: Reminder[] | undefined) => 
          old ? old.filter(reminder => reminder.id !== variables.reminderId) : []
      );
    },
    onError: reminderErrorHandler.delete
  });
}

// ============================================================================
// HOOKS COMPOSTOS E UTILITÁRIOS
// ============================================================================

// Hook unificado para buscar lembretes de entidade
export function useEntityReminders(
  entityId: string | undefined, 
  entityType: 'task' | 'habit'
) {
  const taskReminders = useTaskRemindersSpecific(
    entityType === 'task' ? entityId : undefined
  );
  const habitReminders = useHabitRemindersSpecific(
    entityType === 'habit' ? entityId : undefined
  );

  if (entityType === 'task') {
    return taskReminders;
  } else {
    return habitReminders;
  }
}

// Hook para obter ações de lembretes baseado no tipo de entidade
export function useReminderActions(entityType: 'task' | 'habit') {
  const createTaskReminder = useCreateTaskReminder();
  const createRecurringTaskReminders = useCreateRecurringTaskReminders();
  const createHabitReminders = useCreateHabitReminders();
  const deleteTaskReminder = useDeleteTaskReminder();
  const deleteHabitReminder = useDeleteHabitReminder();

  if (entityType === 'task') {
    return {
      createSingle: createTaskReminder,
      createRecurring: createRecurringTaskReminders,
      delete: deleteTaskReminder,
    };
  } else {
    return {
      createRecurring: createHabitReminders,
      delete: deleteHabitReminder,
    };
  }
}

// ============================================================================
// HELPERS PARA ANÁLISE DE LEMBRETES
// ============================================================================

export function analyzeReminders(reminders: Reminder[]) {
  const mainReminders = reminders.filter(r => r.subType === 'main' || !r.subType);
  const intervalReminders = reminders.filter(r => r.subType === 'interval');
  const appointmentReminders = reminders.filter(r => 
    r.subType === 'prepare' || r.subType === 'urgent'
  );

  return {
    total: reminders.length,
    main: mainReminders.length,
    intervals: intervalReminders.length,
    appointments: appointmentReminders.length,
    hasMainReminder: mainReminders.length > 0,
    hasIntervalReminders: intervalReminders.length > 0,
    hasAppointmentReminders: appointmentReminders.length > 0,
    mainReminders,
    intervalReminders,
    appointmentReminders
  };
}

export function formatReminderSummary(reminders: Reminder[]) {
  const analysis = analyzeReminders(reminders);
  
  if (analysis.total === 0) {
    return 'Nenhum lembrete configurado';
  }

  const parts = [];
  
  if (analysis.hasMainReminder) {
    parts.push(`${analysis.main} principal${analysis.main > 1 ? 'is' : ''}`);
  }
  
  if (analysis.hasIntervalReminders) {
    parts.push(`${analysis.intervals} intervalo${analysis.intervals > 1 ? 's' : ''}`);
  }
  
  if (analysis.hasAppointmentReminders) {
    parts.push(`${analysis.appointments} automático${analysis.appointments > 1 ? 's' : ''}`);
  }

  return `${analysis.total} lembrete${analysis.total > 1 ? 's' : ''}: ${parts.join(', ')}`;
}