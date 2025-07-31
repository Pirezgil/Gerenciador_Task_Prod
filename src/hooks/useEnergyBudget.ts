// ============================================================================
// ENERGY BUDGET HOOK - Versão unificada
// CORREÇÃO: Agora usa energyStore como única fonte de verdade
// ============================================================================

import { useMemo } from 'react';
import { useEnergyStore } from '../stores/energyStore';
import { useTasksStore } from '../stores/tasksStore';
import type { EnergyBudget } from '../stores/energyStore';

/**
 * Hook unificado para orçamento de energia
 * CORREÇÃO: Consolidação de múltiplas implementações conflitantes
 */
export const useEnergyBudget = (): EnergyBudget & {
  canPerformAction: (cost: number) => boolean;
} => {
  const { calculateBudget, canPerformAction } = useEnergyStore();
  const { todayTasks } = useTasksStore();
  
  const energyData = useMemo(() => {
    // Calcular energia usada hoje
    const usedEnergy = todayTasks
      .filter(task => task.status === 'pending' || task.status === 'done')
      .reduce((sum, task) => sum + task.energyPoints, 0);
    
    const budget = calculateBudget(usedEnergy);
    
    return {
      ...budget,
      canPerformAction: (cost: number) => canPerformAction(cost, usedEnergy)
    };
  }, [todayTasks, calculateBudget, canPerformAction]);
  
  return energyData;
};
