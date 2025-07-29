import { useState, useEffect, useRef, useCallback } from 'react';
import { useTasksStore } from '../stores/tasksStore';

interface EnergyBudget {
  current: number;
  max: number;
  percentage: number;
  canPerformAction: (cost: number) => boolean;
  consumeEnergy: (cost: number) => boolean;
}

export const useEnergyBudget = (): EnergyBudget => {
  const { energy, maxEnergy, updateEnergy } = useTasksStore();
  
  // CORREÇÃO: Flags para prevenir loop infinito
  const isUpdatingRef = useRef(false);
  const lastEnergyRef = useRef(energy);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // CORREÇÃO: Estado local para controlar re-renderizações
  const [localEnergy, setLocalEnergy] = useState(energy);
  
  // CORREÇÃO: Debounced energy check para prevenir múltiplas verificações
  const debouncedEnergyCheck = useCallback((newEnergy: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (!isUpdatingRef.current && lastEnergyRef.current !== newEnergy) {
        lastEnergyRef.current = newEnergy;
        setLocalEnergy(newEnergy);
      }
    }, 100); // 100ms debounce
  }, []);
  
  // CORREÇÃO: Effect com controle de dependências para evitar loop
  useEffect(() => {
    // Só atualiza se realmente mudou e não está em processo de atualização
    if (energy !== lastEnergyRef.current && !isUpdatingRef.current) {
      debouncedEnergyCheck(energy);
    }
  }, [energy, debouncedEnergyCheck]);
  
  // CORREÇÃO: Cleanup do timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  const canPerformAction = useCallback((cost: number): boolean => {
    return localEnergy >= cost;
  }, [localEnergy]);
  
  const consumeEnergy = useCallback((cost: number): boolean => {
    if (!canPerformAction(cost) || isUpdatingRef.current) {
      return false;
    }
    
    // CORREÇÃO: Flag para prevenir re-entrada durante atualização
    isUpdatingRef.current = true;
    
    try {
      const newEnergy = Math.max(0, localEnergy - cost);
      
      // Atualizar estado local primeiro (não dispara re-render do store)
      setLocalEnergy(newEnergy);
      lastEnergyRef.current = newEnergy;
      
      // Atualizar store de forma controlada
      setTimeout(() => {
        updateEnergy(newEnergy);
        isUpdatingRef.current = false;
      }, 50); // Pequeno delay para quebrar o ciclo síncrono
      
      return true;
    } catch (error) {
      console.error('Erro ao consumir energia:', error);
      isUpdatingRef.current = false;
      return false;
    }
  }, [localEnergy, canPerformAction, updateEnergy]);
  
  return {
    current: localEnergy,
    max: maxEnergy,
    percentage: maxEnergy > 0 ? Math.round((localEnergy / maxEnergy) * 100) : 0,
    canPerformAction,
    consumeEnergy
  };
};
