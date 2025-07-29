'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';

export function TransformModal() {
  const { showTransformModal, setShowTransformModal, transformNoteToAction } = useTasksStore();
  const [scheduleDate1, setScheduleDate1] = useState('');
  const [scheduleDate3, setScheduleDate3] = useState('');

  if (!showTransformModal) return null;

  const handleTransform = (targetType: 'task' | 'project', energyPoints = 3, scheduleDate?: string) => {
    if (targetType === 'task' && scheduleDate) {
      const selectedDate = new Date(scheduleDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (selectedDate < tomorrow) {
        alert('❗ Por favor, escolha uma data futura (a partir de amanhã).');
        return;
      }
    }

    transformNoteToAction({
      note: showTransformModal,
      targetType,
      energyPoints: energyPoints as 1 | 3 | 5,
      scheduleDate,
    });

    setShowTransformModal(null);
    setScheduleDate1('');
    setScheduleDate3('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={() => {
        setShowTransformModal(null);
        setScheduleDate1('');
        setScheduleDate3('');
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          ✨ Transformar em ação
        </h3>
        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-700 font-medium">Sua ideia:</p>
          <p className="text-sm text-gray-700 italic mt-1">
            "{showTransformModal?.content?.slice(0, 100)}{showTransformModal?.content?.length > 100 ? '...' : ''}"
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTransform('task', 1)}
              className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 font-medium border border-green-200 text-left"
            >
              🧱 Tarefa Simples - Para Hoje (1 ponto)
            </motion.button>
            <div className="mt-2">
              <label className="block text-xs text-green-600 mb-1">Ou agendar para:</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={scheduleDate1}
                  onChange={(e) => setScheduleDate1(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="flex-1 p-2 border border-green-200 rounded-xl text-xs bg-white"
                />
                <button
                  onClick={() => {
                    if (scheduleDate1) {
                      handleTransform('task', 1, scheduleDate1);
                    } else {
                      alert('❗ Por favor, selecione uma data.');
                    }
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors"
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTransform('task', 3)}
              className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 font-medium border border-blue-200 text-left"
            >
              🧠 Tarefa Média - Para Hoje (3 pontos)
            </motion.button>
            <div className="mt-2">
              <label className="block text-xs text-blue-600 mb-1">Ou agendar para:</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={scheduleDate3}
                  onChange={(e) => setScheduleDate3(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="flex-1 p-2 border border-blue-200 rounded-xl text-xs bg-white"
                />
                <button
                  onClick={() => {
                    if (scheduleDate3) {
                      handleTransform('task', 3, scheduleDate3);
                    } else {
                      alert('❗ Por favor, selecione uma data.');
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors"
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTransform('project')}
            className="w-full p-4 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-2xl hover:from-purple-100 hover:to-violet-100 transition-all duration-300 font-medium border border-purple-200 text-left"
          >
            🏗️ Projeto Grande
            <p className="text-xs text-purple-600 mt-1">Precisa ser quebrado em pequenos passos</p>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
