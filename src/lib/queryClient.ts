// ============================================================================
// REACT QUERY CLIENT - Configuração do TanStack Query
// ============================================================================

import { QueryClient } from '@tanstack/react-query';

// Configuração do QueryClient com otimizações
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos por padrão
      staleTime: 5 * 60 * 1000,
      // Manter dados em cache por 10 minutos quando não utilizados
      gcTime: 10 * 60 * 1000,
      // Retry em caso de erro (3 tentativas)
      retry: 3,
      // Não fazer refetch automático quando a janela recebe foco
      refetchOnWindowFocus: false,
      // Fazer refetch quando reconectar à internet
      refetchOnReconnect: true,
      // Sempre fazer refetch ao montar o componente
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations apenas uma vez
      retry: 1,
    },
  },
});

// ============================================================================
// QUERY KEYS - Chaves padronizadas para cache
// ============================================================================

export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    detail: (id: string) => ['tasks', id] as const,
    comments: (taskId: string) => ['tasks', taskId, 'comments'] as const,
  },

  // Attachments
  attachments: {
    task: (taskId: string) => ['tasks', taskId, 'attachments'] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    tasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,
  },
  
  // Notes
  notes: {
    all: ['notes'] as const,
    detail: (id: string) => ['notes', id] as const,
  },
  
  // Habits
  habits: {
    all: ['habits'] as const,
    detail: (id: string) => ['habits', id] as const,
    completions: (habitId: string) => ['habits', habitId, 'completions'] as const,
  },
  
  // User
  user: {
    settings: ['user', 'settings'] as const,
    profile: ['user', 'profile'] as const,
  },
  
  // Achievements
  achievements: {
    all: ['achievements'] as const,
    rewardsPage: ['achievements', 'rewards-page'] as const,
    stats: ['achievements', 'stats'] as const,
    dailyProgress: (date: string) => ['achievements', 'daily-progress', date] as const,
  },
} as const;

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

export const invalidateQueries = {
  // Invalidar todas as queries relacionadas a tasks
  tasks: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    queryClient.invalidateQueries({ queryKey: ['tasks', 'bombeiro'] });
  },
  
  // Invalidar queries de um projeto específico
  project: (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(projectId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    queryClient.invalidateQueries({ queryKey: ['tasks', 'bombeiro'] });
  },
  
  // Invalidar todas as queries relacionadas a notes
  notes: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes.all }),
  
  // Invalidar todas as queries relacionadas a habits
  habits: () => queryClient.invalidateQueries({ queryKey: queryKeys.habits.all }),
  
  // Invalidar dados do usuário
  user: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.settings });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
  },
  
  // Invalidar todas as queries relacionadas a achievements
  achievements: () => queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all }),
  
  // Invalidar tudo (usar com cuidado)
  all: () => queryClient.invalidateQueries(),
};

// ============================================================================
// CACHE MANAGEMENT UTILITIES
// ============================================================================

export const cacheUtils = {
  // Limpar todo o cache
  clearAll: () => queryClient.clear(),
  
  // Remover queries específicas
  removeQueries: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },
  
  // Definir dados diretamente no cache (otimistic updates)
  setQueryData: <T>(queryKey: readonly unknown[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  },
  
  // Obter dados do cache
  getQueryData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData(queryKey);
  },
  
  // Fazer prefetch de dados
  prefetchQuery: async (queryKey: readonly unknown[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  },
};