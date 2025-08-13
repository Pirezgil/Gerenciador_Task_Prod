'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User } from '@/types';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// CONTEXT E REDUCER
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    default:
      return state;
  }
};

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Função para fazer requisições com cookies
  const fetchWithCredentials = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      credentials: 'include', // Importante: inclui cookies HTTP-only
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      
      // Criar erro com dados completos para tratamento no frontend
      const error = new Error(errorData.error?.message || errorData.message || `Erro ${response.status}`) as any;
      error.response = {
        status: response.status,
        data: errorData,
        headers: Object.fromEntries(response.headers.entries())
      };
      error.code = response.status >= 500 ? 'ERR_SERVER' : 'ERR_CLIENT';
      
      throw error;
    }

    return response.json();
  };

  // Função de login
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const data = await fetchWithCredentials('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      dispatch({ type: 'SET_USER', payload: data.data.user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no login';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Função de registro
  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const data = await fetchWithCredentials('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      dispatch({ type: 'SET_USER', payload: data.data.user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no registro';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await fetchWithCredentials('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      // Mesmo se a API falhar, fazer logout local
      console.error('Erro no logout da API:', error);
    }

    dispatch({ type: 'LOGOUT' });
    
    // Redirecionar para login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  };

  // Função para buscar dados do usuário
  const refreshUser = async () => {
    // Evitar múltiplas chamadas simultâneas
    if (state.isLoading) {
      console.log('refreshUser: Já em progresso, ignorando');
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetchWithCredentials('/auth/me');
      dispatch({ type: 'SET_USER', payload: response.data.user });
    } catch (error) {
      // CORREÇÃO: Se falhar (401), usuário não está autenticado
      console.log('refreshUser: Usuário não autenticado, limpando estado');
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  // CORREÇÃO: Verificar autenticação ao montar o componente (apenas UMA vez)
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;
    
    const checkAuth = async () => {
      try {
        const response = await fetchWithCredentials('/auth/me');
        if (isMounted) {
          dispatch({ type: 'SET_USER', payload: response.data.user });
        }
      } catch (error) {
        if (isMounted) {
          // Retry logic para casos de network intermitente
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => {
              if (isMounted) {
                checkAuth();
              }
            }, 1000 * retryCount); // Backoff exponencial
          } else {
            console.log('Initial auth check: Usuário não autenticado após tentativas');
            dispatch({ type: 'SET_USER', payload: null });
          }
        }
      }
    };
    
    // Executar verificação inicial
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // IMPORTANTE: array de dependências vazio

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}