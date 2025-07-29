// ============================================================================
// AUTH STORE - Gerenciamento de autenticação + Sandbox Security
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserSettings, SandboxAuth } from '@/types';

import { syncedUpdate } from '../lib/syncManager';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sandboxAuth: SandboxAuth;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setUser: (user: User) => void;
  checkAuthStatus: () => Promise<boolean>;
  
  // Actions - Sandbox Security
  unlockSandbox: () => void;
  lockSandbox: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Sandbox Security - SEMPRE bloqueado por segurança
      sandboxAuth: {
        isUnlocked: false, // Sempre false por segurança
        lastUnlockTime: undefined,
        failedAttempts: 0,
      },

      // Ações
      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulação de login - substituir por API real
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: 'user-1',
            name: 'João Silva',
            email,
            settings: {
              dailyEnergyBudget: 12,
              theme: 'light',
              timezone: 'America/Sao_Paulo',
              notifications: true,
              sandboxPassword: '', // Será configurado pelo usuário
              sandboxEnabled: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          sandboxAuth: {
            isUnlocked: false,
            lastUnlockTime: undefined,
            failedAttempts: 0,
          }
        });
      },

      updateSettings: (newSettings: Partial<UserSettings>) => {
        const { user } = get();
        if (!user) return;

        const updatedUser: User = {
          ...user,
          settings: { ...user.settings, ...newSettings },
          updatedAt: new Date().toISOString(),
        };

        set({ user: updatedUser });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      checkAuthStatus: async () => {
        // Guard: Só executar no client após hidratação
        if (typeof window === 'undefined') {
          return false;
        }
        try {
          const { user } = get();
          
          // Verificar se há um usuário válido no storage
          if (user && user.id && user.email) {
            // Simular verificação de token/sessão válida
            set({ 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              isAuthenticated: false, 
              isLoading: false,
              user: null 
            });
            return false;
          }
        } catch (error) {
          console.error('Erro ao verificar status de autenticação:', error);
          set({ 
            isAuthenticated: false, 
            isLoading: false,
            user: null 
          });
          return false;
        }
      },
      
      // Actions - Sandbox Security
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
