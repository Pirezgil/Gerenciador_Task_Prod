import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DailyProgress {
  id: string;
  userId: string;
  date: string;
  plannedTasks: number;
  completedTasks: number;
  plannedEnergyPoints: number;
  completedEnergyPoints: number;
  achievedMastery: boolean;
  allHabitsCompleted: boolean;
  celebrationShown: boolean;
  createdAt: string;
  updatedAt: string;
}

const dailyProgressApi = {
  getDailyProgress: async (date?: string): Promise<DailyProgress | null> => {
    const dateParam = date || new Date().toISOString().split('T')[0];
    console.log('🔍 Buscando daily progress para:', dateParam);
    try {
      const response = await api.get(`/daily-progress?date=${dateParam}`);
      console.log('✅ Daily progress recebido:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('❌ Erro ao buscar daily progress:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      if (error.response?.status === 404) {
        console.log('📊 Daily progress não existe para hoje (normal se não completou hábitos ainda)');
        return null; // Não existe progresso para este dia
      }
      throw error;
    }
  },

  markCelebrationShown: async (date?: string): Promise<DailyProgress> => {
    const dateParam = date || new Date().toISOString().split('T')[0];
    console.log('🎯 Marcando celebração como mostrada para:', dateParam);
    try {
      const response = await api.patch('/daily-progress/celebration-shown', { date: dateParam });
      console.log('✅ Celebração marcada como mostrada:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('❌ Erro ao marcar celebração como mostrada:', error);
      throw error;
    }
  }
};

export function useDailyProgress(date?: string) {
  const dateKey = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['dailyProgress', dateKey],
    queryFn: () => dailyProgressApi.getDailyProgress(date),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useTodayProgress() {
  return useDailyProgress();
}

export const { markCelebrationShown } = dailyProgressApi;