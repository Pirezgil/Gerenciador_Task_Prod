// ============================================================================
// HABITS HOOKS - Hooks React Query para operações de hábitos
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '@/lib/api';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type { Habit } from '@/types';

// ============================================================================
// QUERY HOOKS
// ============================================================================

// Hook para buscar todos os hábitos do usuário
export function useHabits() {
  return useQuery({
    queryKey: queryKeys.habits.all,
    queryFn: habitsApi.getHabits,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar um hábito específico
export function useHabit(habitId: string) {
  return useQuery({
    queryKey: queryKeys.habits.detail(habitId),
    queryFn: () => habitsApi.getHabit(habitId),
    enabled: !!habitId,
  });
}

// Hook para buscar comentários de um hábito
export function useHabitComments(habitId: string) {
  return useQuery({
    queryKey: ['habitComments', habitId],
    queryFn: () => habitsApi.getHabitComments(habitId),
    enabled: !!habitId,
  });
}

// Hook para adicionar comentário
export function useAddHabitComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, content, author }: { habitId: string; content: string; author?: string }) =>
      habitsApi.addHabitComment(habitId, content, author),
    onSuccess: (_, { habitId }) => {
      queryClient.invalidateQueries({ queryKey: ['habitComments', habitId] });
    },
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

// Hook para criar novo hábito
export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsApi.createHabit,
    onMutate: async (newHabit) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.all });

      const previousHabits = queryClient.getQueryData<Habit[]>(queryKeys.habits.all);

      // Otimistic update
      if (previousHabits) {
        const optimisticHabit: Habit = {
          ...newHabit,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          streak: 0,
          bestStreak: 0,
          completions: [],
        };

        queryClient.setQueryData<Habit[]>(queryKeys.habits.all, [...previousHabits, optimisticHabit]);
      }

      return { previousHabits };
    },
    onError: (err, newHabit, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKeys.habits.all, context.previousHabits);
      }
    },
    onSuccess: () => {
      // Invalidar e refazer as queries de hábitos imediatamente
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.refetchQueries({ queryKey: queryKeys.habits.all });
    },
    onSettled: () => {
      invalidateQueries.habits();
    },
  });
}

// Hook para atualizar hábito
export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, updates }: { habitId: string; updates: Partial<Habit> }) =>
      habitsApi.updateHabit(habitId, updates),
    onMutate: async ({ habitId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.all });

      const previousHabits = queryClient.getQueryData<Habit[]>(queryKeys.habits.all);

      // Otimistic update
      if (previousHabits) {
        const updatedHabits = previousHabits.map(habit =>
          habit.id === habitId
            ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
            : habit
        );
        queryClient.setQueryData(queryKeys.habits.all, updatedHabits);
      }

      return { previousHabits };
    },
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKeys.habits.all, context.previousHabits);
      }
    },
    onSettled: () => {
      invalidateQueries.habits();
    },
  });
}

// Hook para deletar hábito
export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsApi.deleteHabit,
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.all });

      const previousHabits = queryClient.getQueryData<Habit[]>(queryKeys.habits.all);

      // Otimistic update - remover hábito
      if (previousHabits) {
        const updatedHabits = previousHabits.filter(habit => habit.id !== habitId);
        queryClient.setQueryData(queryKeys.habits.all, updatedHabits);
      }

      return { previousHabits };
    },
    onError: (err, habitId, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKeys.habits.all, context.previousHabits);
      }
    },
    onSettled: () => {
      invalidateQueries.habits();
    },
  });
}

// Hook para completar hábito
export function useCompleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, date, notes }: { habitId: string; date: string; notes?: string }) =>
      habitsApi.completeHabit(habitId, date, notes),
    onMutate: async ({ habitId, date }) => {
      // Cancelar queries pendentes
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.all });
      
      // Snapshot dos dados anteriores
      const previousHabits = queryClient.getQueryData<Habit[]>(queryKeys.habits.all);
      
      // Update otimista
      if (previousHabits) {
        const updatedHabits = previousHabits.map(habit => {
          if (habit.id === habitId) {
            const completions = [...habit.completions];
            const existingCompletion = completions.find(c => c.date === date);
            
            if (existingCompletion) {
              existingCompletion.count += 1;
            } else {
              completions.push({
                id: `temp-${Date.now()}`,
                habitId,
                date,
                count: 1,
                notes: '',
                createdAt: new Date().toISOString()
              });
            }
            
            return { ...habit, completions, updatedAt: new Date().toISOString() };
          }
          return habit;
        });
        
        queryClient.setQueryData<Habit[]>(queryKeys.habits.all, updatedHabits);
      }
      
      return { previousHabits };
    },
    onError: (err, variables, context) => {
      // Reverter otimistic update em caso de erro
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKeys.habits.all, context.previousHabits);
      }
    },
    onSuccess: () => {
      console.log('✅ Hábito completado com sucesso!');
    },
    onSettled: async () => {
      // Sempre invalidar e refetch para garantir dados atualizados
      await queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.habits.all, type: 'active' });
      invalidateQueries.habits();
      
      console.log('🔄 Cache de hábitos invalidado e refeito');
    },
  });
}

// ============================================================================
// COMPUTED HOOKS (Dados derivados)
// ============================================================================

// Hook para estatísticas dos hábitos
export function useHabitsStats() {
  const { data: habits = [] } = useHabits();

  return {
    total: habits.length,
    active: habits.filter(h => h.isActive).length,
    inactive: habits.filter(h => !h.isActive).length,
    totalStreak: habits.reduce((sum, h) => sum + h.streak, 0),
    bestStreak: Math.max(...habits.map(h => h.bestStreak), 0),
  };
}

// Hook para hábitos ativos
export function useActiveHabits() {
  const { data: habits = [] } = useHabits();
  
  return habits.filter(habit => habit.isActive);
}

// Hook para hábitos de hoje
export function useTodayHabits() {
  const { data: habits = [] } = useHabits();
  const today = new Date().toISOString().split('T')[0];

  return habits.filter(habit => {
    if (!habit.isActive) return false;
    
    // Verificar se o hábito deve ser executado hoje baseado na frequência
    const frequency = habit.frequency;
    if (!frequency) return true; // Se não tem frequência definida, mostrar todos os dias

    switch (frequency.type) {
      case 'daily':
        return true;
      case 'weekly':
        const dayOfWeek = new Date().getDay();
        return frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
      case 'custom':
        return frequency.daysOfWeek?.includes(new Date().getDay()) ?? false;
      default:
        return true;
    }
  });
}