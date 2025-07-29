'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';

export function DecompositionModal() {
  const { showDecompositionModal, setShowDecompositionModal, handleDecomposition } = useTasksStore();
  const [firstBrick, setFirstBrick] = useState('');

  if (!showDecompositionModal) return null;

  const onSubmit = () => {
    if (!firstBrick.trim()) {
      alert('❗ Por favor, descreva o primeiro tijolo antes de continuar.');
      return;
    }
    
    handleDecomposition({
      originalTask: showDecompositionModal,
      firstBrick: firstBrick.trim(),
    });
    
    setFirstBrick('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={() => setShowDecompositionModal(null)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          🔧 Vamos quebrar esta tarefa?
        </h3>
        <p className="text-gray-600 mb-4 text-center">
          Esta tarefa foi adiada {showDecompositionModal?.postponedCount} vezes. Talvez ela seja grande demais. Vamos transformá-la em um projeto?
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 font-medium">Tarefa original:</p>
          <p className="text-sm text-gray-600 italic mt-1">"{showDecompositionModal?.description}"</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual seria o primeiro tijolinho mais simples?
            </label>
            <input
              type="text"
              placeholder="Ex: Abrir o documento e ler o primeiro parágrafo"
              value={firstBrick}
              onChange={(e) => setFirstBrick(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDecompositionModal(null)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25"
            >
              Quebrar em projeto
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
