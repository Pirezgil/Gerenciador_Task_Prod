'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';

export function CaptureModal() {
  const {
    captureState,
    showCaptureModal,
    resetCaptureState,
    handleCaptureSubmit,
    handleTriageChoice,
    handleClassifyChoice,
    handleScheduleChoice,
    updateCaptureState,
  } = useTasksStore();

  if (!showCaptureModal) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={resetCaptureState}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {captureState.step === 'capture' && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              💭 O que está na sua mente?
            </h3>
            <textarea
              className="w-full h-36 p-4 border border-gray-200/50 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 bg-white/70 backdrop-blur-sm"
              placeholder="Digite qualquer pensamento, ideia ou tarefa... (Ctrl+Enter para nova linha)"
              value={captureState.content}
              onChange={(e) => updateCaptureState({ content: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  const textarea = e.currentTarget;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const newValue = captureState.content.substring(0, start) + '\n' + captureState.content.substring(end);
                  updateCaptureState({ content: newValue });
                  setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                  }, 0);
                }
              }}
              autoFocus
            />
            <div className="flex justify-center mt-6">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCaptureSubmit}
                disabled={!captureState.content.trim()}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  captureState.content.trim()
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuar
              </motion.button>
            </div>
          </>
        )}

        {captureState.step === 'triage' && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              🤔 O que fazer com esta ideia?
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 italic">&quot;{captureState.content}&quot;</p>
            </div>
            <div className="space-y-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTriageChoice('sandbox')}
                className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-all duration-300 font-medium border border-amber-200 text-left"
              >
                🧠 Salvar no Pátio das Ideias
                <p className="text-xs text-amber-600 mt-1">Para processar depois, sem pressão</p>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTriageChoice('task')}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 font-medium border border-blue-200 text-left"
              >
                ✅ Criar Ação
                <p className="text-xs text-blue-600 mt-1">Transformar em tarefa ou projeto</p>
              </motion.button>
            </div>
          </>
        )}

        {captureState.step === 'classify' && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              🏗️ Que tipo de ação é esta?
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 italic">&quot;{captureState.content}&quot;</p>
            </div>
            <div className="space-y-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleClassifyChoice('task')}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 font-medium border border-green-200 text-left"
              >
                🧱 Tijolo (Tarefa Simples)
                <p className="text-xs text-green-600 mt-1">Algo que você pode fazer em uma sessão</p>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleClassifyChoice('project')}
                className="w-full p-4 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-2xl hover:from-purple-100 hover:to-violet-100 transition-all duration-300 font-medium border border-purple-200 text-left"
              >
                🏗️ Montanha (Projeto Grande)
                <p className="text-xs text-purple-600 mt-1">Algo que precisa ser quebrado em pequenos passos</p>
              </motion.button>
            </div>
          </>
        )}

        {captureState.step === 'schedule' && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              📅 Para quando é essa tarefa?
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 italic">&quot;{captureState.content}&quot;</p>
            </div>
            <div className="space-y-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleScheduleChoice('today')}
                className="w-full p-4 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 rounded-2xl hover:from-red-100 hover:to-orange-100 transition-all duration-300 font-medium border border-red-200 text-left"
              >
                🔥 Para Hoje
                <p className="text-xs text-red-600 mt-1">Vai direto para suas Missões de Hoje</p>
              </motion.button>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-blue-700">📅 Ou escolha uma data futura:</label>
                <input
                  type="date"
                  value={captureState.selectedDate}
                  onChange={(e) => updateCaptureState({ selectedDate: e.target.value })}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleScheduleChoice('future', captureState.selectedDate)}
                  disabled={!captureState.selectedDate}
                  className={`w-full p-3 rounded-xl transition-all duration-300 font-medium ${
                    captureState.selectedDate 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Agendar para {captureState.selectedDate ? new Date(captureState.selectedDate).toLocaleDateString('pt-BR') : 'data selecionada'}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
