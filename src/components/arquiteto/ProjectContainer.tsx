'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText, Plus, ArrowRight, Battery, Brain, Zap, Edit3, Trash2, Save, X } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';
import type { Project } from '@/types';

interface ProjectContainerProps {
  project: Project;
}

interface EditingTask {
  taskId: string;
  description: string;
  energyPoints: 1 | 3 | 5;
}

export function ProjectContainer({ project }: ProjectContainerProps) {
  const {
    selectedProjectId,
    setSelectedProjectId,
    addTaskToProject,
    editProjectTask,
    deleteProjectTask,
    moveTaskToToday,
    updateProjectNotes,
  } = useTasksStore();

  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<1 | 3 | 5>(3);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isExpanded = selectedProjectId === project.id;

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4 text-orange-500" />;
    if (points === 3) return <Brain className="w-4 h-4 text-blue-500" />;
    if (points === 5) return <Zap className="w-4 h-4 text-purple-500" />;
  };

  const handleAddTask = () => {
    if (!newTaskDescription.trim()) return;
    
    addTaskToProject(project.id, newTaskDescription.trim(), newTaskEnergy);
    setNewTaskDescription('');
    setNewTaskEnergy(3);
    setShowAddForm(false);
  };

  const startEditing = (taskId: string, description: string, energyPoints: 1 | 3 | 5) => {
    setEditingTask({ taskId, description, energyPoints });
  };

  const saveEdit = () => {
    if (!editingTask || !editingTask.description.trim()) return;
    
    editProjectTask(project.id, editingTask.taskId, editingTask.description.trim(), editingTask.energyPoints);
    setEditingTask(null);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir este tijolo?')) {
      deleteProjectTask(project.id, taskId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{project.icon}</span>
            <div>
              <h3 className="text-lg font-semibold theme-text">{project.name}</h3>
              {project.deadline && (
                <p className="text-sm theme-text-muted">
                  📅 Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedProjectId(isExpanded ? null : project.id)}
            className="p-2 text-gray-400 hover:theme-text-secondary transition-colors"
            title={isExpanded ? "Recolher tijolos" : "Expandir tijolos"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            Caixa de Areia do Projeto
          </h4>
          <textarea
            className="w-full h-20 text-sm theme-text-secondary bg-transparent resize-none border-none focus:outline-none placeholder-amber-400"
            value={project.sandboxNotes}
            placeholder="Rabisque suas ideias livremente aqui..."
            onChange={(e) => updateProjectNotes(project.id, e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium theme-text flex items-center">
                🧱 Backlog de Tijolos
                <span className="ml-2 text-sm bg-gray-200 theme-text-secondary px-2 py-1 rounded-full">
                  {project.backlog.length}
                </span>
              </h4>
              
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1 bg-purple-600 theme-text-on-primary rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Novo Tijolo</span>
              </button>
            </div>

            {/* Formulário de Adicionar Tijolo */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Descreva um pequeno passo..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                      autoFocus
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {[1, 3, 5].map((energy) => (
                          <button
                            key={energy}
                            type="button"
                            onClick={() => setNewTaskEnergy(energy as 1 | 3 | 5)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs transition-all ${
                              newTaskEnergy === energy
                                ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                                : 'bg-gray-100 border border-gray-300 theme-text-secondary hover:border-purple-300'
                            }`}
                          >
                            {getEnergyIcon(energy)}
                            <span>{energy}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="px-3 py-1 theme-text-secondary hover:bg-gray-100 rounded-lg text-xs transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAddTask}
                          disabled={!newTaskDescription.trim()}
                          className="px-3 py-1 bg-purple-600 theme-text-on-primary rounded-lg text-xs hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Salvar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de Tijolos */}
            <div className="space-y-2">
              {project.backlog.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 group hover:shadow-sm transition-all"
                >
                  {editingTask?.taskId === task.id ? (
                    // Modo de Edição
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingTask.description}
                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                      
                      <div className="flex space-x-1">
                        {[1, 3, 5].map((energy) => (
                          <button
                            key={energy}
                            onClick={() => setEditingTask({ ...editingTask, energyPoints: energy as 1 | 3 | 5 })}
                            className={`p-1 rounded transition-all ${
                              editingTask.energyPoints === energy
                                ? 'bg-purple-100 border border-purple-500'
                                : 'bg-gray-100 border border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            {getEnergyIcon(energy)}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={saveEdit}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-all"
                          title="Salvar"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 theme-text-muted hover:bg-gray-50 rounded transition-all"
                          title="Cancelar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo de Visualização
                    <>
                      <div className="flex items-center flex-1 min-w-0">
                        {getEnergyIcon(task.energyPoints)}
                        <span className="ml-3 text-sm theme-text truncate">
                          {task.description}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(task.id, task.description, task.energyPoints)}
                          className="p-1 theme-text-muted hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Editar tijolo"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1 theme-text-muted hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Excluir tijolo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => moveTaskToToday(project.id, task.id)}
                          className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
                          title="Mover para hoje"
                        >
                          <span>🧱</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {project.backlog.length === 0 && (
                <div className="text-center py-8 theme-text-muted">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm">
                    Nenhum tijolo no backlog ainda! <br />
                    Clique em "Novo Tijolo" para adicionar tarefas.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

