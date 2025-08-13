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
    refetchOnWindowFocus: false, // OTIMIZAÇÃO: Evitar refetch desnecessário
    refetchOnMount: true, // Sempre refetch ao montar componente
    refetchInterval: false, // Não fazer polling automático
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

// Hook para login - NOVA ARQUITETURA: Apenas cookies HTTP-only
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // REMOÇÃO DE VULNERABILIDADE CRÍTICA: Não usar localStorage para tokens
      // Token é agora gerenciado automaticamente via cookies HTTP-only pelo backend
      
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

// Hook para registro - NOVA ARQUITETURA: Apenas cookies HTTP-only
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // REMOÇÃO DE VULNERABILIDADE CRÍTICA: Não usar localStorage para tokens
      // Token é agora gerenciado automaticamente via cookies HTTP-only pelo backend
      
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

// Hook para logout - NOVA ARQUITETURA: Apenas cookies HTTP-only
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // REMOÇÃO DE VULNERABILIDADE CRÍTICA: Não gerenciar tokens no frontend
      // Cookie é limpo automaticamente pelo backend
      
      // Limpar todo o cache
      queryClient.clear();
      
      // Redirecionar para página de login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    },
    onError: () => {
      // Mesmo se a API falhar, fazer logout local
      // Cookie será limpo pelo backend ou expirará naturalmente
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    },
  });
}

// Hook para refresh token - REMOVIDO: Nova arquitetura não usa refresh tokens
// Tokens JWT com duração de 7 dias em cookies HTTP-only são mais seguros
// Em caso de expiração, usuário fará login novamente

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

// Hook para dados do usuário - NOVA ARQUITETURA: Apenas servidor
export function useUser() {
  const { data: user, isLoading, error } = useMe();
  
  // REMOÇÃO DE VULNERABILIDADE CRÍTICA: Não usar localStorage para fallback
  // Dados do usuário vêm exclusivamente do servidor via cookie HTTP-only
  
  return {
    user: user || null,
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

// Hook para validação de token - REMOVIDO: Nova arquitetura não expõe tokens
// Validação acontece automaticamente no servidor a cada requisição
// Tokens em cookies HTTP-only não são acessíveis ao JavaScript