// ============================================================================
// ENERGY STORE - Gerenciamento especializado de energia
// Extraído do tasksStore.ts para resolver conflitos e sobrecarga
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

export interface EnergyBudget {
  used: number;
  total: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isComplete: boolean;
}

interface EnergyState {
  // Estado
  dailyBudget: number;
  
  // Actions
  setDailyBudget: (budget: number) => void;
  calculateBudget: (usedEnergy: number) => EnergyBudget;
  canPerformAction: (cost: number, usedEnergy: number) => boolean;
  getRemainingEnergy: (usedEnergy: number) => number;
}

export const useEnergyStore = create<EnergyState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      dailyBudget: 12,
      
      // Actions
      setDailyBudget: (budget) => set({ dailyBudget: budget }),
      
      calculateBudget: (usedEnergy) => {
        const state = get();
        const authState = useAuthStore.getState();
        const dailyBudget = authState.user?.settings?.dailyEnergyBudget || state.dailyBudget;
        
        return {
          used: usedEnergy,
          total: dailyBudget,
          remaining: dailyBudget - usedEnergy,
          percentage: Math.min((usedEnergy / dailyBudget) * 100, 100),
          isOverBudget: usedEnergy > dailyBudget,
          isComplete: usedEnergy === dailyBudget,
        };
      },
      
      canPerformAction: (cost, usedEnergy) => {
        const state = get();
        const budget = state.calculateBudget(usedEnergy);
        return budget.remaining >= cost;
      },
      
      getRemainingEnergy: (usedEnergy) => {
        const state = get();
        const budget = state.calculateBudget(usedEnergy);
        return budget.remaining;
      },
    }),
    {
      name: 'energy-store',
      version: 1,
    }
  )
);
