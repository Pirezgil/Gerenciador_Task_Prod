// ============================================================================
// AUTH STORE V4 - SIMPLIFICADO: Apenas funcionalidades Sandbox
// AuthProvider é agora a única fonte de verdade para autenticação
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SandboxAuth, User } from '@/types';

interface SandboxState {
  sandboxAuth: SandboxAuth;
}

interface SandboxActions {
  // Actions - Sandbox Security
  checkSandboxPassword: (password: string, user: User | null) => boolean;
  unlockSandbox: () => void;
  lockSandbox: () => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
}

type SandboxStore = SandboxState & SandboxActions;

export const useSandboxStore = create<SandboxStore>()(
  persist(
    (set, get) => ({
      // Sandbox Security - SEMPRE bloqueado por segurança
      sandboxAuth: {
        isUnlocked: false,
        lastUnlockTime: undefined,
        failedAttempts: 0,
      },

      // Actions - Sandbox Security
      checkSandboxPassword: (password: string, user: User | null) => {
        if (!user?.settings?.sandboxPassword) return false;
        
        const isValid = password === user.settings.sandboxPassword;
        
        if (!isValid) {
          // Incrementar tentativas falhadas
          set(state => ({
            sandboxAuth: {
              ...state.sandboxAuth,
              failedAttempts: state.sandboxAuth.failedAttempts + 1
            }
          }));
        }
        
        return isValid;
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
      
      incrementFailedAttempts: () => {
        set(state => ({
          sandboxAuth: {
            ...state.sandboxAuth,
            failedAttempts: state.sandboxAuth.failedAttempts + 1
          }
        }));
      },
      
      resetFailedAttempts: () => {
        set(state => ({
          sandboxAuth: {
            ...state.sandboxAuth,
            failedAttempts: 0
          }
        }));
      },
    })
    , {
      name: 'cerebro-sandbox',
      partialize: (state) => ({
        // Não persistir estado de unlock por segurança
        sandboxAuth: {
          ...state.sandboxAuth,
          isUnlocked: false, // Sempre forçar reautenticação
          lastUnlockTime: undefined
        }
      }),
    }
  )
);

// DEPRECATED: Manter compatibilidade temporária
// TODO: Remover após migrar componentes sandbox
export const useAuthStore = useSandboxStore;