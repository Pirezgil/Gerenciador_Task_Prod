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
  
  // Debug: Log para verificar props
  console.log('⚡ EnergyMeter - Debug:', { used, total, percentage });

  let bgColor = 'bg-green-500';
  if (percentage > 75) {
    bgColor = 'bg-red-500';
  } else if (percentage > 50) {
    bgColor = 'bg-yellow-500';
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-md font-semibold text-gray-700">Orçamento de Energia do Dia</h3>
        </div>
        <span className="text-lg font-bold text-gray-800">
          {used} / {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          className={`h-2.5 rounded-full ${bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}