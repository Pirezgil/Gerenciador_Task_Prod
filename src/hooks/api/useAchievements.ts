// ============================================================================
// ACHIEVEMENTS HOOKS - Hooks React Query para operações de conquistas
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const achievementsApi = {
  async getAchievements(filters?: AchievementFilters): Promise<UserAchievementsResponse> {
    const searchParams = new URLSearchParams();
    if (filters?.type && filters.type !== 'all') searchParams.set('type', filters.type);
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
      
      if (startDate) searchParams.set('startDate', startDate);
    }

    const queryString = searchParams.toString();
    const url = `${BASE_URL}/achievements${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar conquistas');
    }

    return response.json();
  },

  async getRewardsPageData(): Promise<RewardsPageData> {
    const response = await fetch(`${BASE_URL}/achievements/rewards-page`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados da página de recompensas');
    }

    return response.json();
  },

  async getDailyProgress(date: string): Promise<DailyProgress> {
    const response = await fetch(`${BASE_URL}/achievements/daily-progress/${date}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar progresso diário');
    }

    return response.json();
  },

  async getStats(): Promise<UserAchievementsResponse['stats'] & { recentAchievements: Achievement[] }> {
    const response = await fetch(`${BASE_URL}/achievements/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }

    return response.json();
  },

  async checkDailyMastery(date?: string): Promise<{ message: string; achievement: Achievement | null }> {
    const response = await fetch(`${BASE_URL}/achievements/check-daily-mastery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date }),
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar maestria diária');
    }

    return response.json();
  },

  async getTodayMedalsCount(): Promise<number> {
    const response = await fetch(`${BASE_URL}/achievements/today-count`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar contagem de medalhas de hoje');
    }

    const data = await response.json();
    return data.count || 0;
  },

  async getWeeklyAchievements(date?: string): Promise<{
    achievements: Achievement[];
    weekStart: string;
    weekEnd: string;
    totalCount: number;
    medalsByType: { type: string; subtype: string | null; count: number; icon: string; color: string }[];
  }> {
    const searchParams = new URLSearchParams();
    if (date) searchParams.set('date', date);
    
    const queryString = searchParams.toString();
    const url = `${BASE_URL}/achievements/weekly${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar medalhas da semana');
    }

    return response.json();
  },
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook para buscar conquistas do usuário com filtros
 */
export function useAchievements(filters?: AchievementFilters) {
  const { isAuthenticated } = useAuthStore();
  
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
  const { isAuthenticated } = useAuthStore();
  
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
  const { isAuthenticated } = useAuthStore();
  
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
  const { isAuthenticated } = useAuthStore();
  
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
  const { isAuthenticated } = useAuthStore();
  
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
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['achievements', 'weekly', date || new Date().toISOString().split('T')[0]],
    queryFn: () => achievementsApi.getWeeklyAchievements(date),
    staleTime: 10 * 1000, // 10 segundos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
    enabled: isAuthenticated,
  });
}