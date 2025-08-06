// ============================================================================
// AUTH STORE V2 - Integrado com Backend API
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserSettings, SandboxAuth } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sandboxAuth: SandboxAuth;
}

interface AuthActions {
  // Ações simplificadas - a lógica de API agora está nos hooks
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  
  // Ações de autenticação para compatibilidade
  login: (email: string, password: string) => Promise<void>;
  initializeAuth: () => void;
  
  // Actions - Sandbox Security (mantidas como estavam)
  checkSandboxPassword: (password: string) => boolean;
  unlockSandbox: () => void;
  lockSandbox: () => void;
  
  // Ação para limpar store (logout)
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial limpo - será preenchido pelos hooks de API
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Sandbox Security - SEMPRE bloqueado por segurança
      sandboxAuth: {
        isUnlocked: false,
        lastUnlockTime: undefined,
        failedAttempts: 0,
      },

      // Ações simplificadas
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      updateUserSettings: (newSettings: Partial<UserSettings>) => {
        const { user } = get();
        
        if (!user) {
          console.error('Erro: usuário não está logado em updateUserSettings');
          return;
        }

        // Inicializar settings se não existir
        const currentSettings: UserSettings = user.settings || {
          dailyEnergyBudget: 15,
          theme: 'light',
          timezone: 'America/Sao_Paulo',
          notifications: true,
          sandboxEnabled: false,
        };

        const updatedUser: User = {
          ...user,
          settings: { ...currentSettings, ...newSettings },
          updatedAt: new Date().toISOString(),
        };

        set({ user: updatedUser });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Credenciais inválidas');
          }

          const data = await response.json();
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth-token', data.data.token);
          }
          
          set({ 
            user: data.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth-token');
          const storedAuthData = localStorage.getItem('cerebro-auth');
          
          console.log('initializeAuth:', { hasToken: !!token, hasStoredData: !!storedAuthData });
          
          // Se tem token, tentar recuperar dados do usuário
          if (token) {
            if (storedAuthData) {
              try {
                const parsed = JSON.parse(storedAuthData);
                if (parsed.state?.user) {
                  console.log('Auth restaurado do localStorage');
                  set({
                    user: parsed.state.user,
                    isAuthenticated: true,
                    isLoading: false
                  });
                  return;
                }
              } catch (error) {
                console.error('Erro ao recuperar dados de auth:', error);
              }
            }
            
            // Se tem token mas não tem dados válidos, manter como autenticado temporariamente
            // e tentar buscar dados do servidor
            console.log('Token encontrado, mas dados inválidos - mantendo como autenticado');
            set({
              user: null,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
          
          // Se não tem token, garantir que não está autenticado
          console.log('Nenhum token encontrado - usuário não autenticado');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('cerebro-auth');
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sandboxAuth: {
            isUnlocked: false,
            lastUnlockTime: undefined,
            failedAttempts: 0,
          }
        });
      },
      
      // Actions - Sandbox Security (mantidas)
      checkSandboxPassword: (password: string) => {
        const { user } = get();
        if (!user?.settings?.sandboxPassword) return false;
        return password === user.settings.sandboxPassword;
      },

      unlockSandbox: () => {
        set(state => ({
          sandboxAuth: {
            ...state.sandboxAuth,
            isUnlocked: true,
            lastUnlockTime: new Date().toISOString(),
            failedAttempts: 0
          }
        }));
      },
      
      lockSandbox: () => {
        set(state => ({
          sandboxAuth: {
            ...state.sandboxAuth,
            isUnlocked: false,
            lastUnlockTime: undefined
          }
        }));
      },
    }),
    {
      name: 'cerebro-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // sandboxAuth removido: senha sempre solicitada
      }),
    }
  )
);