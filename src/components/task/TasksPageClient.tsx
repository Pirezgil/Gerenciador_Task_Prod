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
  Bell
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
    return allReminders.filter(reminder => 
      reminder.entityId === taskId && 
      reminder.entityType === 'task' && 
      reminder.isActive
    );
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

  // Remover early return que pode causar Rules of Hooks
  // if (isLoading) return <div className="p-4">Carregando tarefas...</div>;

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

  const getEnergyIcon = (points: number) => {
    switch (points) {
      case 1: return <Battery className="w-4 h-4 text-green-500" />;
      case 3: return <Brain className="w-4 h-4 text-blue-500" />;
      case 5: return <Zap className="w-4 h-4 text-purple-500" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getEnergyLabel = (points: number) => {
    switch (points) {
      case 1: return 'Baixa';
      case 3: return 'Normal';
      case 5: return 'Alta';
      default: return 'Indefinido';
    }
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="p-4 text-center">Carregando tarefas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-4xl">📋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Central de Tarefas</h1>
                <p className="text-blue-100 mt-1">Organize e execute suas missões com eficiência</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Botão Calendário */}
              <Link
                href="/calendar"
                className="flex items-center space-x-3 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-2xl hover:bg-white/25 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Calendário</span>
              </Link>
              
              {/* Botão Nova Tarefa */}
              <Button
                onClick={() => setShowNewTaskModal(true)}
                className="flex items-center space-x-3 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-2xl hover:bg-white/25 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Nova Tarefa</span>
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200/60 backdrop-blur-sm p-6 mb-3 h-20">
        <div className="flex gap-2 justify-between w-full min-w-0 h-full items-center">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <Button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                variant={currentView === view.id ? "default" : "ghost"}
                className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg whitespace-nowrap min-w-0 ${
                  currentView === view.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg border-0'
                    : 'text-gray-700 hover:bg-white/80 hover:shadow-md border border-gray-200/50 bg-white/60 backdrop-blur-sm'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="font-semibold tracking-wide text-2xs truncate">{view.label}</span>
                {view.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-2xs font-bold transition-all ${
                    currentView === view.id
                      ? 'bg-white/20 text-white backdrop-blur-sm'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                  }`}>
                    {view.count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 rounded-3xl shadow-2xl border border-blue-200/30 backdrop-blur-sm p-5 mb-2.5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 transition-all group-focus-within:text-blue-600" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-inner hover:shadow-md"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 text-gray-700 font-medium shadow-inner hover:shadow-md cursor-pointer"
            >
              <option value="date">📅 Por Data</option>
              <option value="energy">⚡ Por Energia</option>
              <option value="project">📁 Por Projeto</option>
              <option value="status">🔄 Por Status</option>
            </select>
          </div>
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
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {views.find(v => v.id === currentView)?.label} ({filteredAndSortedTasks.length})
          </h2>
          
          {/* Lista de tarefas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma tarefa encontrada</p>
                <Button 
                  onClick={() => setShowNewTaskModal(true)}
                  className="mt-4"
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
                      className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md border border-gray-200 transition-all hover:shadow-lg hover:scale-[1.02]"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="p-3">
                        <div className="flex flex-col gap-2">
                          {/* First Line - Task Description */}
                          <div className="flex items-center justify-between w-full">
                            <Link 
                              href={`/task/${task.id}`}
                              className="flex-1"
                            >
                              <h3 className={`text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer ${
                                task.status?.toLowerCase() === 'completed' 
                                  ? 'text-gray-500 line-through' 
                                  : 'text-gray-900'
                              }`}>
                                {task.description}
                              </h3>
                            </Link>
                          </div>
                          
                          {/* Second Line - Badges and Actions */}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              {/* Tipo de Tarefa */}
                              {(() => {
                                if (task.isAppointment) {
                                  return (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 border border-pink-200">
                                      <Calendar className="w-3 h-3" />
                                      <span>Compromisso</span>
                                    </div>
                                  );
                                } else if (task.isRecurring) {
                                  return (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                      <Clock className="w-3 h-3" />
                                      <span>Recorrente</span>
                                    </div>
                                  );
                                } else if (task.type === 'brick') {
                                  return (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                      <Target className="w-3 h-3" />
                                      <span>Brick</span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {/* Energia */}
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                task.energyPoints === 1 ? 'bg-green-100 text-green-700 border border-green-200' :
                                task.energyPoints === 3 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                'bg-purple-100 text-purple-700 border border-purple-200'
                              }`}>
                                {getEnergyIcon(task.energyPoints)}
                                <span>{getEnergyLabel(task.energyPoints)}</span>
                              </div>

                              {/* Data */}
                              {task.dueDate && task.dueDate !== 'Sem vencimento' ? (
                                (() => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  
                                  // Parse da data evitando problemas de timezone
                                  const dateStr = task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate;
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

                              {/* Projeto badge */}
                              {task.project && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                  <span>{task.project.icon}</span>
                                  <span>{task.project.name}</span>
                                </div>
                              )}

                              {/* Projeto */}
                              {project && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                                  <span className="text-amber-600">📁</span>
                                  <span>{project.name}</span>
                                </div>
                              )}

                              {/* Lembretes */}
                              {(() => {
                                const taskReminders = getTaskReminders(task.id);
                                return taskReminders.length > 0 ? (
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                                    <Bell className="w-3 h-3" />
                                    <span>{taskReminders.length} lembrete{taskReminders.length !== 1 ? 's' : ''}</span>
                                  </div>
                                ) : null;
                              })()
                            }
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                              {/* Actions inline */}
                              {task.status?.toLowerCase() === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReactivateTask(task.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                >
                                  Reativar
                                </Button>
                              )}

                              {/* Botão de Lembrete */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReminderModalTask(task.id);
                                }}
                                className="border bg-background border-transparent w-9 h-9 p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Configurar lembretes"
                              >
                                <Bell className="w-4 h-4" />
                              </Button>

                              {/* Botão de exclusão */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id, task.description);
                                }}
                                className="border bg-background border-transparent w-9 h-9 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                onClick={() => toggleTaskExpansion(task.id)}
                                variant="ghost"
                                size="icon"
                                className="border bg-background border-transparent w-9 h-9 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`} />
                              </Button>
                            </div>
                          </div>

                          {/* Expanded content */}
                          <AnimatePresence>
                            {isExpanded && (
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
                                      {task.comments?.length > 0 && console.log('🎯 Comentários encontrados:', task.comments)}
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
                                                  {formatHistoryMessage(entry, projects)}
                                                </span>
                                              </div>
                                              <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleDateString('pt-BR')} {new Date(entry.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            {entry.details?.reason && (
                                              <p className="text-xs text-gray-600 ml-4 mt-1 italic">&quot;{entry.details.reason}&quot;</p>
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
                                      <h4 className="font-semibold text-gray-800">Links Úteis ({task.externalLinks?.length || 0})</h4>
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
                                                    {attachment.type.includes('image') ? '🖼️' :
                                                     attachment.type.includes('pdf') ? '📄' :
                                                     attachment.type.includes('doc') ? '📝' : '📁'}
                                                  </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <p className="font-medium text-sm text-gray-700 truncate">{attachment.name}</p>
                                                  <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
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
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal de Lembrete */}
      {reminderModalTask && (() => {
        const task = filteredAndSortedTasks.find(t => t.id === reminderModalTask);
        return task ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
  );
}