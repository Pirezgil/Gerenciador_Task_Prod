'use client';

// ============================================================================
// TASK EDIT MODAL - Modal para edição de tarefas com funcionalidades avançadas
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Battery, Brain, Zap, MessageSquare, Save, X, Edit2, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTasksStore } from '@/stores/tasksStore';
import type { EnergyLevel } from '@/types';

export function TaskEditModal() {
  const {
    taskEditModal,
    setTaskEditModal,
    updateTaskEditData,
    saveTaskEdit,
    editTaskComment,
    deleteTaskComment,
    projects,
  } = useTasksStore();

  const { isOpen, task, editData } = taskEditModal;
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const handleClose = () => {
    setTaskEditModal({
      isOpen: false,
      task: null,
      editData: {
        description: '',
        energyPoints: 3,
        projectId: undefined,
        comment: '',
      },
    });
    setEditingComment(null);
    setEditCommentText('');
  };

  const handleSave = () => {
    if (!task) return;
    
    saveTaskEdit({
      taskId: task.id,
      description: editData.description,
      energyPoints: editData.energyPoints,
      projectId: editData.projectId,
      comment: editData.comment,
    });
    
    handleClose();
  };

  // Handler para Enter no comentário
  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editData.comment.trim()) {
        handleSave();
      }
    }
  };

  // Handler para Enter na descrição
  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (editData.description.trim()) {
        handleSave();
      }
    }
  };

  // Iniciar edição de comentário
  const startEditComment = (commentId: string, content: string) => {
    setEditingComment(commentId);
    setEditCommentText(content);
  };

  // Salvar edição de comentário
  const saveCommentEdit = () => {
    if (!task || !editingComment) return;
    
    editTaskComment({
      commentId: editingComment,
      taskId: task.id,
      newContent: editCommentText,
    });
    
    setEditingComment(null);
    setEditCommentText('');
  };

  // Handler para Enter na edição de comentário
  const handleEditCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editCommentText.trim()) {
        saveCommentEdit();
      }
    } else if (e.key === 'Escape') {
      setEditingComment(null);
      setEditCommentText('');
    }
  };

  // Cancelar edição
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText('');
  };

  // Deletar comentário
  const handleDeleteComment = (commentId: string) => {
    if (!task) return;
    if (confirm('Tem certeza que deseja excluir este comentário?')) {
      deleteTaskComment(task.id, commentId);
    }
  };

  const energyOptions = [
    { value: 1, label: 'Bateria Fraca', icon: Battery, color: 'orange' },
    { value: 3, label: 'Cérebro Normal', icon: Brain, color: 'blue' },
    { value: 5, label: 'Cérebro Ligado', icon: Zap, color: 'purple' },
  ];

  if (!isOpen || !task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Tarefa"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição da Tarefa
            <span className="text-xs text-text-secondary ml-2">(Ctrl+Enter para salvar)</span>
          </label>
          <textarea
            value={editData.description}
            onChange={(e) => updateTaskEditData({ description: e.target.value })}
            onKeyDown={handleDescriptionKeyDown}
            placeholder="Descreva sua tarefa..."
            className="w-full h-20 px-4 py-3 border border-border-sentinela rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Nível de Energia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nível de Energia
          </label>
          <div className="grid grid-cols-3 gap-3">
            {energyOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = editData.energyPoints === option.value;
              
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateTaskEditData({ energyPoints: option.value as EnergyLevel })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-border-sentinela'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    isSelected ? `text-${option.color}-600` : 'text-gray-400'
                  }`} />
                  <div className={`text-xs font-medium ${
                    isSelected ? `text-${option.color}-700` : 'text-gray-600'
                  }`}>
                    {option.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Projeto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projeto (Opcional)
          </label>
          <select
            value={editData.projectId || ''}
            onChange={(e) => updateTaskEditData({ projectId: e.target.value || undefined })}
            className="w-full px-4 py-3 border border-border-sentinela rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Nenhum projeto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.icon} {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Comentário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Comentário
            <span className="text-xs text-text-secondary ml-2">(Enter para postar)</span>
          </label>
          <textarea
            value={editData.comment}
            onChange={(e) => updateTaskEditData({ comment: e.target.value })}
            onKeyDown={handleCommentKeyDown}
            placeholder="Adicione um comentário sobre esta tarefa..."
            className="w-full h-24 px-4 py-3 border border-border-sentinela rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Histórico de Comentários */}
        {task.comments && task.comments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Histórico de Comentários
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {task.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg group">
                  {editingComment === comment.id ? (
                    // Modo de edição
                    <div className="space-y-2">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        onKeyDown={handleEditCommentKeyDown}
                        className="w-full p-2 text-sm border border-border-sentinela rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelEditComment}
                          className="px-2 py-1 text-xs text-text-secondary hover:text-gray-700"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={saveCommentEdit}
                          disabled={!editCommentText.trim()}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Salvar
                        </button>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Enter para salvar • Esc para cancelar
                      </p>
                    </div>
                  ) : (
                    // Modo de visualização
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{comment.content}</p>
                        <p className="text-xs text-text-secondary mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                          {comment.updatedAt !== comment.createdAt && (
                            <span className="ml-1 italic">(editado)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditComment(comment.id, comment.content)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar comentário"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir comentário"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editData.description.trim()}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
