'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks, useTodayTasks, useUpdateTask, useEnergyBudget, usePostponeTask } from '@/hooks/api/useTasks';
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
  Trash2,
  BarChart3,
  ListTodo,
  AlertTriangle
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
  const { data: todayTasksData = [], todayTasks = [], missedTasks = [], completedTasks: completedTasksToday = [], isLoading: todayTasksLoading } = useTodayTasks();
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
    if (tasksLoading || projectsLoading || todayTasksLoading) return { plannedTasks: [], completedTasks: [], availableTasks: [] };
    
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

        // Separar entre planejadas e disponíveis (tarefas atrasadas agora vêm do hook useTodayTasks)
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
    
    // Filtrar tarefas completadas: apenas as completadas HOJE
    const plannedCompleted = planned.filter(task => {
      if (task.status === 'completed') {
        // Buscar a tarefa completa com completedAt do backend
        const fullTask = allTasks.find(t => t.id === task.id);
        if (fullTask && fullTask.completedAt) {
          const completedDate = new Date(fullTask.completedAt);
          const todayDate = new Date();
          
          // Comparar apenas a data (ignorar horário)
          return completedDate.toDateString() === todayDate.toDateString();
        }
      }
      return false;
    });

    return {
      plannedTasks: sortByDeadline(plannedPending), // Apenas pending/postponed para interação
      completedTasks: sortByDeadline(plannedCompleted), // Completed para visualização
      availableTasks: sortByDeadline(available)
    };
  }, [allTasks, projects, tasksLoading, projectsLoading, todayTasksLoading]);


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

  const removeFromMissed = async (taskId: string) => {
    const task = missedTasks.find(t => t.id === taskId);
    if (!task) return;

    // Verificar limite máximo de adiamentos
    if ((task.postponementCount || 0) >= 3) {
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
      postponementCount: task.postponementCount || 0
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
      icon: <Battery className="w-3 h-3" />,
      label: 'Baixa',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    };
    if (energyPoints === 3) return {
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

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'today': return 'Hoje';
      case 'project': return 'Projeto';
      case 'postponed': return 'Adiada';
      default: return '';
    }
  };

  const getOverdueDays = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  // Métricas de energia diretas do backend
  const energyRemaining = energyBudget.remaining;
  const energyPercentage = (energyBudget.used / energyBudget.total) * 100;
  const isOverBudget = energyBudget.used > energyBudget.total;

  // Mostrar loading se ainda carregando
  if (tasksLoading || projectsLoading || todayTasksLoading) {
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
                <h1 className="text-2xl font-bold text-gray-900">Planejamento Diário</h1>
                <p className="text-gray-600 mt-1">Organize suas atividades para o dia</p>
              </div>
              
              {/* Métricas Simplificadas */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{plannedTasks.length + completedTasks.length}</div>
                  <div className="text-sm text-gray-500">Planejadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{completedTasks.length}</div>
                  <div className="text-sm text-gray-500">Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{energyBudget.remaining}</div>
                  <div className="text-sm text-gray-500">Energia Restante</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seção de Tarefas Planejadas */}
        {plannedTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ListTodo className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tarefas Planejadas ({plannedTasks.length})
              </h2>
            </div>
            
            <div className="space-y-3">
              {plannedTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                const energyConfig = getEnergyConfig(task.energyPoints);

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link 
                            href={`/task/${task.id}`}
                            className="block"
                          >
                            <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {task.description}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center space-x-3 mt-2">
                            {/* Badge de Energia */}
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${energyConfig.color}`}>
                              {energyConfig.icon}
                              <span>{energyConfig.label}</span>
                            </span>

                            {/* Data de Vencimento */}
                            {task.deadline && task.deadline !== 'Sem vencimento' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-red-700 bg-red-50 border border-red-200">
                                <Clock className="w-3 h-3" />
                                <span>{task.deadline.split('T')[0].split('-').reverse().join('/')}</span>
                              </span>
                            )}

                            {/* Projeto */}
                            {task.project && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200">
                                <span>{task.project.icon}</span>
                                <span>{task.project.name}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromPlanned(task.id);
                            }}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          >
                            Remover
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

                      {/* Conteúdo Expandido Completo */}
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
                                  <span>Comentários ({allTasks.find(t => t.id === task.id)?.comments?.length || 0})</span>
                                </h4>
                                {allTasks.find(t => t.id === task.id)?.comments?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allTasks.find(t => t.id === task.id)?.comments?.map((comment: any) => (
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
                                  <span>Histórico ({allTasks.find(t => t.id === task.id)?.history?.length || 0})</span>
                                </h4>
                                {allTasks.find(t => t.id === task.id)?.history?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allTasks.find(t => t.id === task.id)?.history?.map((entry: any) => (
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
                                  <span>Links Úteis ({allTasks.find(t => t.id === task.id)?.externalLinks?.length || 0})</span>
                                </h4>
                                {allTasks.find(t => t.id === task.id)?.externalLinks?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allTasks.find(t => t.id === task.id)?.externalLinks?.map((link: string, index: number) => (
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
                                  <span>Anexos ({allTasks.find(t => t.id === task.id)?.attachments?.length || 0})</span>
                                </h4>
                                {allTasks.find(t => t.id === task.id)?.attachments?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allTasks.find(t => t.id === task.id)?.attachments?.map((attachment: any) => (
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Seção de Tarefas Completadas */}
        {completedTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tarefas Completadas ({completedTasks.length})
              </h2>
            </div>
            
            <div className="space-y-3">
              {completedTasks.map((task) => {
                const energyConfig = getEnergyConfig(task.energyPoints);

                return (
                  <div
                    key={task.id}
                    className="bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link 
                            href={`/task/${task.id}`}
                            className="block"
                          >
                            <h3 className="text-lg font-medium text-green-800 hover:text-green-900 transition-colors line-through">
                              {task.description}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center space-x-3 mt-2">
                            {/* Badge de Energia */}
                            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-green-700 bg-green-100 border border-green-300">
                              {energyConfig.icon}
                              <span>{energyConfig.label}</span>
                            </span>

                            {/* Status */}
                            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-green-700 bg-green-100 border border-green-300">
                              <CheckSquare className="w-3 h-3" />
                              <span>Concluída</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Seção de Tarefas Não Executadas */}
        {missedTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tarefas não executadas ({missedTasks.length})
              </h2>
            </div>
            
            <div className="space-y-3">
              {missedTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                const energyConfig = getEnergyConfig(task.energyPoints);
                const overdueDays = task.deadline ? getOverdueDays(task.deadline) : (task.missedDaysCount || 0);

                return (
                  <div
                    key={task.id}
                    className="bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Badge de Não Execução */}
                          {task.missedDaysCount > 0 && (
                            <div className="mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                task.missedDaysCount === 1 ? 'text-orange-700 bg-orange-100 border border-orange-200' :
                                task.missedDaysCount <= 3 ? 'text-red-700 bg-red-100 border border-red-200' :
                                'text-red-800 bg-red-200 border border-red-300'
                              }`}>
                                Não executada a {task.missedDaysCount} dia{task.missedDaysCount > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}

                          <Link 
                            href={`/task/${task.id}`}
                            className="block"
                          >
                            <h3 className="text-lg font-medium text-red-800 hover:text-red-900 transition-colors">
                              {task.description}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center space-x-3 mt-2">
                            {/* Badge de Energia */}
                            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-red-700 bg-red-100 border border-red-300">
                              {energyConfig.icon}
                              <span>{energyConfig.label}</span>
                            </span>

                            {/* Data de vencimento */}
                            {task.dueDate && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-red-700 bg-red-100 border border-red-300">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')} (há {overdueDays} dia{overdueDays > 1 ? 's' : ''})</span>
                              </span>
                            )}

                            {/* Projeto */}
                            {task.project && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-red-700 bg-red-100 border border-red-300">
                                <span>{task.project.icon}</span>
                                <span>{task.project.name}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromMissed(task.id);
                            }}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          >
                            Remover
                          </Button>
                          
                          <Button
                            onClick={() => toggleTaskExpansion(task.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} />
                          </Button>
                        </div>
                      </div>

                      {/* Conteúdo Expandido Completo para Missed Tasks */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-red-200"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Comentários */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-red-900 flex items-center space-x-2">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Comentários ({task.comments?.length || 0})</span>
                                </h4>
                                {task.comments?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {task.comments.map((comment) => (
                                      <div key={comment.id} className="bg-red-100 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-medium text-sm text-red-900">{comment.author}</span>
                                          <span className="text-xs text-red-600">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-sm text-red-800">{comment.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-red-600">Nenhum comentário</p>
                                )}
                              </div>
                              
                              {/* Histórico */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-red-900 flex items-center space-x-2">
                                  <BarChart3 className="w-4 h-4" />
                                  <span>Histórico ({task.history?.length || 0})</span>
                                </h4>
                                {task.history?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {task.history.map((entry) => (
                                      <div key={entry.id} className="bg-red-100 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium text-sm text-red-900">
                                            {formatHistoryMessage(entry, projects)}
                                          </span>
                                          <span className="text-xs text-red-600">
                                            {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                                          </span>
                                        </div>
                                        {entry.details?.reason && (
                                          <p className="text-xs text-red-700 italic">"{entry.details.reason}"</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-red-600">Nenhuma edição registrada</p>
                                )}
                              </div>
                              
                              {/* Links Externos */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-red-900 flex items-center space-x-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Links Úteis ({task.externalLinks?.length || 0})</span>
                                </h4>
                                {task.externalLinks?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {task.externalLinks.map((link, index) => (
                                      <div key={index} className="bg-red-100 rounded-lg p-3 hover:bg-red-200 transition-colors">
                                        <a 
                                          href={link} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-red-700 hover:text-red-900 text-sm transition-colors"
                                        >
                                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">{link.length > 40 ? link.substring(0, 40) + '...' : link}</span>
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-red-600">Nenhum link cadastrado</p>
                                )}
                              </div>
                              
                              {/* Anexos */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-red-900 flex items-center space-x-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                  </svg>
                                  <span>Anexos ({task.attachments?.length || 0})</span>
                                </h4>
                                {task.attachments?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {task.attachments.map((attachment) => (
                                      <div key={attachment.id} className="bg-red-100 rounded-lg p-3 hover:bg-red-200 transition-colors">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                              <span className="text-red-700 text-xs font-semibold">
                                                {attachment.type.includes('image') ? '🖼️' :
                                                 attachment.type.includes('pdf') ? '📄' :
                                                 attachment.type.includes('doc') ? '📝' : '📁'}
                                              </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="font-medium text-sm text-red-900 truncate">{attachment.name}</p>
                                              <p className="text-xs text-red-600">{(attachment.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                          </div>
                                          <a 
                                            href={attachment.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors flex-shrink-0"
                                          >
                                            Baixar
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-red-600">Nenhum anexo disponível</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Seção de Atividades Disponíveis */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Atividades Disponíveis ({availableTasks.length})
            </h2>
          </div>
          
          {availableTasks.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma atividade pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                const energyConfig = getEnergyConfig(task.energyPoints);
                const canPlan = (energyBudget.used + task.energyPoints) <= energyBudget.total;

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link 
                            href={`/task/${task.id}`}
                            className="block"
                          >
                            <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {task.description}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center space-x-3 mt-2">
                            {/* Badge de Energia */}
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${energyConfig.color}`}>
                              {energyConfig.icon}
                              <span>{energyConfig.label}</span>
                            </span>

                            {/* Data de Vencimento */}
                            {task.deadline && task.deadline !== 'Sem vencimento' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-red-700 bg-red-50 border border-red-200">
                                <Clock className="w-3 h-3" />
                                <span>{task.deadline.split('T')[0].split('-').reverse().join('/')}</span>
                              </span>
                            )}

                            {/* Projeto */}
                            {task.project && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200">
                                <span>{task.project.icon}</span>
                                <span>{task.project.name}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant={canPlan ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePlanTask(task.id)}
                            disabled={!canPlan}
                            className={!canPlan ? 'text-red-600 border-red-200 cursor-not-allowed' : ''}
                          >
                            {canPlan ? 'Atuar Hoje' : 'Energia Insuficiente'}
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

                      {/* Conteúdo Expandido Completo para Available Tasks */}
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
                                  <span>Comentários ({allTasks.find(t => t.id === task.id)?.comments?.length || 0})</span>
                                </h4>
                                {allTasks.find(t => t.id === task.id)?.comments?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allTasks.find(t => t.id === task.id)?.comments?.map((comment: any) => (
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
                                  <span>Histórico ({allTasks.find(t => t.id === task.id)?.history?.length || 0})</span>
                                </h4>
                                {allTasks.find(t => t.id === task.id)?.history?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allTasks.find(t => t.id === task.id)?.history?.map((entry: any) => (
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
                                  <span>Links Úteis ({allTasks.find(t => t.id === task.id)?.externalLinks?.length || 0})</span>
                                </h4>
                                {allTasks.find(t => t.id === task.id)?.externalLinks?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allTasks.find(t => t.id === task.id)?.externalLinks?.map((link: string, index: number) => (
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
                                  <span>Anexos ({allTasks.find(t => t.id === task.id)?.attachments?.length || 0})</span>
                                </h4>
                                {allTasks.find(t => t.id === task.id)?.attachments?.length ? (
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allTasks.find(t => t.id === task.id)?.attachments?.map((attachment: any) => (
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
                  </div>
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