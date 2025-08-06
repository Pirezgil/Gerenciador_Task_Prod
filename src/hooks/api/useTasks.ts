// ============================================================================
// TASKS HOOKS - Hooks React Query para operações de tarefas
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import type { Task, Comment } from '@/types/task';

// ============================================================================
// QUERY HOOKS
// ============================================================================

// Hook para buscar todas as tarefas do usuário
export function useTasks() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: tasksApi.getTasks,
    staleTime: 2 * 60 * 1000, // 2 minutos (dados mais frescos para tarefas)
    enabled: isAuthenticated, // Só fazer requisição se autenticado
  });
}

// Hook para buscar uma tarefa específica
export function useTask(taskId: string) {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: () => tasksApi.getTask(taskId),
    enabled: !!taskId && isAuthenticated, // Só fazer requisição se autenticado e taskId válido
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

// Hook para criar nova tarefa
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onMutate: async (newTask) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // Snapshot do estado anterior
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);

      // Otimistic update
      if (previousTasks) {
        const optimisticTask: Task = {
          ...newTask,
          id: `temp-${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          completedAt: undefined,
          postponedAt: undefined,
          updatedAt: new Date().toISOString(),
          comments: [],
          attachments: [],
          externalLinks: [],
          history: [],
        };

        queryClient.setQueryData<Task[]>(queryKeys.tasks.all, [...previousTasks, optimisticTask]);
      }

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Revert otimistic update em caso de erro
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previousTasks);
      }
    },
    onSettled: () => {
      // Sempre invalidar após sucesso ou erro
      invalidateQueries.tasks();
    },
  });
}

// Hook para atualizar tarefa
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      tasksApi.updateTask(taskId, updates),
    onSuccess: (updatedTask, { taskId }) => {
      // Atualizar cache com dados reais do servidor
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);
      
      if (previousTasks) {
        const updatedTasks = previousTasks.map(task =>
          task.id === taskId ? updatedTask : task
        );
        queryClient.setQueryData(queryKeys.tasks.all, updatedTasks);
      }

      // Invalidar cache de energia quando plannedForToday muda
      queryClient.invalidateQueries({ queryKey: ['energy', 'budget'] });
    },
    onError: () => {
      invalidateQueries.tasks();
      queryClient.invalidateQueries({ queryKey: ['energy', 'budget'] });
    },
  });
}

// Hook para completar tarefa
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.completeTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);

      // Otimistic update
      if (previousTasks) {
        const updatedTasks = previousTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                status: 'completed' as const,
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : task
        );
        queryClient.setQueryData(queryKeys.tasks.all, updatedTasks);
      }

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previousTasks);
      }
    },
    onSettled: () => {
      invalidateQueries.tasks();
      queryClient.invalidateQueries({ queryKey: ['energy', 'budget'] });
    },
  });
}

// Hook para adiar tarefa
export function usePostponeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      tasksApi.postponeTask(taskId, reason),
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);

      // Otimistic update
      if (previousTasks) {
        const updatedTasks = previousTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                status: 'postponed' as const,
                postponedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                plannedForToday: false,
                postponementCount: (task.postponementCount || 0) + 1,
              }
            : task
        );
        queryClient.setQueryData(queryKeys.tasks.all, updatedTasks);
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previousTasks);
      }
    },
    onSettled: () => {
      invalidateQueries.tasks();
      queryClient.invalidateQueries({ queryKey: ['energy', 'budget'] });
    },
  });
}

// Hook para deletar tarefa
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);

      // Otimistic update - remover tarefa
      if (previousTasks) {
        const updatedTasks = previousTasks.filter(task => task.id !== taskId);
        queryClient.setQueryData(queryKeys.tasks.all, updatedTasks);
      }

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previousTasks);
      }
    },
    onSettled: () => {
      invalidateQueries.tasks();
      queryClient.invalidateQueries({ queryKey: ['energy', 'budget'] });
    },
  });
}

// Hook para adicionar comentário a uma tarefa
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, comment }: { taskId: string; comment: Omit<Comment, 'id' | 'createdAt'> }) =>
      tasksApi.addComment(taskId, comment),
    onSuccess: (newComment, { taskId }) => {
      // Atualizar a tarefa específica no cache
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);
      
      if (previousTasks) {
        const updatedTasks = previousTasks.map(task =>
          task.id === taskId
            ? { ...task, comments: [...task.comments, newComment] }
            : task
        );
        queryClient.setQueryData(queryKeys.tasks.all, updatedTasks);
      }
    },
  });
}

// ============================================================================
// COMPUTED HOOKS (Dados derivados)
// ============================================================================

// Hook para calcular estatísticas das tarefas
export function useTasksStats() {
  const { data: tasks = [] } = useTasks();

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    postponed: tasks.filter(t => t.status === 'postponed').length,
    totalEnergyUsed: tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.energyPoints, 0),
    totalEnergyPlanned: tasks
      .filter(t => t.status !== 'completed')
      .reduce((sum, t) => sum + t.energyPoints, 0),
  };
}

// Hook para filtrar tarefas por projeto
export function useTasksByProject(projectId?: string) {
  const { data: tasks = [] } = useTasks();

  if (!projectId) return tasks;
  
  return tasks.filter(task => task.projectId === projectId);
}

// Hook para tarefas de hoje
export function useTodayTasks() {
  const { data: tasks = [], isLoading, error } = useTasks();
  const today = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter(task => {
    // Tarefas planejadas para hoje OU tarefas com data de hoje
    if (task.plannedForToday === true) {
      return task.status === 'pending' || task.status === 'postponed';
    }
    
    // Fallback: tarefas com data de hoje (comportamento original)
    if (task.dueDate === today) return task.status === 'pending' || task.status === 'postponed';
    
    // Tarefas sem data de vencimento que estão pendentes
    if (!task.dueDate || task.dueDate === 'Sem vencimento') return task.status === 'pending';
    
    return false;
  });

  // Debug log
  console.log('🔍 useTodayTasks Debug:', {
    totalTasks: tasks.length,
    todayTasksFiltered: todayTasks.length,
    today,
    plannedTasks: tasks.filter(t => t.plannedForToday === true).length,
    dueTodayTasks: tasks.filter(t => t.dueDate === today).length,
    noDueDatePending: tasks.filter(t => (!t.dueDate || t.dueDate === 'Sem vencimento') && t.status === 'pending').length
  });

  return {
    data: todayTasks,
    isLoading,
    error
  };
}

// Hook para buscar orçamento/status de energia do usuário
export function useEnergyBudget() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['energy', 'budget'],
    queryFn: tasksApi.getEnergyBudget,
    staleTime: 30 * 1000, // 30 segundos - dados mais frescos para energia
    enabled: isAuthenticated,
  });
}