'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText, Plus, ArrowRight, Battery, Brain, Zap, Edit3, Trash2, Save, X, MessageSquare, Paperclip, Link2, AlertTriangle, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasksStore } from '@/stores/tasksStore';
import { useModalsStore } from '@/stores/modalsStore';
import { useDeleteProject, useUpdateProject } from '@/hooks/api/useProjects';
import { useUpdateTask } from '@/hooks/api/useTasks';
import type { Project } from '@/types';
import { scrollToElementWithDelay } from '@/utils/scrollUtils';
import { useStandardAlert } from '@/components/shared/StandardAlert';

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
  const { showAlert, AlertComponent } = useStandardAlert();
  console.log('🧱 ProjectContainer - Backlog:', project.backlog);
  
  const {
    selectedProjectId,
    setSelectedProjectId,
    addTaskToProject,
    editProjectTask,
    deleteProjectTask,
    updateProjectNotes,
    todayTasks,
    postponedTasks,
  } = useTasksStore();
  const { openNewTaskModal } = useModalsStore();
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const updateTaskMutation = useUpdateTask();
  const taskRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<1 | 3 | 5>(3);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sandboxExpanded, setSandboxExpanded] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPendingTasksModal, setShowPendingTasksModal] = useState(false);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);

  const handleTaskExpansion = (taskId: string) => {
    const isExpanding = expandedTask !== taskId;
    setExpandedTask(expandedTask === taskId ? null : taskId);
    
    if (isExpanding) {
      const taskElement = taskRefs.current.get(taskId);
      if (taskElement) {
        scrollToElementWithDelay(taskElement, 350, {
          behavior: 'smooth',
          block: 'center',
          offset: -50
        });
      }
    }
  };

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
    showAlert(
      'Excluir Tijolo',
      'Tem certeza que deseja excluir este tijolo?',
      'danger',
      {
        showCancel: true,
        confirmText: 'Excluir',
        onConfirm: () => {
          deleteProjectTask(project.id, taskId);
        }
      }
    );
  };

  const handleNewBrick = () => {
    openNewTaskModal(true, project.id);
  };

  const handleFinishProject = async () => {
    // Verificar se há tarefas pendentes
    const allTasks = [
      ...(project.backlog || []),
      ...todayTasks.filter(task => task.projectId === project.id),
      ...postponedTasks.filter(task => task.projectId === project.id)
    ];
    
    const pendingTasks = allTasks.filter(task => task.status === 'pending');
    
    if (pendingTasks.length > 0) {
      showAlert(
        'Projeto possui tarefas pendentes',
        `O projeto "${project.name}" possui ${pendingTasks.length} tarefa(s) pendente(s). Complete ou exclua todas as tarefas antes de finalizar o projeto.`,
        'warning',
        {
          showCancel: false,
          confirmText: 'Ok',
          onConfirm: () => {}
        }
      );
      return;
    }

    showAlert(
      'Finalizar Projeto',
      'Tem certeza que deseja finalizar este projeto?',
      'warning',
      {
        showCancel: true,
        confirmText: 'Finalizar',
        onConfirm: async () => {
          try {
            // Registrar timestamp para detectar conquistas de projeto
            if (typeof window !== 'undefined') {
              localStorage.setItem('project-completion-timestamp', Date.now().toString());
              localStorage.setItem('last-completed-project-id', project.id);
              localStorage.setItem('project-completion-triggered', 'true');
            }

            await updateProjectMutation.mutateAsync({
              projectId: project.id,
              updates: { status: 'completed' }
            });
            showAlert('Sucesso', 'Projeto finalizado com sucesso!', 'success');
          } catch (error: any) {
            console.error('Erro ao finalizar projeto:', error);
            if (error?.response?.data?.error === 'Projeto contém tarefas pendentes') {
              showAlert('Erro', error.response.data.message, 'error');
            } else {
              const errorMessage = error?.response?.data?.error || error?.message || 'Erro desconhecido';
              showAlert('Erro', `Erro ao finalizar projeto: ${errorMessage}`, 'error');
            }
          }
        }
      }
    );
  };

  const handleDeleteProject = async () => {
    // Verificar se há tarefas pendentes
    const allTasks = [
      ...(project.backlog || []),
      ...todayTasks.filter(task => task.projectId === project.id),
      ...postponedTasks.filter(task => task.projectId === project.id)
    ];
    
    const pendingTasks = allTasks.filter(task => task.status === 'pending');
    
    if (pendingTasks.length > 0) {
      setPendingTasksCount(pendingTasks.length);
      setShowPendingTasksModal(true);
      return;
    }
    
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      setShowDeleteModal(false);
    } catch (error: any) {
      console.error('Erro ao excluir projeto:', error);
      setShowDeleteModal(false);
      
      // Verificar se o erro é sobre tarefas vinculadas
      if (error.response?.status === 400 && error.response?.data?.error?.includes('tarefas')) {
        setPendingTasksCount(1);
        setShowPendingTasksModal(true);
      }
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${
      project.status === 'completed' 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{project.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold theme-text">{project.name}</h3>
                {project.status === 'completed' && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    ✅ Finalizado
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm">
                {project.deadline && (
                  <p className="theme-text-muted">
                    📅 Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <p className="theme-text-muted">
                  🧱 {(() => {
                    const allTasks = [
                      ...(project.backlog || []),
                      ...todayTasks.filter(task => task.projectId === project.id),
                      ...postponedTasks.filter(task => task.projectId === project.id)
                    ];
                    return allTasks.length;
                  })()} tijolos
                </p>
                {(project.backlog?.filter(t => t.status === 'completed').length || 0) > 0 && (
                  <p className="text-green-600">
                    ✅ {project.backlog?.filter(t => t.status === 'completed').length || 0} concluídos
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {project.status !== 'completed' && (
              <Button
                onClick={handleNewBrick}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Novo Tijolo</span>
              </Button>
            )}
            {project.status !== 'completed' && (
              <Button
                onClick={handleFinishProject}
                disabled={updateProjectMutation.isPending}
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              >
                {updateProjectMutation.isPending ? 'Finalizando...' : 'Finalizar'}
              </Button>
            )}
            <Button
              onClick={handleDeleteProject}
              disabled={deleteProjectMutation.isPending}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {deleteProjectMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
            <Button
              onClick={() => setSelectedProjectId(isExpanded ? null : project.id)}
              variant="ghost"
              size="icon"
              className="border bg-background border-transparent w-9 h-9 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isExpanded ? "Recolher tijolos" : "Expandir tijolos"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
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
                        ...(project.backlog || []),
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
                        ...(project.backlog || []),
                        ...todayTasks.filter(task => task.projectId === project.id),
                        ...postponedTasks.filter(task => task.projectId === project.id)
                      ];
                      return allTasks.filter(t => t.status === 'pending').length;
                    })()} pendentes
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {(() => {
                      const allTasks = [
                        ...(project.backlog || []),
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
              <Button
                onClick={() => setSandboxExpanded(!sandboxExpanded)}
                variant="ghost"
                className="w-full flex items-center justify-between text-sm font-medium text-amber-800 mb-2 hover:text-amber-900 transition-colors p-0 h-auto"
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Caixa de Areia do Projeto
                </div>
                <motion.div animate={{ rotate: sandboxExpanded ? 180 : 0 }}>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.div>
              </Button>
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
                      <Button
                        onClick={handleAddTask}
                        disabled={!newTaskDescription.trim()}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Salvar</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de Tijolos em formato de lista */}
            <div className="space-y-2">
              {(() => {
                const allTasks = [
                  ...(project.backlog || []),
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
                  ref={(el) => {
                    if (el) {
                      taskRefs.current.set(task.id, el);
                    } else {
                      taskRefs.current.delete(task.id);
                    }
                  }}
                  className={`bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md border border-gray-200 transition-all hover:shadow-lg hover:scale-[1.02] ${
                    task.status === 'completed' 
                      ? 'from-green-50 to-green-100 border-green-200' 
                      : ''
                  }`}
                >
                  <div className="p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between w-full">
                        <div 
                          className="flex-1 cursor-pointer" 
                          onClick={() => window.location.href = `/task/${task.id}`}
                        >
                          <h3 className={`text-lg font-semibold hover:text-blue-600 transition-colors ${
                            task.status === 'completed' 
                              ? 'text-green-800 line-through' 
                              : 'text-gray-900'
                          }`}>
                            {task.description}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            task.energyPoints === 1 ? 'bg-green-100 text-green-700 border border-green-200' :
                            task.energyPoints === 3 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}>
                            {getEnergyIcon(task.energyPoints)}
                            <span>
                              {task.energyPoints === 1 ? 'Baixa' : 
                               task.energyPoints === 3 ? 'Normal' : 'Alta'}
                            </span>
                          </div>
                          
                          {task.deadline ? (
                            (() => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              
                              const dateStr = task.deadline.includes('T') ? task.deadline.split('T')[0] : task.deadline;
                              const [year, month, day] = dateStr.split('-').map(Number);
                              const dueDate = new Date(year, month - 1, day);
                              
                              const isOverdue = dueDate < today;
                              const isDueToday = dueDate.getTime() === today.getTime();
                              
                              const colorClasses = isOverdue || isDueToday
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-green-100 text-green-700 border-green-200';
                              
                              return (
                                <div className={`flex items-center gap-1.5 px-3 py-1 ${colorClasses} border rounded-full text-xs font-medium`}>
                                  <Clock className="w-3 h-3" />
                                  <span>{dueDate.toLocaleDateString('pt-BR')}</span>
                                </div>
                              );
                            })()
                          ) : null}
                          
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await updateTaskMutation.mutateAsync({
                                  taskId: task.id,
                                  updates: {
                                    plannedForToday: true,
                                    status: 'pending'
                                  }
                                });
                                window.location.href = '/bombeiro';
                              } catch (error) {
                                console.error('Erro ao planejar tarefa para hoje:', error);
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            title="Mover para hoje"
                          >
                            Atuar hoje
                          </Button>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(task.id);
                            }}
                            variant="ghost"
                            size="icon"
                            className="border bg-background border-transparent w-9 h-9 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskExpansion(task.id);
                            }}
                            variant="ghost"
                            size="icon"
                            className="border bg-background border-transparent w-9 h-9 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <motion.div animate={{ rotate: expandedTask === task.id ? 180 : 0 }}>
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </Button>
                        </div>
                      </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Comentários */}
                          <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">💬</span>
                              </div>
                              <h4 className="font-semibold text-gray-800">Comentários ({task.comments?.length || 0})</h4>
                            </div>
                            {task.comments?.length ? (
                              <div className="space-y-3 max-h-40 overflow-y-auto">
                                {task.comments.map((comment) => (
                                  <div key={comment.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-semibold text-gray-700">{comment.author.charAt(0).toUpperCase()}</span>
                                      </div>
                                      <span className="font-medium text-sm text-gray-700">{comment.author}</span>
                                      <span className="text-xs text-gray-500 ml-auto">{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-gray-500 text-xl">💬</span>
                                </div>
                                <p className="text-sm text-gray-500">Nenhum comentário ainda</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Histórico */}
                          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">📋</span>
                              </div>
                              <h4 className="font-semibold text-gray-800">Histórico ({task.history?.length || 0})</h4>
                            </div>
                            {task.history?.length ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {task.history.map((entry) => (
                                  <div key={entry.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/50 shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          entry.action === 'created' ? 'bg-green-400' :
                                          entry.action === 'completed' ? 'bg-blue-400' :
                                          entry.action === 'postponed' ? 'bg-yellow-400' :
                                          entry.action === 'edited' ? 'bg-purple-400' : 'bg-gray-400'
                                        }`}></div>
                                        <span className="font-medium text-sm text-gray-900">
                                          {entry.field === 'created' ? 
                                            entry.newValue :
                                            entry.action === 'completed' ?
                                              'Tarefa completada' :
                                            entry.action === 'postponed' ?
                                              'Tarefa adiada' :
                                            entry.field ? 
                                              `${entry.field} alterado` :
                                              (entry.action || 'Alteração')
                                          }
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    {entry.details?.reason && (
                                      <p className="text-xs text-gray-600 ml-4 mt-1">{entry.details.reason}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-slate-500 text-xl">📋</span>
                                </div>
                                <p className="text-sm text-gray-500">Nenhuma edição registrada</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Links Externos */}
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-5 border border-indigo-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">🔗</span>
                              </div>
                              <h4 className="font-semibold text-gray-800">Links Externos ({task.externalLinks?.length || 0})</h4>
                            </div>
                            {task.externalLinks?.length ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {task.externalLinks.map((link, index) => (
                                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-indigo-200/50 shadow-sm hover:shadow-md transition-shadow">
                                    <a 
                                      href={link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm transition-colors"
                                    >
                                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate">{link.length > 40 ? link.substring(0, 40) + '...' : link}</span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-indigo-500 text-xl">🔗</span>
                                </div>
                                <p className="text-sm text-gray-500">Nenhum link cadastrado</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Anexos */}
                          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-5 border border-orange-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">📁</span>
                              </div>
                              <h4 className="font-semibold text-gray-800">Anexos ({task.attachments?.length || 0})</h4>
                            </div>
                            {task.attachments?.length ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {task.attachments.map((attachment) => (
                                  <div key={attachment.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200/50 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                          <span className="text-orange-600 text-xs font-semibold">
                                            {attachment.type && attachment.type.includes('image') ? '🖼️' :
                                             attachment.type && attachment.type.includes('pdf') ? '📄' :
                                             attachment.type && attachment.type.includes('doc') ? '📝' : '📁'}
                                          </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-sm text-gray-700 truncate">{attachment.name}</p>
                                          {attachment.size && (
                                            <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                                          )}
                                        </div>
                                      </div>
                                      <a 
                                        href={attachment.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                                      >
                                        Baixar
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-orange-500 text-xl">📁</span>
                                </div>
                                <p className="text-sm text-gray-500">Nenhum anexo disponível</p>
                              </div>
                            )}
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

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Excluir Projeto</h3>
                  <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Tem certeza que deseja excluir o projeto <strong>"{project.name}"</strong>?
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Todas as informações do projeto serão perdidas permanentemente.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="outline"
                  className="flex-1 text-gray-700 hover:bg-gray-50 border-gray-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDeleteProject}
                  disabled={deleteProjectMutation.isPending}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {deleteProjectMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Tarefas Pendentes */}
      <AnimatePresence>
        {showPendingTasksModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowPendingTasksModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Projeto Possui Tarefas Pendentes</h3>
                  <p className="text-sm text-gray-500">Não é possível excluir</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  O projeto <strong>"{project.name}"</strong> possui <strong>{pendingTasksCount} tarefa(s) pendente(s)</strong>.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Para excluir este projeto:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete todas as tarefas pendentes, ou</li>
                    <li>• Mova as tarefas para outros projetos, ou</li>
                    <li>• Delete as tarefas individualmente</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowPendingTasksModal(false)}
                  variant="outline"
                  className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Entendi</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AlertComponent />
    </div>
  );
}