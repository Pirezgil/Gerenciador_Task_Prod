'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';
import { useModalsStore } from '@/stores/modalsStore';

export function EmergencyChoiceModal() {
  const { showEmergencyModal, setShowEmergencyModal } = useModalsStore();
  const { 
    todayTasks,
    postponeTask,
    calculateEnergyBudget
  } = useTasksStore();

  const [selectedTaskToMove, setSelectedTaskToMove] = useState<string | null>(null);

  if (!showEmergencyModal) return null;

  const pendingTasks = todayTasks.filter(task => task.status === 'pending');
  const energyBudget = calculateEnergyBudget();

  const handleMoveTask = () => {
    if (!selectedTaskToMove) return;

    // Mover tarefa selecionada para sala de replanejamento
    postponeTask(selectedTaskToMove);

    // Modal será fechado para permitir adicionar nova tarefa
    setShowEmergencyModal(false);
  };

  const getEnergyColor = (points: number) => {
    if (points === 1) return 'text-orange-500 bg-orange-100';
    if (points === 3) return 'text-blue-500 bg-blue-100';
    return 'text-purple-500 bg-purple-100';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={() => setShowEmergencyModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-orange-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              🚨 Incêndio Detectado!
            </h3>
            <p className="text-gray-600 text-sm">
              Seu orçamento de energia está cheio ({energyBudget.used}/{energyBudget.total}), mas você precisa adicionar uma tarefa urgente.
            </p>
          </div>

          {/* Situação de emergência */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 mb-6 border border-red-200">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="font-semibold text-red-700">Situação de Emergência</span>
            </div>
            <p className="text-gray-800 text-sm">
              Você precisa adicionar uma tarefa urgente, mas seu orçamento de energia está completo. 
              Escolha uma tarefa para reagendar e liberar espaço.
            </p>
          </div>

          {/* Estratégia */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Escolha uma tarefa para reagendar:
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTaskToMove === task.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-gray-50'
                  }`}
                  onClick={() => setSelectedTaskToMove(task.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium truncate">
                        {task.description}
                      </p>
                      {task.projectId && (
                        <p className="text-xs text-gray-500 mt-1">
                          📁 Projeto ID: {task.projectId}
                        </p>
                      )}
                    </div>
                    <div className={`ml-3 px-2 py-1 rounded-lg text-xs font-medium ${getEnergyColor(task.energyPoints)}`}>
                      {task.energyPoints}pt
                    </div>
                    {selectedTaskToMove === task.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500 ml-2" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEmergencyModal(false)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMoveTask}
              disabled={!selectedTaskToMove}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Flame className="w-4 h-4" />
              <span>Apagar Incêndio</span>
            </motion.button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            A tarefa reagendada irá para a Sala de Replanejamento
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
