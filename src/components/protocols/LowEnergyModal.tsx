'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';

export function LowEnergyModal() {
  const { 
    showLowEnergyModal, 
    setShowLowEnergyModal, 
    setCurrentPage,
    replaceWithLightTasks,
    postponeAllTasks,
    todayTasks
  } = useTasksStore();

  if (!showLowEnergyModal) return null;

  const pendingTasksCount = todayTasks.filter(task => task.status === 'pending').length;

  const handleSubstitute = () => {
    replaceWithLightTasks();
    setShowLowEnergyModal(false);
  };

  const handleGoToSandbox = () => {
    setCurrentPage('caixa-de-areia');
    setShowLowEnergyModal(false);
  };

  const handlePostponeDay = () => {
    postponeAllTasks();
    setShowLowEnergyModal(false);
  };

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
          🫂 Protocolo de Baixa Energia
        </h3>
        <p className="text-gray-600 mb-8 text-center leading-relaxed">
          Quando a energia está baixa, temos estratégias comprovadas para não perder o dia. Escolha a que faz mais sentido agora:
        </p>
        
        <div className="space-y-4">
          {/* Opção 1: Substituir por tarefas leves */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubstitute}
            disabled={pendingTasksCount === 0}
            className={`w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 text-left border border-green-200 font-medium ${
              pendingTasksCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            🪶 Modo Energia Baixa (substituir por tarefas de 1 ponto)
            {pendingTasksCount > 0 && (
              <p className="text-green-600 text-xs mt-1">
                Substituir {pendingTasksCount} tarefa{pendingTasksCount !== 1 ? 's' : ''} por atividades de 1 ponto
              </p>
            )}
          </motion.button>

          {/* Opção 2: Ir para Caixa de Areia */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoToSandbox}
            className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-all duration-300 text-left border border-amber-200 font-medium"
          >
            🧠 Modo Reflexão (ir para Caixa de Areia)
            <p className="text-amber-600 text-xs mt-1">
              Espaço seguro para colocar pensamentos para fora
            </p>
          </motion.button>

          {/* Opção 3: Adiar o dia inteiro */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePostponeDay}
            disabled={pendingTasksCount === 0}
            className={`w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 text-left border border-blue-200 font-medium ${
              pendingTasksCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ⏰ Modo Replanejamento (adiar tudo para depois)
            {pendingTasksCount > 0 && (
              <p className="text-blue-600 text-xs mt-1">
                Mover todas as {pendingTasksCount} tarefas para a Sala de Replanejamento
              </p>
            )}
          </motion.button>
        </div>

        {/* Botão fechar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLowEnergyModal(false)}
          className="w-full mt-6 p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300"
        >
          Fechar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
