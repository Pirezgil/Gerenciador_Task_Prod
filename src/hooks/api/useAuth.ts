// ============================================================================
// AUTH HOOKS - Hooks React Query para autenticação
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, userApi } from '@/lib/api';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type { User, UserSettings } from '@/types';

// ============================================================================
// QUERY HOOKS
// ============================================================================

// Hook para buscar dados do usuário atual
export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getMe,
    retry: false, // Não tentar novamente se falhar (usuário não autenticado)
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

// Hook para login
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Salvar token no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token);
      }

      // Atualizar cache com dados do usuário
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      
      // Invalidar todas as queries para refrescar dados com novo usuário
      invalidateQueries.all();
    },
    onError: (error) => {
      console.error('Erro no login:', error);
    },
  });
}

// Hook para registro
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Salvar token no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token);
      }

      // Atualizar cache com dados do usuário
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      
      // Invalidar todas as queries
      invalidateQueries.all();
    },
    onError: (error) => {
      console.error('Erro no registro:', error);
    },
  });
}

// Hook para logout
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Remover token do localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }

      // Limpar todo o cache
      queryClient.clear();
      
      // Redirecionar para página de login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    },
    onError: () => {
      // Mesmo se a API falhar, fazer logout local
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        window.location.href = '/auth';
      }
      queryClient.clear();
    },
  });
}

// Hook para refresh token
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      // Atualizar token no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token);
      }
    },
    onError: () => {
      // Se refresh falhar, fazer logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        window.location.href = '/auth';
      }
      queryClient.clear();
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Hook para verificar se usuário está autenticado
export function useIsAuthenticated() {
  const { data: user, isLoading, error } = useMe();
  
  return {
    isAuthenticated: !!user && !error,
    isLoading,
    user,
  };
}

// Hook para dados do usuário com fallback para localStorage
export function useUser() {
  const { data: user, isLoading, error } = useMe();
  
  // Se não conseguir carregar do servidor, tentar localStorage
  const fallbackUser = typeof window !== 'undefined' 
    ? (() => {
        try {
          const stored = localStorage.getItem('cerebro-auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.state?.user;
          }
        } catch {
          return null;
        }
        return null;
      })()
    : null;

  return {
    user: user || fallbackUser,
    isLoading,
    error,
  };
}

// Hook para atualizar configurações do usuário
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<UserSettings>) => userApi.updateSettings(settings),
    onSuccess: (updatedUser) => {
      // Atualizar cache com dados atualizados do usuário
      queryClient.setQueryData(queryKeys.auth.me, updatedUser);
      
      // Invalidar queries relacionadas para garantir consistência
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error);
    },
  });
}

// Hook para logout automático quando token expira
export function useAuthTokenExpiry() {
  const logout = useLogout();
  
  // Verificar periodicamente se o token ainda é válido
  useQuery({
    queryKey: ['auth', 'token-check'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('auth-token') 
        : null;
        
      if (!token) {
        logout.mutate();
        return null;
      }
      
      // Verificar se token não está expirado
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        
        if (payload.exp < now) {
          logout.mutate();
          return null;
        }
        
        return { valid: true };
      } catch {
        logout.mutate();
        return null;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Verificar a cada 5 minutos
    enabled: typeof window !== 'undefined',
  });
}