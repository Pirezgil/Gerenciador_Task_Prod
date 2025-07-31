'use client';

// ============================================================================
// NEW TASK MODAL - Modal para criação de tarefas individuais
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, Flame, Battery, Brain, Zap } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { description: string; energyPoints: 1 | 3 | 5; projectId?: string }) => void;
}

export function NewTaskModal({ isOpen, onClose, onSubmit }: NewTaskModalProps) {
  const { projects, calculateEnergyBudget, canAddTask } = useTasksStore();
  
  const [formData, setFormData] = useState({
    description: '',
    energyPoints: 3 as 1 | 3 | 5,
    projectId: undefined as string | undefined
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCreating, setIsCreating] = useState(false);

  const energyBudget = calculateEnergyBudget();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição da tarefa é obrigatória';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Descrição deve ter no máximo 200 caracteres';
    }
    
    if (!canAddTask(formData.energyPoints)) {
      newErrors.energy = `Energia insuficiente! Disponível: ${energyBudget.remaining}, necessário: ${formData.energyPoints}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4 text-orange-500" />;
    if (points === 3) return <Brain className="w-4 h-4 text-blue-500" />;
    if (points === 5) return <Zap className="w-4 h-4 text-purple-500" />;
  };

  const getEnergyLabel = (points: number) => {
    if (points === 1) return 'Rápida';
    if (points === 3) return 'Normal';
    if (points === 5) return 'Complexa';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsCreating(true);
    
    try {
      // Simula delay para UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onSubmit({
        description: formData.description.trim(),
        energyPoints: formData.energyPoints,
        projectId: formData.projectId
      });
      
      // Reset form
      setFormData({
        description: '',
        energyPoints: 3,
        projectId: undefined
      });
      setErrors({});
      
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      setErrors({ general: 'Erro ao criar tarefa. Tente novamente.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    
    setFormData({
      description: '',
      energyPoints: 3,
      projectId: undefined
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Flame className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Nova Tarefa</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="p-1 hover:bg-surface/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-orange-100 text-sm mt-1">
              Apague esse incêndio hoje mesmo! 🚒
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            {/* Descrição da Tarefa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Que tarefa precisa ser resolvida hoje? *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Responder email urgente do cliente..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-border-sentinela'
                }`}
                disabled={isCreating}
                maxLength={200}
              />
              {errors.description && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="text-text-secondary text-xs mt-1">
                {formData.description.length}/200 caracteres
              </p>
            </div>

            {/* Nível de Energia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Complexidade *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 3, 5].map((energy) => (
                  <button
                    key={energy}
                    type="button"
                    onClick={() => setFormData({ ...formData, energyPoints: energy as 1 | 3 | 5 })}
                    disabled={isCreating}
                    className={`flex flex-col items-center space-y-2 p-4 rounded-xl text-center transition-all border-2 ${
                      formData.energyPoints === energy
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-background text-gray-600 hover:border-orange-300'
                    }`}
                  >
                    {getEnergyIcon(energy)}
                    <div>
                      <div className="font-semibold text-lg">{energy}</div>
                      <div className="text-xs">{getEnergyLabel(energy)}</div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.energy && (
                <p className="text-red-600 text-xs mt-2 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.energy}
                </p>
              )}
            </div>

            {/* Projeto Relacionado (Opcional) */}
            {projects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projeto Relacionado (Opcional)
                </label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value || undefined })}
                  disabled={isCreating}
                  className="w-full px-4 py-3 border border-border-sentinela rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Nenhum projeto específico</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.icon} {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Energy Budget Info */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Energia Disponível:</span>
                <span className="font-semibold text-blue-800">
                  {energyBudget.remaining} de {energyBudget.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(energyBudget.used / energyBudget.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating || !formData.description.trim() || !canAddTask(formData.energyPoints)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Criar Tarefa</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}