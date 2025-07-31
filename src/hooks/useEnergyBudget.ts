import { useMemo } from 'react';
import { useTasksStore } from '../stores/tasksStore';
import { useAuthStore } from '../stores/authStore';

interface EnergyBudget {
  current: number;
  max: number;
  percentage: number;
  canPerformAction: (cost: number) => boolean;
}

/**
 * Hook simplificado para orçamento de energia
 * CORREÇÃO: Removidas proteções anti-loop excessivas
 */
export const useEnergyBudget = (): EnergyBudget => {
  const { calculateEnergyBudget } = useTasksStore();
  const { user } = useAuthStore();
  
  const energyData = useMemo(() => {
    const budget = calculateEnergyBudget();
    return {
      current: budget.used,
      max: budget.total,
      percentage: budget.percentage,
      canPerformAction: (cost: number) => budget.remaining >= cost
    };
  }, [calculateEnergyBudget]);
  
  return energyData;
};