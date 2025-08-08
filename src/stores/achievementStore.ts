// ============================================================================
// ACHIEVEMENT STORE - Estado global das conquistas e recompensas
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Achievement, 
  DailyProgress,
  AchievementFilters,
  RewardsPageData 
} from '@/types/achievement';

// ============================================================================
// INTERFACES
// ============================================================================

interface NotificationState {
  id: string;
  achievement: Achievement;
  timestamp: number;
  seen: boolean;
}

interface AchievementState {
  // Estado das conquistas
  achievements: Achievement[];
  recentAchievements: Achievement[];
  dailyProgress: DailyProgress | null;
  isLoading: boolean;
  error: string | null;
  
  // Filtros da página de recompensas
  filters: AchievementFilters;
  
  // Notificações de conquistas
  pendingNotifications: NotificationState[];
  
  // Cache da página de recompensas
  rewardsPageData: RewardsPageData | null;
  
  // Estado de animações
  celebrationActive: boolean;
  
  // ===== ACTIONS =====
  
  // Conquistas
  setAchievements: (achievements: Achievement[]) => void;
  addAchievement: (achievement: Achievement) => void;
  setRecentAchievements: (achievements: Achievement[]) => void;
  
  // Progresso diário
  setDailyProgress: (progress: DailyProgress) => void;
  updateDailyProgress: (updates: Partial<DailyProgress>) => void;
  
  // Estado da aplicação
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filtros
  setFilters: (filters: Partial<AchievementFilters>) => void;
  resetFilters: () => void;
  
  // Notificações
  addNotification: (achievement: Achievement) => void;
  markNotificationSeen: (notificationId: string) => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  getUnseenNotifications: () => NotificationState[];
  
  // Cache da página de recompensas
  setRewardsPageData: (data: RewardsPageData) => void;
  clearRewardsPageData: () => void;
  
  // Celebrações
  startCelebration: () => void;
  stopCelebration: () => void;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialFilters: AchievementFilters = {
  type: 'all',
  timeRange: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
};

// ============================================================================
// STORE
// ============================================================================

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      achievements: [],
      recentAchievements: [],
      dailyProgress: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      pendingNotifications: [],
      rewardsPageData: null,
      celebrationActive: false,
      
      // ===== IMPLEMENTATIONS =====
      
      // Conquistas
      setAchievements: (achievements) => set({ achievements }),
      
      addAchievement: (achievement) => set((state) => ({
        achievements: [achievement, ...state.achievements],
        recentAchievements: [achievement, ...state.recentAchievements.slice(0, 4)],
      })),
      
      setRecentAchievements: (achievements) => set({ recentAchievements: achievements }),
      
      // Progresso diário
      setDailyProgress: (progress) => set({ dailyProgress: progress }),
      
      updateDailyProgress: (updates) => set((state) => ({
        dailyProgress: state.dailyProgress 
          ? { ...state.dailyProgress, ...updates }
          : null
      })),
      
      // Estado da aplicação
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Filtros
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      
      resetFilters: () => set({ filters: initialFilters }),
      
      // Notificações
      addNotification: (achievement) => set((state) => {
        const notification: NotificationState = {
          id: `notification_${achievement.id}_${Date.now()}`,
          achievement,
          timestamp: Date.now(),
          seen: false,
        };
        
        return {
          pendingNotifications: [notification, ...state.pendingNotifications],
        };
      }),
      
      markNotificationSeen: (notificationId) => set((state) => ({
        pendingNotifications: state.pendingNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, seen: true }
            : notification
        )
      })),
      
      clearNotification: (notificationId) => set((state) => ({
        pendingNotifications: state.pendingNotifications.filter(
          notification => notification.id !== notificationId
        )
      })),
      
      clearAllNotifications: () => set({ pendingNotifications: [] }),
      
      getUnseenNotifications: () => {
        return get().pendingNotifications.filter(notification => !notification.seen);
      },
      
      // Cache da página de recompensas
      setRewardsPageData: (data) => set({ rewardsPageData: data }),
      clearRewardsPageData: () => set({ rewardsPageData: null }),
      
      // Celebrações
      startCelebration: () => set({ celebrationActive: true }),
      stopCelebration: () => set({ celebrationActive: false }),
      
      // Reset
      reset: () => set({
        achievements: [],
        recentAchievements: [],
        dailyProgress: null,
        isLoading: false,
        error: null,
        filters: initialFilters,
        pendingNotifications: [],
        rewardsPageData: null,
        celebrationActive: false,
      }),
    }),
    {
      name: 'achievement-store',
      // Persistir apenas dados essenciais
      partialize: (state) => ({
        recentAchievements: state.recentAchievements,
        dailyProgress: state.dailyProgress,
        filters: state.filters,
        pendingNotifications: state.pendingNotifications.slice(0, 10), // Max 10 notificações
      }),
    }
  )
);

// ============================================================================
// SELECTORS ÚTEIS
// ============================================================================

// Selector para conquistas por tipo
export const useAchievementsByType = (type: Achievement['type']) => {
  return useAchievementStore((state) => 
    state.achievements.filter(achievement => achievement.type === type)
  );
};

// Selector para verificar se tem notificações não vistas
export const useHasUnseenNotifications = () => {
  return useAchievementStore((state) => 
    state.pendingNotifications.some(notification => !notification.seen)
  );
};

// Selector para estatísticas rápidas
export const useAchievementStats = () => {
  return useAchievementStore((state) => {
    const achievements = state.achievements;
    return {
      total: achievements.length,
      taskCompletions: achievements.filter(a => a.type === 'task_completion').length,
      projectCompletions: achievements.filter(a => a.type === 'project_completion').length,
      dailyMasteries: achievements.filter(a => a.type === 'daily_master').length,
      weeklyLegends: achievements.filter(a => a.type === 'weekly_legend').length,
    };
  });
};

// Selector para progresso de hoje
export const useTodayProgress = () => {
  return useAchievementStore((state) => {
    const today = new Date().toISOString().split('T')[0];
    return state.dailyProgress?.date === today ? state.dailyProgress : null;
  });
};