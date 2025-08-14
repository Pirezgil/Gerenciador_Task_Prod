'use client';

// ============================================================================
// NEW PROJECT MODAL - Modal para criação de novos projetos com tijolos iniciais
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Save, AlertCircle, Plus, Trash2, Battery, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateProject } from '@/hooks/api/useProjects';
import { useModalsStore } from '@/stores/modalsStore';
import { useNotification, useAsyncNotification } from '@/hooks/useNotification';
import { useNoteTransformation } from '@/hooks/useNoteTransformation';

interface InitialTask {
  id: string;
  description: string;
  energyPoints: 1 | 3 | 5;
}

const PROJECT_ICONS = [
  '🏗️', '📁', '🎯', '🚀', '💡', '📊', '🔧', '🎨',
  '📝', '💼', '🌟', '⚡', '🔥', '💎', '🏆', '🎪',
  '🌱', '🔬', '🎭', '🏠', '🎵', '📚', '🍕', '✈️'
];

export function NewProjectModal() {
  const createProject = useCreateProject();
  const { showNewProjectModal, openNewProjectModal, transformedNote, setTransformedNote } = useModalsStore();

  const [formData, setFormData] = useState({
    name: '',
    icon: '🏗️',
    notes: ''
  });

  const [initialTasks, setInitialTasks] = useState<InitialTask[]>([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<1 | 3 | 5>(3);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCreating, setIsCreating] = useState(false);

  // Hooks de notificação
  const { success, error } = useNotification();
  const { withLoading } = useAsyncNotification();
  
  // Hook para arquivamento automático de notas
  const { archiveTransformedNote } = useNoteTransformation();

  // Effect para pré-popular com nota transformada
  useEffect(() => {
    if (transformedNote && showNewProjectModal) {
      // Usa as primeiras palavras da nota como nome do projeto
      const projectName = transformedNote.content.slice(0, 50).trim();
      setFormData(prev => ({ ...prev, name: projectName }));
    }
  }, [transformedNote, showNewProjectModal]);

  // VERIFICAÇÃO DE SEGURANÇA ADICIONADA AQUI
  if (!showNewProjectModal) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do projeto é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    if (!formData.icon) {
      newErrors.icon = 'Selecione um ícone para o projeto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addInitialTask = () => {
    if (!newTaskDescription.trim()) return;

    const newTask: InitialTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      description: newTaskDescription.trim(),
      energyPoints: newTaskEnergy
    };

    setInitialTasks([...initialTasks, newTask]);
    setNewTaskDescription('');
    setNewTaskEnergy(3);
  };

  const removeInitialTask = (taskId: string) => {
    setInitialTasks(initialTasks.filter(task => task.id !== taskId));
  };

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4 text-orange-500" />;
    if (points === 3) return <Brain className="w-4 h-4 text-blue-500" />;
    if (points === 5) return <Zap className="w-4 h-4 text-purple-500" />;
    return <Brain className="w-4 h-4 text-blue-500" />; // padrão
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsCreating(true);

    try {
      await withLoading(
        () => createProject.mutateAsync({
          name: formData.name.trim(),
          icon: formData.icon,
          color: '#3B82F6',
          status: 'active',
          backlog: initialTasks.map(task => ({
            description: task.description,
            energyPoints: task.energyPoints,
            status: 'pending',
            isRecurring: false,
            isAppointment: false,
            comments: [],
            attachments: [],
            externalLinks: [],
            history: [],
          })),
          sandboxNotes: formData.notes,
        }),
        {
          loading: 'Criando projeto...',
          success: `Projeto "${formData.name.trim()}" criado com sucesso!`
        },
        {
          context: 'project_crud',
          description: initialTasks.length > 0 ? `Com ${initialTasks.length} tarefa${initialTasks.length !== 1 ? 's' : ''} inicial${initialTasks.length !== 1 ? 's' : ''}` : undefined
        }
      );

      // Arquivar nota transformada se existir
      if (transformedNote) {
        await archiveTransformedNote(transformedNote);
      }

      // Limpar formulário
      setFormData({
        name: '',
        icon: '🏗️',
        notes: ''
      });
      setInitialTasks([]);
      setErrors({});
      setTransformedNote(null);

      openNewProjectModal(false);

    } catch (err) {
      error('Erro ao criar projeto', {
        description: err instanceof Error ? err.message : 'Tente novamente',
        context: 'project_crud'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;

    setFormData({
      name: '',
      icon: '🏗️',
      notes: ''
    });
    setInitialTasks([]);
    setNewTaskDescription('');
    setNewTaskEnergy(3);
    setErrors({});
    setTransformedNote(null);
    openNewProjectModal(false);
  };


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FolderPlus className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Novo Projeto</h2>
              </div>
              <Button
                onClick={handleClose}
                disabled={isCreating}
                variant="ghost"
                size="icon"
                className="p-1 hover:bg-surface/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-purple-100 text-sm mt-1">
              Organize suas grandes ideias em pequenos tijolos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
            {errors.general && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Aprender TypeScript..."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-border-sentinela'
                      }`}
                    disabled={isCreating}
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                  <p className="text-text-secondary text-xs mt-1">
                    {formData.name.length}/50 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone do Projeto *
                  </label>
                  <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                    {PROJECT_ICONS.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        disabled={isCreating}
                        variant={formData.icon === icon ? "default" : "outline"}
                        size="icon"
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110 ${formData.icon === icon
                            ? 'bg-purple-100 border-2 border-purple-500 scale-110'
                            : 'bg-surface border border-gray-200 hover:border-purple-300'
                          }`}
                      >
                        <span className="text-lg">{icon}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Iniciais (Opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Objetivos e ideias..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border-sentinela rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    disabled={isCreating}
                    maxLength={500}
                  />
                  <p className="text-text-secondary text-xs mt-1">
                    {formData.notes.length}/500 caracteres
                  </p>
                </div>
            </div>
          </form>

          <div className="p-6 pt-2 mt-auto shrink-0">
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isCreating || !formData.name.trim()}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Criar Projeto</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                variant="secondary"
                className="w-full px-4 py-3 rounded-xl"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}