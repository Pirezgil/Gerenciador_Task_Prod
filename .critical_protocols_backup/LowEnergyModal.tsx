'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';

export function LowEnergyModal() {
  const { showLowEnergyModal, setShowLowEnergyModal, setCurrentPage } = useTasksStore();

  if (!showLowEnergyModal) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={() => setShowLowEnergyModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          🫂 Está tudo bem não conseguir hoje
        </h3>
        <p className="text-gray-600 mb-8 text-center leading-relaxed">
          Dias difíceis fazem parte da jornada. Como posso te ajudar?
        </p>
        <div className="space-y-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 text-left border border-green-200 font-medium"
          >
            🔄 Substituir por tarefas mais leves
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setCurrentPage('caixa-de-areia');
              setShowLowEnergyModal(false);
            }}
            className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-all duration-300 text-left border border-amber-200 font-medium"
          >
            💭 Desabafar na Caixa de Areia
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 text-left border border-blue-200 font-medium"
          >
            📅 Adiar o dia inteiro
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
