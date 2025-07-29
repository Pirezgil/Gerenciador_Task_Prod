'use client';

// ============================================================================
// ENERGY METER - Medidor de energia do dia
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';

export function EnergyMeter() {
  const { calculateEnergyBudget } = useTasksStore();
  const energyBudget = calculateEnergyBudget();
  
  const { used, total, percentage, isOverBudget } = energyBudget;
  const isNearLimit = percentage > 80;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center mr-3">
            <Flame className="w-5 h-5 text-white" />
          </div>
          Energia do Dia
        </h3>
        <span className={`text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm ${
          isOverBudget ? "bg-orange-100/80 text-orange-700 border border-orange-200" : 
          isNearLimit ? "bg-yellow-100/80 text-yellow-700 border border-yellow-200" : "bg-green-100/80 text-green-700 border border-green-200"
        }`}>
          {used}/{total} pontos
        </span>
      </div>
      
      <div className="relative w-full bg-gray-200/50 rounded-full h-5 mb-4 overflow-hidden">
        <motion.div
          className={`h-full rounded-full relative overflow-hidden ${
            isOverBudget ? "bg-gradient-to-r from-orange-400 to-red-400" : 
            isNearLimit ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-gradient-to-r from-green-400 to-emerald-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        </motion.div>
      </div>
      
      {isOverBudget ? (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-4 rounded-xl">
          <p className="text-sm text-orange-700 flex items-center">
            <span className="text-lg mr-2">💡</span>
            Dia um pouco cheio! Considere reorganizar algumas tarefas.
          </p>
        </div>
      ) : energyBudget.isComplete ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-sm text-blue-700 flex items-center">
            <span className="text-lg mr-2">🎯</span>
            Perfeito! Seu dia está completo. Energia totalmente alocada.
          </p>
        </div>
      ) : percentage > 60 ? (
        <p className="text-sm text-gray-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
          <span className="text-lg mr-2">✨</span>
          Bom ritmo! Você está conseguindo manter o equilíbrio.
        </p>
      ) : (
        <p className="text-sm text-gray-600 bg-green-50/50 p-3 rounded-xl border border-green-100">
          <span className="text-lg mr-2">🌟</span>
          Energia preservada! Espaço para mais atividades se surgir algo importante.
        </p>
      )}
    </div>
  );
}
