'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTasks, useUpdateTask } from '@/hooks/api/useTasks';
import { useProjects } from '@/hooks/api/useProjects';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Battery, 
  Brain, 
  Zap, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface TaskWithProject {
  id: string;
  description: string;
  energyPoints: 1 | 3 | 5;
  projectId?: string;
  projectName?: string;
  deadline?: string;
  source: 'today' | 'project' | 'postponed';
  status: 'pending' | 'completed' | 'postponed';
}

export function PlanejamentoDiariaPage() {
  const router = useRouter();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const updateTaskMutation = useUpdateTask();
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Orçamento de energia simples (pode ser customizado via hook depois)
  const dailyEnergyBudget = 15;

  const allAvailableTasks = useMemo(() => {
    if (tasksLoading || projectsLoading) return [];
    
    const tasks: TaskWithProject[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Adicionar todas as tarefas pendentes e adiadas
    allTasks.forEach(task => {
      if (task.status === 'pending' || task.status === 'postponed') {
        const project = projects.find(p => p.id === task.projectId);
        let source: 'today' | 'project' | 'postponed' = 'project';
        
        // Determinar a origem da tarefa
        if (task.status === 'postponed') {
          source = 'postponed';
        } else if (task.dueDate === today || !task.dueDate) {
          source = 'today';
        }

        tasks.push({
          id: task.id,
          description: task.description,
          energyPoints: task.energyPoints as 1 | 3 | 5,
          projectId: task.projectId,
          projectName: project?.name,
          deadline: task.dueDate || undefined,
          source,
          status: task.status as 'pending' | 'completed' | 'postponed'
        });
      }
    });

    // Adicionar tarefas do backlog dos projetos (se existir)
    projects.forEach(project => {
      if (project.backlog && Array.isArray(project.backlog)) {
        project.backlog.forEach(task => {
          if (task.status === 'pending') {
            // Verificar se a tarefa já não foi adicionada
            const exists = tasks.find(t => t.id === task.id);
            if (!exists) {
              tasks.push({
                id: task.id,
                description: task.description,
                energyPoints: task.energyPoints as 1 | 3 | 5,
                projectId: project.id,
                projectName: project.name,
                deadline: task.dueDate || undefined,
                source: 'project',
                status: 'pending'
              });
            }
          }
        });
      }
    });

    return tasks.sort((a, b) => {
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      return 0;
    });
  }, [allTasks, projects, tasksLoading, projectsLoading]);

  const selectedEnergy = useMemo(() => {
    return Array.from(selectedTasks).reduce((total, taskId) => {
      const task = allAvailableTasks.find(t => t.id === taskId);
      return total + (task?.energyPoints || 0);
    }, 0);
  }, [selectedTasks, allAvailableTasks]);

  const toggleTaskSelection = (taskId: string) => {
    const task = allAvailableTasks.find(t => t.id === taskId);
    if (!task) return;

    const newSelected = new Set(selectedTasks);
    if (selectedTasks.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      const newEnergy = selectedEnergy + task.energyPoints;
      if (newEnergy <= dailyEnergyBudget) {
        newSelected.add(taskId);
      }
    }
    setSelectedTasks(newSelected);
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

  const handleStartDay = async () => {
    if (selectedTasks.size === 0) return;

    setIsProcessing(true);
    
    try {
      // Marcar todas as tarefas selecionadas como planejadas para hoje
      const updatePromises = Array.from(selectedTasks).map(taskId => {
        return updateTaskMutation.mutateAsync({
          taskId,
          updates: {
            plannedForToday: true,
            status: 'pending' // Garantir que estão pendentes
          }
        });
      });

      await Promise.all(updatePromises);
      
      // Limpar seleções após sucesso
      setSelectedTasks(new Set());
      
      // Navegar para bombeiro
      router.push('/bombeiro');
    } catch (error) {
      console.error('Erro ao configurar tarefas para hoje:', error);
      // Ainda navegar mesmo se houver erro
      router.push('/bombeiro');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calcular métricas de energia
  const energyUsed = selectedEnergy;
  const energyRemaining = dailyEnergyBudget - energyUsed;
  const energyPercentage = (energyUsed / dailyEnergyBudget) * 100;
  const isOverBudget = energyUsed > dailyEnergyBudget;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Planejamento Diário
          </h1>
          <p className="text-gray-600">
            Organize suas atividades para o dia
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Atividades Disponíveis
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {allAvailableTasks.length} atividades pendentes
                </p>
              </div>

              <div className="p-6 space-y-3">
                {allAvailableTasks.map((task) => {
                  const isSelected = selectedTasks.has(task.id);
                  const isExpanded = expandedTasks.has(task.id);
                  const energyConfig = getEnergyConfig(task.energyPoints);
                  const canSelect = !isSelected && (selectedEnergy + task.energyPoints) <= dailyEnergyBudget;

                  return (
                    <motion.div
                      key={task.id}
                      className={`border rounded-lg transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={() => toggleTaskExpansion(task.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>

                          <button
                            onClick={() => handleTaskClick(task.id)}
                            className="flex-1 text-left p-2 rounded-md transition-colors hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {task.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {task.projectName && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                      {task.projectName}
                                    </span>
                                  )}
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                    {getSourceLabel(task.source)}
                                  </span>
                                  {task.deadline && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${energyConfig.color}`}>
                                  <div className="flex items-center gap-1">
                                    {energyConfig.icon}
                                    {task.energyPoints}
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </button>

                          <Button
                            variant={isSelected ? "default" : "ghost"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskSelection(task.id);
                            }}
                            disabled={!canSelect && !isSelected}
                            className={`${
                              isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            } ${(!canSelect && !isSelected) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isSelected ? 'Remover da Lista' : 'Atuar Hoje'}
                          </Button>
                        </div>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pl-8 space-y-2"
                          >
                            <div className="text-sm text-gray-600">
                              <p><strong>Energia:</strong> {energyConfig.label}</p>
                              {task.deadline && (
                                <p><strong>Prazo:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                              )}
                              <p><strong>Origem:</strong> {getSourceLabel(task.source)}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {allAvailableTasks.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma atividade pendente</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Orçamento de Energia
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Planejado:</span>
                  <span className="font-medium">{energyUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Orçamento:</span>
                  <span className="font-medium">{dailyEnergyBudget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Restante:</span>
                  <span className={`font-medium ${energyRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {energyRemaining}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(energyPercentage, 100)}%` }}
                  />
                </div>
                
                {isOverBudget && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Orçamento excedido!
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do Plano
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Atividades:</span>
                  <span className="font-medium">{selectedTasks.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Energia total:</span>
                  <span className="font-medium">{selectedEnergy}</span>
                </div>
              </div>

              {selectedTasks.size > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button 
                    className="w-full"
                    onClick={handleStartDay}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Configurando...
                      </div>
                    ) : (
                      'Iniciar Dia'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}