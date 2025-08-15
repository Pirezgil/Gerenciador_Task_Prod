'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface EnergyMeterProps {
  used: number;
  total: number;
}

export function EnergyMeter({ used, total }: EnergyMeterProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const remaining = total - used;
  
  // Determinar estado da energia - PALETA SIMPLIFICADA
  let energyStatus = {
    bgColor: 'bg-green-500',
    textColor: 'text-green-800',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    icon: '🔋',
    label: 'Energia Alta',
    description: 'Você está com muita energia para realizar suas tarefas!'
  };
  
  if (percentage > 85) {
    energyStatus = {
      bgColor: 'bg-red-500',
      textColor: 'text-red-800',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-200',
      icon: '🔴',
      label: 'Energia Crítica',
      description: 'Considere fazer uma pausa e recarregar suas energias.'
    };
  } else if (percentage > 60) {
    energyStatus = {
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-800',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      icon: '⚡',
      label: 'Energia Média',
      description: 'Boa energia para continuar, mas monitore seu ritmo.'
    };
  }

  return (
    <div className={`${energyStatus.bgClass} rounded-2xl shadow-sm border-2 ${energyStatus.borderClass} p-6 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${energyStatus.bgClass} rounded-xl flex items-center justify-center border ${energyStatus.borderClass}`}>
            <span className="text-xl">{energyStatus.icon}</span>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${energyStatus.textColor}`}>
              {energyStatus.label}
            </h3>
            <p className={`text-sm ${energyStatus.textColor} opacity-80`}>
              Orçamento de Energia Diário
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${energyStatus.textColor}`}>
            {remaining}
          </div>
          <div className={`text-sm ${energyStatus.textColor} opacity-70`}>
            de {total} disponível
          </div>
        </div>
      </div>
      
      {/* Barra de Progresso Redesenhada */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <span>Energia Usada</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-3 shadow-inner">
          <motion.div
            className={`h-3 rounded-full ${energyStatus.bgColor} shadow-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </div>
      </div>
      
      {/* Dica contextual */}
      <div className={`mt-4 p-3 bg-white/50 rounded-xl border ${energyStatus.borderClass}`}>
        <p className={`text-xs ${energyStatus.textColor} text-center font-medium`}>
          💡 {energyStatus.description}
        </p>
      </div>
    </div>
  );
}