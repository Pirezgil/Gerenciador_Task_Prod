'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  Battery,
  Brain,
  Zap,
  Search,
  Plus,
  Target,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Trash2,
  Flame,
  Bell,
  BarChart3,
  ListTodo
} from 'lucide-react';
import { useTasks, useTasksStats, useCompleteTask, useDeleteTask, useUpdateTask } from '@/hooks/api/useTasks';
import { useProjects } from '@/hooks/api/useProjects';
import { useModalsStore } from '@/stores/modalsStore';
import { Button } from '@/components/ui/button';
import { NewTaskModal } from '@/components/shared/NewTaskModal';
import Link from 'next/link';
import { scrollToElementWithDelay } from '@/utils/scrollUtils';
import { formatHistoryMessage } from '@/utils/historyFormatter';
import { useTaskNotifications, useAsyncNotification, useNotification } from '@/hooks/useNotification';
import { AchievementNotificationSystem } from '@/components/rewards/AchievementNotificationSystem';
import { useRecentAchievements } from '@/hooks/api/useAchievements';
import { useReminders } from '@/hooks/api/useReminders';
import ReminderSectionIntegrated from '@/components/reminders/ReminderSectionIntegrated';

type FilterType = 'all' | 'today' | 'week' | 'completed' | 'pending';
type SortType = 'date' | 'energy' | 'project' | 'status';
type ViewMode = 'today' | 'all' | 'completed' | 'pending' | 'planned_today';

