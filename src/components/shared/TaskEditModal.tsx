'use client';

// ============================================================================
// TASK EDIT MODAL - Versão Refatorada e Autônoma
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Battery, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Stores e Tipos
import { useModalsStore } from '@/stores/modalsStore';
import { useTasksStore } from '@/stores/tasksStore';

export function TaskEditModal() {
  // Estado dos Stores
  const { taskEditModal, closeTaskEditModal } = useModalsStore();
  const { projects, updateTask } = useTasksStore();
  
  // Estado local para o formulário
  const [formData, setFormData] = useState(taskEditModal.task);

  useEffect(() => {
    setFormData(taskEditModal.task);
  }, [taskEditModal.task]);

  if (!taskEditModal.isOpen || !formData) {
    return null;
  }

  const handleSave = () => {
    updateTask(formData.id, formData);
    closeTaskEditModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => prev ? { ...prev, [name]: value } : null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeTaskEditModal}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-surface rounded-2xl shadow-2xl border border-border-sentinela w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-xl font-semibold">Editar Tarefa</h2>
            <Button onClick={closeTaskEditModal} variant="ghost" size="icon" className="p-1 hover:bg-white/20 rounded-full"><X size={20}/></Button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    const textarea = e.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newValue = formData.description.substring(0, start) + '\n' + formData.description.substring(end);
                    setFormData((prev: typeof formData) => prev ? { ...prev, description: newValue } : null);
                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = start + 1;
                    }, 0);
                  }
                }}
                rows={3}
                placeholder="Descrição da tarefa... (Ctrl+Enter para nova linha)"
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Energia */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Energia</label>
              <div className="flex space-x-2">
                {[1, 3, 5].map(e => (
                  <Button
                    key={e}
                    type="button"
                    onClick={() => setFormData((prev: typeof formData) => prev ? { ...prev, energyPoints: e as 1 | 3 | 5 } : null)}
                    variant={formData.energyPoints === e ? "default" : "outline"}
                    className={`flex-1 p-2 rounded-md ${formData.energyPoints === e ? 'border-blue-500 bg-blue-100' : ''}`}
                  >
                    {e} {e === 1 ? <Battery size={16} className="inline-block ml-1 text-orange-500" /> : e === 3 ? <Brain size={16} className="inline-block ml-1 text-blue-500" /> : <Zap size={16} className="inline-block ml-1 text-purple-500" />}
                  </Button>
                ))}
              </div>
            </div>

            {/* Projeto */}
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-text-primary mb-1">Projeto</label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Nenhum</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Comentários */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Comentários</label>
              <div className="space-y-2">
                {formData.comments.map((c: any) => (
                  <div key={c.id} className="text-sm p-2 bg-gray-100 rounded-md whitespace-pre-wrap">{c.content}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-4 bg-surface-secondary/50 border-t">
            <Button onClick={closeTaskEditModal} variant="secondary" className="px-4 py-2 rounded-md">Cancelar</Button>
            <Button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-500 text-white">Salvar Alterações</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}