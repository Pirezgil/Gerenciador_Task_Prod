'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText, Plus, ArrowRight, Battery, Brain, Zap, Edit3, Trash2, Save, X, MessageSquare, Paperclip, Link2 } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';
import { useModalsStore } from '@/stores/modalsStore';
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
  console.log('🧱 ProjectContainer - Debug project:', project);
  console.log('🧱 ProjectContainer - Backlog:', project.backlog);
  
  const {
    selectedProjectId,
    setSelectedProjectId,
    addTaskToProject,
    editProjectTask,
    deleteProjectTask,
    moveTaskToToday,
    updateProjectNotes,
    todayTasks,
    postponedTasks,
  } = useTasksStore();
  const { openNewTaskModal } = useModalsStore();

  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<1 | 3 | 5>(3);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sandboxExpanded, setSandboxExpanded] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const isExpanded = selectedProjectId === project.id;

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4 text-orange-500" />;
    if (points === 5) return <Zap className="w-4 h-4 text-purple-500" />;
    return <Brain className="w-4 h-4 text-blue-500" />;
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

  const handleNewBrick = () => {
    openNewTaskModal(true, project.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{project.icon}</span>
            <div>
              <h3 className="text-lg font-semibold theme-text">{project.name}</h3>
              <div className="flex items-center space-x-4 text-sm">
                {project.deadline && (
                  <p className="theme-text-muted">
                    📅 Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <p className="theme-text-muted">
                  🧱 {(() => {
                    const allTasks = [
                      ...project.backlog,
                      ...todayTasks.filter(task => task.projectId === project.id),
                      ...postponedTasks.filter(task => task.projectId === project.id)
                    ];
                    return allTasks.length;
                  })()} tijolos
                </p>
                {project.backlog.filter(t => t.status === 'completed').length > 0 && (
                  <p className="text-green-600">
                    ✅ {project.backlog.filter(t => t.status === 'completed').length} concluídos
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewBrick}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Novo Tijolo</span>
            </button>
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
        </div>

      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h4 className="text-md font-medium theme-text flex items-center">
                  🧱 Tijolos do projeto
                  <span className="ml-2 text-sm bg-gray-200 theme-text-secondary px-2 py-1 rounded-full">
                    {(() => {
                      const allTasks = [
                        ...project.backlog,
                        ...todayTasks.filter(task => task.projectId === project.id),
                        ...postponedTasks.filter(task => task.projectId === project.id)
                      ];
                      return allTasks.length;
                    })()}
                  </span>
                </h4>
                
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {(() => {
                      const allTasks = [
                        ...project.backlog,
                        ...todayTasks.filter(task => task.projectId === project.id),
                        ...postponedTasks.filter(task => task.projectId === project.id)
                      ];
                      return allTasks.filter(t => t.status === 'pending').length;
                    })()} pendentes
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {(() => {
                      const allTasks = [
                        ...project.backlog,
                        ...todayTasks.filter(task => task.projectId === project.id),
                        ...postponedTasks.filter(task => task.projectId === project.id)
                      ];
                      return allTasks.filter(t => t.status === 'completed').length;
                    })()} concluídos
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <button
                onClick={() => setSandboxExpanded(!sandboxExpanded)}
                className="w-full flex items-center justify-between text-sm font-medium text-amber-800 mb-2 hover:text-amber-900 transition-colors"
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Caixa de Areia do Projeto
                </div>
                <motion.div animate={{ rotate: sandboxExpanded ? 180 : 0 }}>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.div>
              </button>
              <AnimatePresence>
                {sandboxExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <textarea
                      className="w-full min-h-[5rem] text-sm theme-text-secondary bg-transparent resize-y border-none focus:outline-none placeholder-amber-400"
                      value={project.sandboxNotes}
                      placeholder="Rabisque suas ideias livremente aqui..."
                      onChange={(e) => updateProjectNotes(project.id, e.target.value)}
                      style={{ height: 'auto', minHeight: '5rem' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.max(80, target.scrollHeight) + 'px';
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Formulário de Adicionar Tijolo */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-lg p-4 border border-gray-200 mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Descreva o novo tijolo..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                      autoFocus
                    />
                    
                    <div className="flex space-x-1">
                      {[1, 3, 5].map((energy) => (
                        <button
                          key={energy}
                          onClick={() => setNewTaskEnergy(energy as 1 | 3 | 5)}
                          className={`p-2 rounded transition-all ${
                            newTaskEnergy === energy
                              ? 'bg-purple-100 border border-purple-500'
                              : 'bg-gray-100 border border-gray-300 hover:border-purple-300'
                          }`}
                          title={`${energy} pontos de energia`}
                        >
                          {getEnergyIcon(energy)}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={handleAddTask}
                        disabled={!newTaskDescription.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Salvar</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de Tijolos em formato de lista */}
            <div className="space-y-2">
              {(() => {
                const allTasks = [
                  ...project.backlog,
                  ...todayTasks.filter(task => task.projectId === project.id),
                  ...postponedTasks.filter(task => task.projectId === project.id)
                ];
                
                return allTasks.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Nenhum tijolo criado ainda
                  </div>
                ) : (
                  allTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 border rounded-lg hover:shadow-md transition-all border-l-4 ${
                    task.status === 'completed' 
                      ? 'border-l-green-500 bg-green-50 border-green-200' 
                      : 'border-l-blue-500 bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 cursor-pointer flex items-center space-x-3" onClick={() => window.location.href = `/task/${task.id}`}>
                      <div className="flex items-center space-x-2">
                        {getEnergyIcon(task.energyPoints)}
                        <h4 className={`font-medium ${task.status === 'completed' ? 'text-green-800' : 'theme-text'}`}>
                          {task.description}
                        </h4>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {task.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </span>
                      <div className="text-xs text-gray-500 flex items-center space-x-3">
                        <span>
                          {task.deadline ? (
                            <>📅 {new Date(task.deadline).toLocaleDateString('pt-BR')}</>
                          ) : (
                            <>📅 Sem prazo</>
                          )}
                        </span>
                        <span className="text-gray-400">
                          Criado em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveTaskToToday(project.id, task.id);
                          window.location.href = '/bombeiro';
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        title="Mover para hoje"
                      >
                        Atuar hoje
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTask(expandedTask === task.id ? null : task.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title={expandedTask === task.id ? "Recolher detalhes" : "Expandir detalhes"}
                      >
                        <motion.div animate={{ rotate: expandedTask === task.id ? 180 : 0 }}>
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Detalhes expandidos */}
                  <AnimatePresence>
                    {expandedTask === task.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        {/* Comentários */}
                        {task.comments && task.comments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <MessageSquare className="w-4 h-4 mr-2" /> Comentários
                            </h4>
                            <div className="space-y-2">
                              {task.comments.map(comment => (
                                <div key={comment.id} className="text-xs bg-gray-100 p-2 rounded-md">
                                  <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                                  <p className="text-gray-500 text-right mt-1">
                                    - {comment.author} em {new Date(comment.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Anexos */}
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Paperclip className="w-4 h-4 mr-2" /> Anexos
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {task.attachments.map(attachment => (
                                <a 
                                  href={attachment.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  key={attachment.name} 
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200"
                                >
                                  {attachment.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links relacionados */}
                        {task.relatedLinks && task.relatedLinks.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Link2 className="w-4 h-4 mr-2" /> Links Relacionados
                            </h4>
                            <div className="space-y-1">
                              {task.relatedLinks.map((link, index) => (
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  key={index} 
                                  className="block text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  {link.title || link.url}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Informações adicionais */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Energia necessária:</span>
                            <div className="flex items-center mt-1">
                              {getEnergyIcon(task.energyPoints)}
                              <span className="ml-1">{task.energyPoints} pontos</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Última atualização:</span>
                            <div className="mt-1">
                              {task.updatedAt ? new Date(task.updatedAt).toLocaleString('pt-BR') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                ))
              )})()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}