'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useModalsStore } from '@/stores/modalsStore';
import { Sparkles, CheckSquare, FolderPlus } from 'lucide-react';

export function TransformModal() {
  const { 
    showTransformModal, 
    setShowTransformModal, 
    setShowNewTaskModal, 
    openNewProjectModal,
    setTransformedNote
  } = useModalsStore();

  if (!showTransformModal) return null;

  const handleTransformToTask = () => {
    setTransformedNote(showTransformModal);
    setShowTransformModal(null);
    setShowNewTaskModal(true);
  };

  const handleTransformToProject = () => {
    setTransformedNote(showTransformModal);
    setShowTransformModal(null);
    openNewProjectModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowTransformModal(null)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-energia-normal to-energia-alta rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            ✨ Transformar em Ação
          </h3>
          <p className="text-text-secondary text-sm">
            Como você gostaria de transformar sua ideia?
          </p>
        </div>

        {/* Preview da nota */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-200">
          <p className="text-sm text-amber-700 font-semibold mb-1">💡 Sua ideia:</p>
          <p className="text-sm text-gray-700 italic leading-relaxed">
            &ldquo;{showTransformModal?.content?.slice(0, 120)}{showTransformModal?.content && showTransformModal.content.length > 120 ? '...' : ''}&rdquo;
          </p>
        </div>
        
        {/* Opções */}
        <div className="space-y-4">
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTransformToTask}
            className="w-full p-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-2xl transition-all duration-300 font-medium border border-blue-200 text-left group shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg">📋 Transformar em Tarefa</h4>
                <p className="text-sm text-blue-600 opacity-80 mt-1">
                  Uma ação específica com energia e prazo definidos
                </p>
              </div>
            </div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTransformToProject}
            className="w-full p-6 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-purple-700 rounded-2xl transition-all duration-300 font-medium border border-purple-200 text-left group shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FolderPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg">🏗️ Transformar em Projeto</h4>
                <p className="text-sm text-purple-600 opacity-80 mt-1">
                  Um conjunto de tarefas organizadas para um objetivo maior
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
