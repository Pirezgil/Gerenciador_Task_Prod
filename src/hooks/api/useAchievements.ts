// ============================================================================
// ACHIEVEMENTS HOOKS - Hooks React Query para operações de conquistas
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import axios from 'axios';
import type { 
  Achievement, 
  UserAchievementsResponse, 
  RewardsPageData,
  DailyProgress,
  AchievementFilters 
} from '@/types/achievement';

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Configuração do axios com cookies HTTP-only
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // SEGURANÇA: Usar cookies HTTP-only
});

const achievementsApi = {
  async getAchievements(filters?: AchievementFilters): Promise<UserAchievementsResponse> {
    const params: any = {};
    if (filters?.type && filters.type !== 'all') params.type = filters.type;
    if (filters?.timeRange) {
      const today = new Date();
      let startDate = '';
      
      switch (filters.timeRange) {
        case 'today':
          startDate = today.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          startDate = monthAgo.toISOString().split('T')[0];
          break;
      }
      
      if (startDate) params.startDate = startDate;
    }

    const response = await api.get('/achievements', { params });
    return response.data;
  },

  async getRewardsPageData(): Promise<RewardsPageData> {
    const response = await api.get('/achievements/rewards-page');
    return response.data;
  },

  async getDailyProgress(date: string): Promise<DailyProgress> {
    const response = await api.get(`/achievements/daily-progress/${date}`);
    return response.data;
  },

  async getStats(): Promise<UserAchievementsResponse['stats'] & { recentAchievements: Achievement[] }> {
    const response = await api.get('/achievements/stats');
    return response.data;
  },

  async checkDailyMastery(date?: string): Promise<{ message: string; achievement: Achievement | null }> {
    const response = await api.post('/achievements/check-daily-mastery', { date });
    return response.data;
  },

  async getTodayMedalsCount(): Promise<number> {
    const response = await api.get('/achievements/today-count');
    return response.data.count || 0;
  },

  async getWeeklyAchievements(date?: string): Promise<{
    achievements: Achievement[];
    weekStart: string;
    weekEnd: string;
    totalCount: number;
    medalsByType: { type: string; subtype: string | null; count: number; icon: string; color: string }[];
  }> {
    const params: any = {};
    if (date) params.date = date;
    
    const response = await api.get('/achievements/weekly', { params });
    return response.data;
  },
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook para buscar conquistas do usuário com filtros
 */
export function useAchievements(filters?: AchievementFilters) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [...queryKeys.achievements.all, filters],
    queryFn: () => achievementsApi.getAchievements(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: isAuthenticated,
  });
}

/**
 * Hook para buscar dados completos da página de recompensas
 */
export function useRewardsPageData() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.achievements.rewardsPage,
    queryFn: achievementsApi.getRewardsPageData,
    staleTime: 30 * 1000, // 30 segundos (dados mais frescos)
    enabled: isAuthenticated,
  });
}

/**
 * Hook para buscar progresso diário específico
 */
export function useDailyProgress(date: string) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.achievements.dailyProgress(date),
    queryFn: () => achievementsApi.getDailyProgress(date),
    staleTime: 30 * 1000, // 30 segundos
    enabled: !!date && isAuthenticated,
  });
}

/**
 * Hook para buscar estatísticas resumidas
 */
export function useAchievementStats() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.achievements.stats,
    queryFn: achievementsApi.getStats,
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: isAuthenticated,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook para forçar verificação de maestria diária (para testes)
 */
export function useCheckDailyMastery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: achievementsApi.checkDailyMastery,
    onSuccess: (data) => {
      // Invalidar queries relacionadas se uma nova conquista foi obtida
      if (data.achievement) {
        queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.achievements.stats });
        queryClient.invalidateQueries({ queryKey: queryKeys.achievements.rewardsPage });
      }
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook que retorna conquistas recentes (últimas 5)
 */
export function useRecentAchievements() {
  const { data } = useAchievementStats();
  return data?.recentAchievements ?? [];
}

/**
 * Hook que retorna se o usuário obteve maestria hoje
 */
export function useTodayMastery() {
  const today = new Date().toISOString().split('T')[0];
  const { data } = useDailyProgress(today);
  return data?.achievedMastery ?? false;
}

/**
 * Hook para buscar contagem de medalhas ganhas hoje
 */
export function useTodayMedalsCount() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['achievements', 'today-count'],
    queryFn: achievementsApi.getTodayMedalsCount,
    staleTime: 10 * 1000, // 10 segundos - atualiza mais frequentemente
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
    enabled: isAuthenticated,
  });
}

/**
 * Hook para buscar medalhas da semana
 */
export function useWeeklyAchievements(date?: string) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['achievements', 'weekly', date || new Date().toISOString().split('T')[0]],
    queryFn: () => achievementsApi.getWeeklyAchievements(date),
    staleTime: 10 * 1000, // 10 segundos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
    enabled: isAuthenticated,
  });
}