export function TasksPageClient() {
  // Primeiro todos os hooks, sempre na mesma ordem
  const { data: allTasks = [], isLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  const recentAchievements = useRecentAchievements();
  const { data: allReminders = [] } = useReminders();
  
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const { setShowNewTaskModal, showNewTaskModal } = useModalsStore();
  
  // Estados sempre na mesma ordem
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const taskRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [reminderModalTask, setReminderModalTask] = useState<string | null>(null);
  const taskNotifications = useTaskNotifications();
  const { withLoading } = useAsyncNotification();
  const { error, warning } = useNotification();
  
  // Memos calculados sempre na mesma ordem
  const todayTasks = useMemo(() => {
    if (!Array.isArray(allTasks)) return [];
    const today = new Date().toISOString().split('T')[0];
    return allTasks.filter(task => {
      if (!task.dueDate) return task.status?.toLowerCase() === 'pending';
      return task.dueDate === today;
    });
  }, [allTasks]);
  
  const postponedTasks = useMemo(() => {
    return Array.isArray(allTasks) ? allTasks.filter(t => t && t.status?.toLowerCase() === 'postponed') : [];
  }, [allTasks]);

  // Combinar e filtrar tarefas baseado na view atual
  const tasks = useMemo(() => {
    if (!Array.isArray(allTasks)) return [];
    
    switch (currentView) {
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        const todayTasksList = Array.isArray(todayTasks) ? todayTasks : [];
        return [
          ...todayTasksList.filter(t => t && t.status?.toLowerCase() === 'pending'),
          ...postponedTasks
        ];
      case 'all':
        return allTasks.filter(t => t && t.status?.toLowerCase() !== 'completed');
      case 'completed':
        return allTasks.filter(t => t && t.status?.toLowerCase() === 'completed');
      case 'pending':
        return allTasks.filter(t => t && t.status?.toLowerCase() === 'pending');
      case 'planned_today':
        return allTasks.filter(t => t && t.plannedForToday === true);
      default:
        return allTasks;
    }
  }, [allTasks, todayTasks, postponedTasks, currentView]);

  const toggleTaskExpansion = (taskId: string) => {
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

  // Helper para obter lembretes de uma tarefa
  const getTaskReminders = (taskId: string) => {
    return Array.isArray(allReminders) ? allReminders.filter(reminder => 
      reminder.entityId === taskId && 
      reminder.entityType === 'task' && 
      reminder.isActive
    ) : [];
  };

  // Aplicar busca e ordenação nas tarefas
  const filteredAndSortedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    let filtered = [...tasks];

    // Aplicar busca
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(task =>
        task && task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenação
    if (Array.isArray(filtered) && filtered.length > 0) {
      filtered.sort((a, b) => {
        if (!a || !b) return 0;
        
        switch (sortBy) {
          case 'energy':
            return (b.energyPoints || 0) - (a.energyPoints || 0);
          case 'project':
            const projectA = projects.find(p => p.id === a.projectId)?.name || '';
            const projectB = projects.find(p => p.id === b.projectId)?.name || '';
            return projectA.localeCompare(projectB);
          case 'status':
            return (a.status || '').localeCompare(b.status || '');
          default:
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        }
      });
    }

    return filtered;
  }, [tasks, projects, sortBy, searchTerm]);

  // Estatísticas calculadas
  const calculatedStats = useMemo(() => {
    if (!Array.isArray(allTasks)) {
      return { today: 0, all: 0, completed: 0, pending: 0, planned_today: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayTasksList = Array.isArray(todayTasks) ? todayTasks : [];

    return {
      today: todayTasksList.filter(t => t && t.status?.toLowerCase() === 'pending').length + postponedTasks.length,
      all: allTasks.length,
      completed: allTasks.filter(t => t && t.status?.toLowerCase() === 'completed').length,
      pending: allTasks.filter(t => t && t.status?.toLowerCase() === 'pending').length,
      planned_today: allTasks.filter(t => t && t.plannedForToday === true).length
    };
  }, [allTasks, todayTasks, postponedTasks]);

  const getEnergyConfig = (points: number) => {
    if (points === 1) return {
      icon: <Battery className="w-3 h-3" />,
      label: 'Baixa',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    };
    if (points === 3) return {
      icon: <Brain className="w-3 h-3" />,
      label: 'Normal',
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    };
    return {
      icon: <Zap className="w-3 h-3" />,
      label: 'Alta',
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    };
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!taskId) {
      taskNotifications.taskUpdated('Erro: ID da tarefa é obrigatório');
      return;
    }

    try {
      await withLoading(
        () => completeTask.mutateAsync(taskId),
        {
          loading: 'Concluindo tarefa...',
          success: 'Tarefa concluída com sucesso!'
        },
        {
          context: 'task_crud'
        }
      );
    } catch (err) {
      error('Erro ao completar tarefa', {
        description: err instanceof Error ? err.message : 'Tente novamente',
        context: 'task_crud'
      });
    }
  };

  const handleReactivateTask = async (taskId: string) => {
    if (!taskId) {
      error('ID da tarefa é obrigatório');
      return;
    }

    try {
      await withLoading(
        () => updateTask.mutateAsync({ 
          taskId: taskId, 
          updates: { status: 'pending' }
        }),
        {
          loading: 'Reativando tarefa...',
          success: 'Tarefa reativada!'
        },
        {
          context: 'task_crud'
        }
      );
    } catch (err) {
      error('Erro ao reativar tarefa', {
        description: err instanceof Error ? err.message : 'Tente novamente',
        context: 'task_crud'
      });
    }
  };

  const handleDeleteTask = async (taskId: string, taskDescription: string) => {
    // Usar notificação de aviso com ação de confirmação
    warning(`Tem certeza que deseja excluir "${taskDescription}"?`, {
      description: 'Esta ação não pode ser desfeita',
      context: 'task_crud',
      important: true,
      action: {
        label: 'Excluir',
        onClick: async () => {
          try {
            await withLoading(
              () => deleteTask.mutateAsync(taskId),
              {
                loading: 'Excluindo tarefa...',
                success: 'Tarefa excluída com sucesso!'
              },
              {
                context: 'task_crud'
              }
            );
          } catch (err) {
            error('Erro ao excluir tarefa', {
              description: err instanceof Error ? err.message : 'Tente novamente',
              context: 'task_crud'
            });
          }
        }
      }
    });
  };

  const views = [
    { id: 'planned_today' as ViewMode, label: 'Atuar hoje', icon: Flame, count: calculatedStats.planned_today },
    { id: 'today' as ViewMode, label: 'Hoje', icon: Target, count: calculatedStats.today },
    { id: 'pending' as ViewMode, label: 'Pendentes', icon: Clock, count: calculatedStats.pending },
    { id: 'completed' as ViewMode, label: 'Concluídas', icon: CheckCircle2, count: calculatedStats.completed },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simplificado */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Central de Tarefas</h1>
                <p className="text-gray-600 mt-1">Organize e execute suas atividades com eficiência</p>
              </div>
              
              {/* Ações Simplificadas */}
              <div className="flex items-center space-x-4">
                <Link
                  href="/calendar"
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendário</span>
                </Link>
                
                <Button
                  onClick={() => setShowNewTaskModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Tarefa</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Simplificada */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <Button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  variant={currentView === view.id ? "default" : "outline"}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{view.label}</span>
                  {view.count !== undefined && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {view.count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Filtros e busca simplificados */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Por Data</option>
              <option value="energy">Por Energia</option>
              <option value="project">Por Projeto</option>
              <option value="status">Por Status</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {views.find(v => v.id === currentView)?.label} ({filteredAndSortedTasks.length})
            </h2>
          </div>
          
          {/* Lista de tarefas */}
          {filteredAndSortedTasks.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma tarefa encontrada</p>
              <Button 
                onClick={() => setShowNewTaskModal(true)}
                variant="outline"
              >
                Criar primeira tarefa
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedTasks.map((task) => {
                const isExpanded = expandedTask === task.id;
                const project = projects.find(p => p.id === task.projectId);
                const energyConfig = getEnergyConfig(task.energyPoints);

                return (
                  <motion.div
                    key={task.id}
                    ref={(el) => {
                      if (el) {
                        taskRefs.current.set(task.id, el);
                      } else {
                        taskRefs.current.delete(task.id);
                      }
                    }}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link 
                            href={`/task/${task.id}`}
                            className="block"
                          >
                            <h3 className={`text-lg font-medium hover:text-blue-600 transition-colors ${
                              task.status?.toLowerCase() === 'completed' 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-900'
                            }`}>
                              {task.description}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center space-x-3 mt-2">
                            {/* Tipo de Tarefa */}
                            {task.isAppointment && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-pink-700 bg-pink-50 border border-pink-200">
                                <Calendar className="w-3 h-3" />
                                <span>Compromisso</span>
                              </span>
                            )}
                            
                            {task.isRecurring && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200">
                                <Clock className="w-3 h-3" />
                                <span>Recorrente</span>
                              </span>
                            )}
                            
                            {task.type === 'brick' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200">
                                <Target className="w-3 h-3" />
                                <span>Brick</span>
                              </span>
                            )}

                            {/* Energia */}
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${energyConfig.color}`}>
                              {energyConfig.icon}
                              <span>{energyConfig.label}</span>
                            </span>

                            {/* Data */}
                            {task.dueDate && task.dueDate !== 'Sem vencimento' && (
                              (() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                const dateStr = task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate;
                                const [year, month, day] = dateStr.split('-').map(Number);
                                const dueDate = new Date(year, month - 1, day);
                                
                                const isOverdue = dueDate < today;
                                const isDueToday = dueDate.getTime() === today.getTime();
                                
                                const colorClasses = isOverdue || isDueToday
                                  ? 'text-red-700 bg-red-50 border-red-200'
                                  : 'text-green-700 bg-green-50 border-green-200';
                                
                                return (
                                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${colorClasses}`}>
                                    <Clock className="w-3 h-3" />
                                    <span>{dueDate.toLocaleDateString('pt-BR')}</span>
                                  </span>
                                );
                              })()
                            )}

                            {/* Projeto */}
                            {(task.project || project) && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200">
                                <span>{task.project?.icon || '📁'}</span>
                                <span>{task.project?.name || project?.name}</span>
                              </span>
                            )}

                            {/* Lembretes */}
                            {(() => {
                              const taskReminders = getTaskReminders(task.id);
                              return taskReminders.length > 0 ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200">
                                  <Bell className="w-3 h-3" />
                                  <span>{taskReminders.length} lembrete{taskReminders.length !== 1 ? 's' : ''}</span>
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {task.status?.toLowerCase() === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReactivateTask(task.id);
                              }}
                              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              Reativar
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReminderModalTask(task.id);
                            }}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="Configurar lembretes"
                          >
                            <Bell className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id, task.description);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            onClick={() => toggleTaskExpansion(task.id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} />
                          </Button>
                        </div>
                      </div>

                      {/* Conteúdo Expandido Simplificado */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-100"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Comentários */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Comentários ({task.comments?.length || 0})</span>
                                </h4>
                                {task.comments?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {task.comments.map((comment) => (
                                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{comment.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Nenhum comentário</p>
                                )}
                              </div>
                              
                              {/* Histórico */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                                  <BarChart3 className="w-4 h-4" />
                                  <span>Histórico ({task.history?.length || 0})</span>
                                </h4>
                                {task.history?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {task.history.map((entry) => (
                                      <div key={entry.id} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium text-sm text-gray-900">
                                            {formatHistoryMessage(entry, projects)}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                                          </span>
                                        </div>
                                        {entry.details?.reason && (
                                          <p className="text-xs text-gray-600 italic">"{entry.details.reason}"</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Nenhuma edição registrada</p>
                                )}
                              </div>
                              
                              {/* Links Externos */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Links Úteis ({task.externalLinks?.length || 0})</span>
                                </h4>
                                {task.externalLinks?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {task.externalLinks.map((link, index) => (
                                      <div key={index} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                        <a 
                                          href={link} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                                        >
                                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">{link.length > 40 ? link.substring(0, 40) + '...' : link}</span>
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Nenhum link cadastrado</p>
                                )}
                              </div>
                              
                              {/* Anexos */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                  </svg>
                                  <span>Anexos ({task.attachments?.length || 0})</span>
                                </h4>
                                {task.attachments?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {task.attachments.map((attachment) => (
                                      <div key={attachment.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                              <span className="text-blue-600 text-xs font-semibold">
                                                {attachment.type.includes('image') ? '🖼️' :
                                                 attachment.type.includes('pdf') ? '📄' :
                                                 attachment.type.includes('doc') ? '📝' : '📁'}
                                              </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="font-medium text-sm text-gray-900 truncate">{attachment.name}</p>
                                              <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                          </div>
                                          <a 
                                            href={attachment.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors flex-shrink-0"
                                          >
                                            Baixar
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Nenhum anexo disponível</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Modal de Lembrete */}
        {reminderModalTask && (() => {
          const task = filteredAndSortedTasks.find(t => t.id === reminderModalTask);
          return task ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Lembretes - {task.description}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReminderModalTask(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                <ReminderSectionIntegrated
                  entity={task}
                  entityType="task"
                />
              </div>
            </div>
          ) : null;
        })()}

        {/* Modal de nova tarefa */}
        {showNewTaskModal && <NewTaskModal />}
        
        {/* Sistema de notificações de conquista */}
        <AchievementNotificationSystem
          achievements={recentAchievements}
          onComplete={(achievement) => {
            console.log('Conquista celebrada:', achievement.type);
          }}
        />
      </div>
    </div>
  );
}