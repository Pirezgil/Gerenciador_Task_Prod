'use client';

// ============================================================================
// ENERGY METER - Medidor de energia do dia
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';
import { useAuthStore } from '@/stores/authStore';

export function EnergyMeter() {
  const { calculateEnergyBudget } = useTasksStore();
  const { user } = useAuthStore();
  const energyBudget = calculateEnergyBudget();
  
  // Reagir a mudanças no orçamento de energia do usuário
  React.useEffect(() => {
    if (user?.settings.dailyEnergyBudget) {
      // Force re-render quando orçamento mudar
    }
  }, [user?.settings.dailyEnergyBudget]);
  
  const { used, total, percentage, isOverBudget } = energyBudget;
  const isNearLimit = percentage > 80;

  return (
    <div className="sentinela-card responsive-card shadow-medium">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold theme-text flex items-center">
          <div className="w-10 h-10 rounded-xl bg-energia-alta flex items-center justify-center mr-3">
            <Flame className="w-5 h-5 theme-text-on-primary" />
          </div>
          Energia do Dia
        </h3>
        <span className={`text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm ${
          isOverBudget ? "bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30" : 
          isNearLimit ? "bg-semantic-alert/20 text-semantic-alert border border-semantic-alert/30" : "bg-semantic-success/20 text-semantic-success border border-semantic-success/30"
        }`}>
          {used}/{total} pontos
        </span>
      </div>
      
      <div className="relative w-full bg-gray-200/50 rounded-full h-5 mb-4 overflow-hidden">
        <motion.div
          className={`h-full rounded-full relative overflow-hidden ${
            isOverBudget ? "bg-semantic-warning" : 
            isNearLimit ? "bg-semantic-alert" : "bg-semantic-success"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        </motion.div>
      </div>
      
      {isOverBudget ? (
        <div className="bg-semantic-warning/10 border border-semantic-warning/30 p-4 rounded-xl">
          <p className="text-sm text-semantic-warning flex items-center">
            <span className="text-lg mr-2">💡</span>
            Dia um pouco cheio! Considere reorganizar algumas tarefas.
          </p>
        </div>
      ) : energyBudget.isComplete ? (
        <div className="bg-energia-normal/10 border border-energia-normal/30 p-4 rounded-xl">
          <p className="text-sm text-energia-normal flex items-center">
            <span className="text-lg mr-2">🎯</span>
            Perfeito! Seu dia está completo. Energia totalmente alocada.
          </p>
        </div>
      ) : percentage > 60 ? (
        <p className="text-sm theme-text-secondary bg-energia-normal/10 p-3 rounded-xl border border-energia-normal/20">
          <span className="text-lg mr-2">✨</span>
          Bom ritmo! Você está conseguindo manter o equilíbrio.
        </p>
      ) : (
        <p className="text-sm theme-text-secondary bg-energia-baixa/10 p-3 rounded-xl border border-energia-baixa/20">
          <span className="text-lg mr-2">🌟</span>
          Energia preservada! Espaço para mais atividades se surgir algo importante.
        </p>
      )}
    </div>
  );
}
