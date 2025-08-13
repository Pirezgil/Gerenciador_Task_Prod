'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks, useUpdateTask, useEnergyBudget, usePostponeTask } from '@/hooks/api/useTasks';
import { useProjects } from '@/hooks/api/useProjects';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PostponeConfirmModal } from '@/components/shared/PostponeConfirmModal';
import { useStandardAlert } from '@/components/shared/StandardAlert';
import { 
  Calendar, 
  Battery, 
  Brain, 
  Zap, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2,
  CheckSquare,
  Clock,
  Target,
  Plus,
  ExternalLink,
  MessageSquare,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

const fieldLabels: { [key: string]: string } = {
  description: 'Descrição',
  energyPoints: 'Energia',
  dueDate: 'Data de Vencimento',
  projectId: 'Projeto',
  status: 'Status',
};

interface TaskWithProject {
  id: string;
  description: string;
  energyPoints: 1 | 3 | 5;
  projectId?: string;
  projectName?: string;
  project?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  deadline?: string;
  source: 'today' | 'project' | 'postponed';
  status: 'pending' | 'completed' | 'postponed';
}

export function PlanejamentoDiariaPage() {
  const router = useRouter();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const updateTaskMutation = useUpdateTask();
  const postponeTaskMutation = usePostponeTask();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [postponeModal, setPostponeModal] = useState<{isOpen: boolean; taskId: string; taskDescription: string; postponementCount: number} | null>(null);
  const { showAlert, AlertComponent } = useStandardAlert();

  // Função de formatação de histórico
  const formatHistoryValue = (field: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return 'vazio';
    if (field === 'dueDate' && typeof value === 'string') {
      if (value.includes('-') && value.length === 10) {
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
      } else if (value.includes('T')) {
        const [year, month, day] = value.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
      }
      return value;
    }
    if (field === 'projectId') return projects.find(p => p.id === value)?.name || 'Nenhum';
    return value.toString();
  };

  const formatHistoryMessage = (entry: any, projects: any[]) => {
    const project = projects.find(p => p.id === entry.details?.projectId);
    const projectName = project?.name || 'Projeto desconhecido';

    switch (entry.action) {
      case 'created':
        return `Tarefa criada`;
      case 'completed':
        return `Tarefa marcada como concluída`;
      case 'reactivated':
        return `Tarefa reativada`;
      case 'postponed':
        return `Tarefa adiada`;
      case 'edited':
        if (entry.details) {
          const changes: string[] = [];
          Object.entries(entry.details).forEach(([field, change]: [string, any]) => {
            if (change && typeof change === 'object' && change.from !== undefined && change.to !== undefined) {
              const fieldLabel = fieldLabels[field] || field;
              const fromValue = formatHistoryValue(field, change.from);
              const toValue = formatHistoryValue(field, change.to);
              changes.push(`${fieldLabel}: ${fromValue} → ${toValue}`);
            }
          });
          return changes.length > 0 ? `Editado: ${changes.join(', ')}` : 'Tarefa editada';
        }
        return 'Tarefa editada';
      default:
        return `Ação: ${entry.action}`;
    }
  };

  // Orçamento de energia do backend
  const { data: energyBudget = { used: 0, remaining: 15, total: 15, completedTasks: 0 } } = useEnergyBudget();

  const { plannedTasks, completedTasks, availableTasks } = useMemo(() => {
    if (tasksLoading || projectsLoading) return { plannedTasks: [], completedTasks: [], availableTasks: [] };
    
    
    
    const planned: TaskWithProject[] = [];
    const available: TaskWithProject[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Separar tarefas planejadas das disponíveis
    allTasks.forEach(task => {
      
      // Verificar se a tarefa foi adiada hoje
      const wasPostponedToday = (task.status === 'postponed' || task.status === 'POSTPONED') && task.postponedAt && 
        new Date(task.postponedAt).toDateString() === new Date().toDateString();
      
      // Incluir tarefas não completadas, mas EXCLUIR tarefas adiadas hoje
      if ((task.status === 'pending' || ((task.status === 'postponed' || task.status === 'POSTPONED') && !wasPostponedToday)) || task.plannedForToday === true) {
        const project = projects.find(p => p.id === task.projectId);
        let source: 'today' | 'project' | 'postponed' = 'project';
        
        // Determinar a origem da tarefa
        if (task.status === 'postponed' || task.status === 'POSTPONED') {
          source = 'postponed';
        } else if (task.dueDate === today || !task.dueDate) {
          source = 'today';
        }

        const taskWithProject: TaskWithProject = {
          id: task.id,
          description: task.description,
          energyPoints: task.energyPoints as 1 | 3 | 5,
          projectId: task.projectId,
          projectName: task.project?.name,
          project: task.project, // Usar diretamente do backend
          deadline: task.dueDate || undefined,
          source,
          status: task.status as 'pending' | 'completed' | 'postponed'
        };

        // Separar entre planejadas e disponíveis
        if (task.plannedForToday === true) {
          // Tarefas completed ficam na seção planejadas mas serão visualmente diferenciadas
          planned.push(taskWithProject);
        } else {
          available.push(taskWithProject);
        }
      }
    });

    // Adicionar tarefas do backlog dos projetos apenas às disponíveis
    projects.forEach(project => {
      if (project.backlog && Array.isArray(project.backlog)) {
        project.backlog.forEach(task => {
          if (task.status === 'pending') {
            // Verificar se a tarefa já não foi adicionada
            const existsInPlanned = planned.find(t => t.id === task.id);
            const existsInAvailable = available.find(t => t.id === task.id);
            if (!existsInPlanned && !existsInAvailable) {
              available.push({
                id: task.id,
                description: task.description,
                energyPoints: task.energyPoints as 1 | 3 | 5,
                projectId: project.id,
                projectName: project.name,
                project: {
                  id: project.id,
                  name: project.name,
                  icon: project.icon || '📁',
                  color: project.color || '#3B82F6'
                },
                deadline: task.dueDate || undefined,
                source: 'project',
                status: 'pending'
              });
            }
          }
        });
      }
    });

    // Ordenar ambas as listas por deadline
    const sortByDeadline = (tasks: TaskWithProject[]) => {
      return tasks.sort((a, b) => {
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        return 0;
      });
    };

    // Separar tarefas planejadas entre pending e completed
    const plannedPending = planned.filter(task => task.status === 'pending' || task.status === 'postponed');
    const plannedCompleted = planned.filter(task => task.status === 'completed');

    return {
      plannedTasks: sortByDeadline(plannedPending), // Apenas pending/postponed para interação
      completedTasks: sortByDeadline(plannedCompleted), // Completed para visualização
      availableTasks: sortByDeadline(available)
    };
  }, [allTasks, projects, tasksLoading, projectsLoading]);


  // Usar dados de energia direto do backend (sem cálculos no frontend)

  const handlePlanTask = async (taskId: string) => {
    const task = availableTasks.find(t => t.id === taskId);
    if (!task) return;

    // Verificar se não excede o orçamento (usando dados do backend)
    const totalEnergy = energyBudget.used + task.energyPoints;
    if (totalEnergy > energyBudget.total) {
      return; // Não permitir se exceder orçamento
    }

    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        updates: {
          plannedForToday: true,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('❌ Erro ao planejar tarefa:', error);
    }
  };

  const removeFromPlanned = async (taskId: string) => {
    const task = plannedTasks.find(t => t.id === taskId);
    if (!task) return;

    // Se a tarefa tem 3 ou mais adiamentos, não pode ser removida - deve ser adiada com justificativa
    if (task.source === 'postponed' || (allTasks.find(t => t.id === taskId)?.postponementCount ?? 0) >= 3) {
      showAlert(
        'Limite Atingido',
        'Esta tarefa atingiu o limite máximo de adiamentos e deve ser realizada hoje.',
        'warning'
      );
      return;
    }

    // Abrir modal de confirmação para adiamento com justificativa
    setPostponeModal({
      isOpen: true,
      taskId: task.id,
      taskDescription: task.description,
      postponementCount: allTasks.find(t => t.id === taskId)?.postponementCount ?? 0
    });
  };

  const handlePostponeConfirm = async (reason: string) => {
    if (!postponeModal) return;

    try {
      await postponeTaskMutation.mutateAsync({
        taskId: postponeModal.taskId,
        reason
      });
      setPostponeModal(null);
    } catch (error: any) {
      console.error('Erro ao adiar tarefa:', error);
      // Mostrar erro específico se atingiu limite
      if (error?.message?.includes('Limite máximo de adiamentos')) {
        showAlert(
          'Limite Atingido',
          'Limite máximo de adiamentos atingido. Esta tarefa deve ser realizada hoje.',
          'warning'
        );
      } else {
        showAlert(
          'Erro',
          'Erro ao adiar tarefa. Tente novamente.',
          'error'
        );
      }
      throw error;
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (expandedTasks.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getEnergyConfig = (energyPoints: number) => {
    if (energyPoints === 1) return {
      icon: <Battery className="w-4 h-4" />,
      label: 'Baixa',
      color: 'bg-yellow-100 text-yellow-800'
    };
    if (energyPoints === 3) return {
      icon: <Brain className="w-4 h-4" />,
      label: 'Normal',
      color: 'bg-blue-100 text-blue-800'
    };
    return {
      icon: <Zap className="w-4 h-4" />,
      label: 'Alta',
      color: 'bg-red-100 text-red-800'
    };
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'today': return 'Hoje';
      case 'project': return 'Projeto';
      case 'postponed': return 'Adiada';
      default: return '';
    }
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };


  // Métricas de energia diretas do backend
  const energyRemaining = energyBudget.remaining;
  const energyPercentage = (energyBudget.used / energyBudget.total) * 100;
  const isOverBudget = energyBudget.used > energyBudget.total;

  // Mostrar loading se ainda carregando
  if (tasksLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Planejamento Diário</h1>
              <p className="text-blue-100 mt-1">Organize suas atividades para o dia</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{plannedTasks.length + completedTasks.length}</div>
              <div className="text-sm text-blue-100">Planejadas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{availableTasks.length}</div>
              <div className="text-sm text-blue-100">Disponíveis</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{energyBudget.used}</div>
              <div className="text-sm text-blue-100">Energia Usada</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{energyBudget.remaining}</div>
              <div className="text-sm text-blue-100">Disponível</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Tarefas Planejadas */}
      {plannedTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ✅ Tarefas Planejadas para Hoje ({plannedTasks.length})
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

            <div className="space-y-3">
              {plannedTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                const energyConfig = getEnergyConfig(task.energyPoints);

                return (
                  <motion.div
                    key={task.id}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md border border-green-200 transition-all hover:shadow-lg hover:scale-[1.02]"
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
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                              {task.description}
                            </h3>
                          </Link>
                        </div>
                        
                        {/* Second Line - Badges and Actions */}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            {/* Energia */}
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                              task.energyPoints === 1 ? 'bg-green-100 text-green-700 border border-green-200' :
                              task.energyPoints === 3 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}>
                              {energyConfig.icon}
                              <span>{energyConfig.label}</span>
                            </div>

                            {/* Data */}
                            {task.deadline && task.deadline !== 'Sem vencimento' && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 border-red-200 border rounded-full text-xs font-medium">
                                <Clock className="w-3 h-3" />
                                <span>{task.deadline.split('T')[0].split('-').reverse().join('/')}</span>
                              </div>
                            )}

                            {/* Projeto badge */}
                            {task.project && (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                <span>{task.project.icon}</span>
                                <span>{task.project.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromPlanned(task.id);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              Remover
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
                                    <h4 className="font-semibold text-gray-800">Comentários ({allTasks.find(t => t.id === task.id)?.comments?.length || 0})</h4>
                                  </div>
                                  {allTasks.find(t => t.id === task.id)?.comments?.length ? (
                                    <div className="space-y-3 max-h-40 overflow-y-auto">
                                      {allTasks.find(t => t.id === task.id)?.comments?.map((comment: any) => (
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
                                    <h4 className="font-semibold text-gray-800">Histórico ({allTasks.find(t => t.id === task.id)?.history?.length || 0})</h4>
                                  </div>
                                  {allTasks.find(t => t.id === task.id)?.history?.length ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {allTasks.find(t => t.id === task.id)?.history?.map((entry: any) => (
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
                                    <h4 className="font-semibold text-gray-800">Links Úteis ({allTasks.find(t => t.id === task.id)?.externalLinks?.length || 0})</h4>
                                  </div>
                                  {allTasks.find(t => t.id === task.id)?.externalLinks?.length ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {allTasks.find(t => t.id === task.id)?.externalLinks?.map((link: string, index: number) => (
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
                                    <h4 className="font-semibold text-gray-800">Anexos ({allTasks.find(t => t.id === task.id)?.attachments?.length || 0})</h4>
                                  </div>
                                  {allTasks.find(t => t.id === task.id)?.attachments?.length ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {allTasks.find(t => t.id === task.id)?.attachments?.map((attachment: any) => (
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
          </div>
        </div>
      )}

      {/* Seção de Tarefas Completadas */}
      {completedTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎉 Tarefas Completadas ({completedTasks.length})
          </h2>
          
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
            <div className="space-y-3">
              {completedTasks.map((task) => {
                const energyConfig = getEnergyConfig(task.energyPoints);

                return (
                  <div
                    key={task.id}
                    className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl shadow-sm border border-green-300 p-3 opacity-75"
                  >
                    <div className="flex items-center justify-between w-full">
                      <Link 
                        href={`/task/${task.id}`}
                        className="flex-1"
                      >
                        <h3 className="text-lg font-semibold text-green-800 hover:text-green-900 transition-colors cursor-pointer line-through">
                          {task.description}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3">
                        {/* Energia */}
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          task.energyPoints === 1 ? 'bg-green-200 text-green-800 border border-green-300' :
                          task.energyPoints === 3 ? 'bg-blue-200 text-blue-800 border border-blue-300' :
                          'bg-purple-200 text-purple-800 border border-purple-300'
                        }`}>
                          {energyConfig.icon}
                          <span>{energyConfig.label}</span>
                        </div>
                        
                        {/* Status completed */}
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-200 text-green-800 border border-green-300 rounded-full text-xs font-medium">
                          <CheckSquare className="w-3 h-3" />
                          <span>Concluída</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Seção de Atividades Disponíveis */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Atividades Disponíveis ({availableTasks.length})
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {availableTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma atividade pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                const energyConfig = getEnergyConfig(task.energyPoints);
                const canPlan = (energyBudget.used + task.energyPoints) <= energyBudget.total;

                return (
                  <motion.div
                    key={task.id}
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
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                              {task.description}
                            </h3>
                          </Link>
                        </div>
                        
                        {/* Second Line - Badges and Actions */}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            {/* Energia */}
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                              task.energyPoints === 1 ? 'bg-green-100 text-green-700 border border-green-200' :
                              task.energyPoints === 3 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}>
                              {energyConfig.icon}
                              <span>{energyConfig.label}</span>
                            </div>

                            {/* Data */}
                            {task.deadline && task.deadline !== 'Sem vencimento' && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 border-red-200 border rounded-full text-xs font-medium">
                                <Clock className="w-3 h-3" />
                                <span>{task.deadline.split('T')[0].split('-').reverse().join('/')}</span>
                              </div>
                            )}

                            {/* Projeto badge */}
                            {task.project && (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                <span>{task.project.icon}</span>
                                <span>{task.project.name}</span>
                              </div>
                            )}
                            {console.log('🔍 DEBUG AVAILABLE task.project:', task.project)}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlanTask(task.id)}
                              disabled={!canPlan}
                              className={`border bg-background h-9 rounded-md border-transparent px-2 ${
                                canPlan 
                                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                                  : 'text-red-600 bg-red-50 border-red-200 cursor-not-allowed'
                              }`}
                            >
                              {canPlan ? 'Atuar Hoje' : 'Energia Insuficiente'}
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
                                    <h4 className="font-semibold text-gray-800">Comentários ({allTasks.find(t => t.id === task.id)?.comments?.length || 0})</h4>
                                  </div>
                                  {allTasks.find(t => t.id === task.id)?.comments?.length ? (
                                    <div className="space-y-3 max-h-40 overflow-y-auto">
                                      {allTasks.find(t => t.id === task.id)?.comments?.map((comment: any) => (
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
                                    <h4 className="font-semibold text-gray-800">Histórico ({allTasks.find(t => t.id === task.id)?.history?.length || 0})</h4>
                                  </div>
                                  {allTasks.find(t => t.id === task.id)?.history?.length ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {allTasks.find(t => t.id === task.id)?.history?.map((entry: any) => (
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
                                    <h4 className="font-semibold text-gray-800">Links Úteis ({allTasks.find(t => t.id === task.id)?.externalLinks?.length || 0})</h4>
                                  </div>
                                  {allTasks.find(t => t.id === task.id)?.externalLinks?.length ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {allTasks.find(t => t.id === task.id)?.externalLinks?.map((link: string, index: number) => (
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
                                    <h4 className="font-semibold text-gray-800">Anexos ({allTasks.find(t => t.id === task.id)?.attachments?.length || 0})</h4>
                                  </div>
                                  {allTasks.find(t => t.id === task.id)?.attachments?.length ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {allTasks.find(t => t.id === task.id)?.attachments?.map((attachment: any) => (
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
      {/* Modal de confirmação de adiamento */}
      {postponeModal && (
        <PostponeConfirmModal
          isOpen={postponeModal.isOpen}
          onClose={() => setPostponeModal(null)}
          onConfirm={handlePostponeConfirm}
          taskDescription={postponeModal.taskDescription}
          currentPostponementCount={postponeModal.postponementCount}
        />
      )}
      <AlertComponent />
    </div>
  );
}