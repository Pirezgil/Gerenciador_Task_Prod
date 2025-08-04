// ============================================================================
// AUTH PROVIDER - Provider de autenticação integrado com API
// ============================================================================

'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIsAuthenticated, useAuthTokenExpiry } from '@/hooks/api/useAuth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setAuthenticated, setLoading, clearAuth } = useAuthStore();
  const { user, isAuthenticated, isLoading } = useIsAuthenticated();
  
  // Verificar expiração do token automaticamente
  useAuthTokenExpiry();

  // Sincronizar estado do React Query com Zustand
  useEffect(() => {
    setUser(user || null);
    setAuthenticated(isAuthenticated);
    setLoading(isLoading);
  }, [user, isAuthenticated, isLoading, setUser, setAuthenticated, setLoading]);

  // Verificar se há token armazenado ao inicializar
  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth-token') 
      : null;
    
    if (!token && isAuthenticated) {
      // Se não há token mas o estado diz que está autenticado, limpar
      clearAuth();
    }
  }, [isAuthenticated, clearAuth]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}