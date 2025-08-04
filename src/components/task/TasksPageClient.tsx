'use client';

import React, { useState, useMemo } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { useTasks, useTasksStats, useCompleteTask } from '@/hooks/api/useTasks';
import { useProjects } from '@/hooks/api/useProjects';
import { useModalsStore } from '@/stores/modalsStore';
import { Button } from '@/components/ui/button';
import { NewTaskModal } from '@/components/shared/NewTaskModal';
import Link from 'next/link';

type FilterType = 'all' | 'today' | 'week' | 'completed' | 'pending';
type SortType = 'date' | 'energy' | 'project' | 'status';
type ViewMode = 'today' | 'all' | 'completed' | 'pending';

export function TasksPageClient() {
  // Primeiro todos os hooks, sempre na mesma ordem
  const { data: allTasks = [], isLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  const completeTask = useCompleteTask();
  const { setShowNewTaskModal, showNewTaskModal } = useModalsStore();
  
  // Estados sempre na mesma ordem
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Memos calculados sempre na mesma ordem
  const todayTasks = useMemo(() => {
    if (!Array.isArray(allTasks)) return [];
    const today = new Date().toISOString().split('T')[0];
    return allTasks.filter(task => {
      if (!task.dueDate) return task.status === 'pending';
      return task.dueDate === today;
    });
  }, [allTasks]);
  
  const postponedTasks = useMemo(() => {
    return Array.isArray(allTasks) ? allTasks.filter(t => t && t.status === 'postponed') : [];
  }, [allTasks]);

  // Combinar e filtrar tarefas baseado na view atual
  const tasks = useMemo(() => {
    if (!Array.isArray(allTasks)) return [];
    
    switch (currentView) {
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        const todayTasksList = Array.isArray(todayTasks) ? todayTasks : [];
        return [
          ...todayTasksList.filter(t => t && t.status === 'pending'),
          ...postponedTasks
        ];
      case 'all':
        return allTasks;
      case 'completed':
        return allTasks.filter(t => t && t.status === 'completed');
      case 'pending':
        return allTasks.filter(t => t && t.status === 'pending');
      default:
        return allTasks;
    }
  }, [allTasks, todayTasks, postponedTasks, currentView]);

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
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
      return { today: 0, all: 0, completed: 0, pending: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayTasksList = Array.isArray(todayTasks) ? todayTasks : [];

    return {
      today: todayTasksList.filter(t => t && t.status === 'pending').length + postponedTasks.length,
      all: allTasks.length,
      completed: allTasks.filter(t => t && t.status === 'completed').length,
      pending: allTasks.filter(t => t && t.status === 'pending').length
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
      console.error('ID da tarefa é obrigatório');
      return;
    }

    try {
      await completeTask.mutateAsync(taskId);
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
    }
  };

  const views = [
    { id: 'today' as ViewMode, label: 'Hoje', icon: Target, count: calculatedStats.today },
    { id: 'all' as ViewMode, label: 'Todas', icon: Calendar, count: calculatedStats.all },
    { id: 'completed' as ViewMode, label: 'Concluídas', icon: CheckCircle2, count: calculatedStats.completed },
    { id: 'pending' as ViewMode, label: 'Pendentes', icon: Clock, count: calculatedStats.pending },
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
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">📋 Central de Tarefas</h1>
                <p className="text-blue-100 mt-1">Organize e execute suas missões com eficiência</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors border border-white/30 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Tarefa</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{calculatedStats.today}</div>
              <div className="text-sm text-blue-100">Para Hoje</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{calculatedStats.all}</div>
              <div className="text-sm text-blue-100">Total</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{calculatedStats.completed}</div>
              <div className="text-sm text-blue-100">Concluídas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{calculatedStats.pending}</div>
              <div className="text-sm text-blue-100">Pendentes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  currentView === view.id
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{view.label}</span>
                {view.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    currentView === view.id
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {view.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Por Data</option>
              <option value="energy">Por Energia</option>
              <option value="project">Por Projeto</option>
              <option value="status">Por Status</option>
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
                  const isExpanded = expandedTasks.has(task.id);
                  const project = projects.find(p => p.id === task.projectId);

                  return (
                    <motion.div
                      key={task.id}
                      className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:scale-[1.02]"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                            }`}
                          >
                            {task.status === 'completed' && (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/task/${task.id}`}
                              className="group block"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-lg font-semibold transition-colors group-hover:text-blue-600 ${
                                    task.status === 'completed' 
                                      ? 'text-gray-500 line-through' 
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {task.description}
                                  </h3>
                                  
                                  <div className="flex flex-wrap items-center gap-3 mt-3">
                                    {/* Status */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      task.status === 'completed' 
                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                        : task.status === 'in-progress'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}>
                                      {task.status === 'completed' ? '✅ Concluída' : 
                                       task.status === 'in-progress' ? '🔄 Em andamento' : '⏳ Pendente'}
                                    </div>

                                    {/* Energia */}
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                      task.energyPoints === 1 ? 'bg-green-100 text-green-700 border border-green-200' :
                                      task.energyPoints === 3 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                      'bg-purple-100 text-purple-700 border border-purple-200'
                                    }`}>
                                      {getEnergyIcon(task.energyPoints)}
                                      <span>{getEnergyLabel(task.energyPoints)}</span>
                                    </div>

                                    {/* Projeto */}
                                    {project && (
                                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                                        <span className="text-amber-600">📁</span>
                                        <span>{project.name}</span>
                                      </div>
                                    )}

                                    {/* Data */}
                                    {task.dueDate && (
                                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-medium">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Arrow */}
                                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-5 h-5 text-blue-500" />
                                </div>
                              </div>
                            </Link>

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Criada em {new Date(task.createdAt).toLocaleDateString()}</span>
                                {task.comments && task.comments.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      <span>{task.comments.length} comentário{task.comments.length !== 1 ? 's' : ''}</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              <button
                                onClick={() => toggleTaskExpansion(task.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`} />
                              </button>
                            </div>

                            {/* Expanded content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informações</h4>
                                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex justify-between">
                                          <span>Status:</span>
                                          <span className="font-medium">{task.status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Energia:</span>
                                          <span className="font-medium">{getEnergyLabel(task.energyPoints)}</span>
                                        </div>
                                        {task.dueDate && (
                                          <div className="flex justify-between">
                                            <span>Prazo:</span>
                                            <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ações Rápidas</h4>
                                      <div className="flex flex-wrap gap-2">
                                        <Link
                                          href={`/task/${task.id}`}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Ver detalhes
                                        </Link>
                                        {task.status !== 'completed' && (
                                          <button
                                            onClick={() => handleCompleteTask(task.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-medium hover:bg-green-200 transition-colors"
                                          >
                                            <CheckCircle2 className="w-3 h-3" />
                                            Concluir
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
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

      {/* Modal de nova tarefa */}
      {showNewTaskModal && <NewTaskModal />}
    </div>
  );
}