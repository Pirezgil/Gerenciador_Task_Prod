'use client';

// ============================================================================
// CLIENTE DA PÁGINA BOMBEIRO - VERSÃO COMPLETA E INTEGRADA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { PlusCircle, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Stores e Hooks
import { useTodayTasks, useCompleteTask, usePostponeTask } from '@/hooks/api/useTasks';
import { useTodayHabits, useCompleteHabit } from '@/hooks/api/useHabits';
import { useModalsStore } from '@/stores/modalsStore';
import { useHydration } from '@/hooks/useHydration';
import { useStandardAlert } from '@/components/shared/StandardAlert';
import { useHabitCelebration } from '@/hooks/useHabitCelebration';

// Componentes
import { EnergyMeter } from './EnergyMeter';
import { TaskItem } from './TaskItem';
import { PostponedTasksRoom } from './PostponedTasksRoom';
import { Button } from '@/components/ui/button';

// Modais
import { NewTaskModal } from '@/components/shared/NewTaskModal';
import { LowEnergyModal } from '@/components/protocols/LowEnergyModal';
import { PostponeConfirmModal } from '@/components/shared/PostponeConfirmModal';
import { AchievementCelebration } from './AchievementCelebration';
import { AchievementNotificationSystem } from '@/components/rewards/AchievementNotificationSystem';
import { useRecentAchievements } from '@/hooks/api/useAchievements';
import { WeeklyMedalsCounter } from './DailyMedalsCounter';
import { AllHabitsCompleteCelebration } from '@/components/rewards/AllHabitsCompleteCelebration';
import { useAllHabitsComplete } from '@/hooks/useAllHabitsComplete';
import { CelebrationTester } from '@/components/debug/CelebrationTester';
import ReminderSectionIntegrated from '@/components/reminders/ReminderSectionIntegrated';

export function BombeiroPageClient() {
  const isHydrated = useHydration();
  const router = useRouter();
  const { showAlert, AlertComponent } = useStandardAlert();
  const { celebrate } = useHabitCelebration();

  // Hooks de estado
  const { data: allTasks = [], todayTasks = [], missedTasks = [], completedTasks: completedTasksToday = [], isLoading } = useTodayTasks();
  const completeTaskMutation = useCompleteTask();
  const postponeTaskMutation = usePostponeTask();
  const { setShowCaptureModal, showCaptureModal, showLowEnergyModal } = useModalsStore();
  const todayHabits = useTodayHabits();
  const recentAchievements = useRecentAchievements();
  const completeHabitMutation = useCompleteHabit();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [postponeModal, setPostponeModal] = useState<{isOpen: boolean; taskId: string; taskDescription: string; postponementCount: number} | null>(null);
  const [celebratingHabit, setCelebratingHabit] = useState<string | null>(null);
  const [completionEffect, setCompletionEffect] = useState<{id: string; x: number; y: number} | null>(null);
  const [reminderModalHabit, setReminderModalHabit] = useState<string | null>(null);
  
  // Hook para celebração de todos os hábitos
  const { 
    showCelebration, 
    hideCelebration, 
    checkAllHabitsComplete,
    streakCount 
  } = useAllHabitsComplete();

  // Separar tarefas por status
  const pendingTasks = todayTasks.filter(task => task.status === 'pending');
  const postponedTasks = todayTasks.filter(task => task.status === 'postponed');
  
  // PERFORMANCE: Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 BombeiroPageClient - Filtros:', {
      totalTasks: todayTasks.length,
      pendingTasks: pendingTasks.length,
      postponedTasks: postponedTasks.length
    });
  }
  
  // Verificar quais hábitos foram completados hoje
  const today = new Date().toISOString().split('T')[0];
  const completedHabits = todayHabits.filter(habit => 
    habit.completions.some(c => c.date === today)
  );
  const pendingHabits = todayHabits.filter(habit => 
    !habit.completions.some(c => c.date === today)
  );
  
  // Verificar se todos os hábitos foram completados
  useEffect(() => {
    if (todayHabits.length > 0) {
      checkAllHabitsComplete(todayHabits);
    }
  }, [todayHabits, checkAllHabitsComplete]);

  const handlePostponeClick = (taskId: string) => {
    const task = todayTasks.find(t => t.id === taskId);
    if (!task) return;

    // Verificar limite máximo de adiamentos
    if ((task.postponementCount || 0) >= 3) {
      showAlert(
        'Limite Atingido',
        'Limite máximo de adiamentos atingido. Esta tarefa deve ser realizada hoje.',
        'warning'
      );
      return;
    }

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

  // Renderiza um skeleton ou nada até a hidratação estar completa
  if (!isHydrated || isLoading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <>
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl">
        <div className="space-y-4 sm:space-y-6">
          
          {/* Contador de Medalhas Semanais */}
          <WeeklyMedalsCounter />

          {/* Seção Principal de Tarefas - LAYOUT MOBILE OTIMIZADO */}
          <main className="w-full">
            <div className="flex flex-col gap-4 mb-4">
              {/* Título - Mobile First */}
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary text-center sm:text-left">
                🔥 Missões de Hoje
              </h1>
              
              {/* Botões - Stack Mobile, Row Desktop */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-center lg:justify-end">
                <Button 
                  onClick={() => setShowCaptureModal(true)} 
                  className="w-full sm:flex-1 sm:max-w-[180px] min-h-[48px] sm:min-h-[44px] text-base sm:text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <span className="mr-2 text-lg font-bold">+</span>
                  <span>Adicionar Tarefa</span>
                </Button>
                <Button 
                  onClick={() => router.push('/planejamento')}
                  variant="outline"
                  className="w-full sm:flex-1 sm:max-w-[160px] min-h-[48px] sm:min-h-[44px] text-base sm:text-sm font-medium border-2 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <span className="mr-2">📋</span>
                  <span>Planejamento</span>
                </Button>
              </div>
            </div>

            {/* Hábitos do Dia - LAYOUT MOBILE SUPER OTIMIZADO */}
            {todayHabits.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="text-center sm:text-left mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">🎯 Hábitos de Hoje</h2>
                  <p className="text-sm text-gray-600">Construindo sua rotina ideal</p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-2xl p-4 sm:p-4 border-2 border-teal-100 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {todayHabits.map(habit => {
                      const isCompleted = habit.completions.some(c => c.date === today);
                      const count = habit.completions.filter(c => c.date === today).reduce((sum, c) => sum + c.count, 0);
                      
                      // Debug logs
                      console.log(`🔎 Hábito ${habit.name}:`);
                      console.log(`  - Hoje: ${today}`);
                      console.log(`  - Completions:`, habit.completions.map(c => `${c.date} (count: ${c.count})`));
                      console.log(`  - isCompleted: ${isCompleted}`);
                      console.log(`  - count hoje: ${count}`);
                      
                      const isCelebrating = celebratingHabit === habit.id;
                      
                      return (
                        <div
                          key={habit.id}
                          className={`p-4 sm:p-5 rounded-xl transition-all cursor-pointer hover:shadow-lg relative overflow-hidden min-w-0 min-h-[120px] sm:min-h-[100px] ${
                            isCelebrating 
                              ? 'bg-gradient-to-r from-green-200 to-emerald-200 border-2 border-green-400 animate-pulse shadow-xl' 
                              : isCompleted 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-md' 
                                : 'bg-white border-2 border-gray-100 hover:border-teal-300 hover:shadow-xl active:scale-[0.98] shadow-sm'
                          }`}
                          onClick={() => router.push(`/habit/${habit.id}`)}
                        >
                          {/* Efeito de partículas ao completar */}
                          {isCelebrating && (
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                              <div className="absolute top-4 right-3 w-1 h-1 bg-green-400 rounded-full animate-bounce delay-75"></div>
                              <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                              <div className="absolute bottom-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl animate-bounce">
                                ✨
                              </div>
                            </div>
                          )}
                          {/* LAYOUT DUAL: MOBILE 2 LINHAS | DESKTOP ORIGINAL */}
                          
                          {/* MOBILE LAYOUT (< sm) - 2 LINHAS */}
                          <div className="sm:hidden space-y-3">
                            {/* MOBILE LINHA 1: Ícone + Título */}
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0"
                                style={{ backgroundColor: habit.color }}
                              >
                                {habit.icon}
                              </div>
                              <h4 className={`font-semibold text-base leading-tight flex-1 ${
                                isCompleted ? 'text-green-800' : 'text-gray-900'
                              }`}>
                                {habit.name}
                              </h4>
                            </div>

                            {/* MOBILE LINHA 2: 3 Elementos Iguais */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                                {habit.streak > 0 ? (
                                  <div className="w-full h-full bg-orange-100 border-2 border-orange-200 rounded-xl flex items-center justify-center gap-1">
                                    <span className="text-orange-500 text-sm">🔥</span>
                                    <span className="text-[10px] font-bold text-orange-700">{habit.streak}</span>
                                  </div>
                                ) : (
                                  <div className="w-full h-full bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">🔥</span>
                                  </div>
                                )}
                              </div>
                              
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReminderModalHabit(habit.id);
                                }}
                                variant="ghost"
                                size="icon"
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all text-purple-600 hover:text-purple-700 hover:bg-purple-100 border-2 border-transparent hover:border-purple-200 active:scale-95 flex-shrink-0"
                              >
                                <Bell className="w-5 h-5" />
                              </Button>

                              {/* Botão de Conclusão - TAMANHO PADRONIZADO */}
                              <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (isCompleted) {
                                  // TODO: Implementar undo completion
                                  console.log('Undo completion não implementado');
                                } else {
                                  console.log('🎯 Completando hábito:', habit.id, 'data:', today);
                                  
                                  // Capturar posição do botão para animação
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setCompletionEffect({
                                    id: habit.id,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top + rect.height / 2
                                  });
                                  
                                  // Iniciar celebração
                                  setCelebratingHabit(habit.id);
                                  
                                  // Disparar efeitos de dopamina
                                  celebrate();
                                  
                                  completeHabitMutation.mutate({
                                    habitId: habit.id,
                                    date: today
                                  }, {
                                    onSuccess: () => {
                                      console.log('🎯 SUCESSO na completação do hábito!');
                                      console.log('📊 Total de hábitos hoje:', todayHabits.length);
                                      
                                      // Celebração adicional no sucesso
                                      setTimeout(() => {
                                        celebrate();
                                      }, 500);
                                      
                                      // React Query atualizará os dados automaticamente
                                      // O useEffect detectará a mudança e chamará checkAllHabitsComplete
                                      
                                      // Parar celebração após 3 segundos
                                      setTimeout(() => {
                                        setCelebratingHabit(null);
                                        setCompletionEffect(null);
                                      }, 3000);
                                    },
                                    onError: () => {
                                      setCelebratingHabit(null);
                                      setCompletionEffect(null);
                                    }
                                  });
                                }
                              }}
                              variant="ghost"
                              size="icon"
                              className={`w-12 h-12 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all transform flex-shrink-0 border-2 ${
                                celebratingHabit === habit.id ? 'scale-110 celebration-bounce shadow-lg ring-2 ring-green-300' : 'active:scale-95'
                              } ${
                                isCompleted
                                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-md border-green-400'
                                  : 'bg-gray-50 text-gray-500 hover:bg-teal-100 hover:text-teal-600 hover:border-teal-300 border-gray-200'
                              }`}
                            >
                              <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </Button>
                            </div>
                          </div>

                          {/* DESKTOP LAYOUT (≥ sm) - LAYOUT ORIGINAL */}
                          <div className="hidden sm:flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: habit.color }}
                              >
                                {habit.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-sm truncate ${
                                  isCompleted ? 'text-green-800' : 'text-gray-900'
                                }`}>
                                  {habit.name}
                                </h4>
                                {habit.targetCount && (
                                  <p className="text-xs text-gray-500">
                                    {count}/{habit.targetCount}
                                  </p>
                                )}
                              </div>
                              {habit.streak > 0 && (
                                <div className="relative flex items-center justify-center w-8 h-8 ml-4">
                                  <div className={`text-orange-500 text-3xl animate-pulse ${habit.streak >= 7 ? 'animate-bounce' : ''}`}>
                                    🔥
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-orange-600 rounded-full w-4 h-4 flex items-center justify-center shadow-lg border border-orange-700">
                                      <span className="text-[14px] font-black text-white leading-none">
                                        {habit.streak}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReminderModalHabit(habit.id);
                                }}
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-transparent hover:border-purple-200"
                                title="Configurar lembretes"
                              >
                                <Bell className="w-4 h-4" />
                              </Button>

                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (isCompleted) {
                                    console.log('Undo completion não implementado');
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setCompletionEffect({
                                      id: habit.id,
                                      x: rect.left + rect.width / 2,
                                      y: rect.top + rect.height / 2
                                    });
                                    setCelebratingHabit(habit.id);
                                    celebrate();
                                    completeHabitMutation.mutate({
                                      habitId: habit.id,
                                      date: today
                                    }, {
                                      onSuccess: () => {
                                        setTimeout(() => celebrate(), 500);
                                        setTimeout(() => {
                                          setCelebratingHabit(null);
                                          setCompletionEffect(null);
                                        }, 3000);
                                      },
                                      onError: () => {
                                        setCelebratingHabit(null);
                                        setCompletionEffect(null);
                                      }
                                    });
                                  }
                                }}
                                variant="ghost"
                                size="icon"
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all transform ${
                                  celebratingHabit === habit.id ? 'scale-110 celebration-bounce shadow-lg ring-2 ring-green-300' : ''
                                } ${
                                  isCompleted
                                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                                    : 'bg-gray-100 text-gray-400 hover:bg-teal-100 hover:text-teal-600'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Estatísticas - SOMENTE DESKTOP */}
                  <div className="hidden sm:flex mt-3 text-xs text-teal-700 items-center justify-between">
                    <span>💡 Hábitos não consomem energia</span>
                    <span>{completedHabits.length}/{todayHabits.length} concluídos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem para usuários sem missões do dia */}
            {pendingTasks.length === 0 && missedTasks.length === 0 && todayHabits.length === 0 && (
              <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-blue-800 mb-3">Nenhuma Missão Planejada</h2>
                <p className="text-lg text-blue-600 mb-6 max-w-md mx-auto">
                  Que tal planejar o seu dia e definir suas prioridades para ser mais produtivo?
                </p>
                <p className="text-sm text-blue-500 mt-4">
                  💡 Dica: Comece definindo 2-3 tarefas importantes para focar sua energia hoje
                </p>
              </div>
            )}

            {/* Listas de Tarefas do Dia */}
            <div className="space-y-6 lg:space-y-8">
              {/* Tarefas Não Executadas - MOBILE OPTIMIZED */}
              {missedTasks.length > 0 && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-red-600 mb-3 text-center sm:text-left">⚠️ Tarefas não executadas</h2>
                  <div className="space-y-3 sm:space-y-4">
                    {missedTasks.map(task => (
                      <div key={task.id} className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {task.missedDaysCount > 0 && (
                                <span className={`text-xs px-2 py-1 rounded font-medium ${
                                  task.missedDaysCount === 1 ? 'text-orange-700 bg-orange-100' :
                                  task.missedDaysCount <= 3 ? 'text-red-700 bg-red-100' :
                                  'text-red-800 bg-red-200'
                                }`}>
                                  Não executada a {task.missedDaysCount} dia{task.missedDaysCount > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <TaskItem 
                          task={task} 
                          onComplete={(taskId) => {
                            console.log('🎯 CLIQUE NO BOTÃO - Iniciando finalização da tarefa não executada:', taskId);
                            // Marcar momento exato do clique para detectar novas conquistas
                            const clickTimestamp = Date.now();
                            localStorage.setItem('task-completion-timestamp', clickTimestamp.toString());
                            localStorage.setItem('last-completed-task-id', taskId);
                            localStorage.setItem('task-completion-triggered', 'true');
                            
                            completeTaskMutation.mutate(taskId);
                          }}
                          onPostpone={handlePostponeClick}
                          isCompleting={completeTaskMutation.isPending}
                          variant="missed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarefas Pendentes (Planejadas para Hoje) - MOBILE OPTIMIZED */}
              {pendingTasks.length > 0 && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3 text-center sm:text-left">⚡ Tarefas de Hoje</h2>
                  {pendingTasks.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {pendingTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={(taskId) => {
                          console.log('🎯 CLIQUE NO BOTÃO - Iniciando finalização da tarefa:', taskId);
                          // Marcar momento exato do clique para detectar novas conquistas
                          const clickTimestamp = Date.now();
                          localStorage.setItem('task-completion-timestamp', clickTimestamp.toString());
                          localStorage.setItem('last-completed-task-id', taskId);
                          localStorage.setItem('task-completion-triggered', 'true');
                          
                          completeTaskMutation.mutate(taskId);
                        }}
                        onPostpone={handlePostponeClick}
                        isExpanded={expandedTask === task.id}
                        onToggleExpansion={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-3xl sm:text-4xl mb-3">🎉</div>
                    <h3 className="text-base sm:text-lg font-semibold text-green-800">Parabéns! Nenhuma tarefa pendente!</h3>
                    <p className="mt-2 text-sm text-green-600 px-4 mb-4">
                      Você está com o dia organizado. Que tal aproveitar para focar nos seus hábitos ou planejar o amanhã?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-center">
                      <Button 
                        onClick={() => router.push('/planejamento')}
                        variant="outline"
                        className="w-full sm:w-auto min-h-[44px] border-green-300 text-green-700 hover:bg-green-100 text-sm sm:text-xs font-medium"
                      >
                        📋 Planejar Amanhã
                      </Button>
                      <Button 
                        onClick={() => setShowCaptureModal(true)}
                        variant="outline"
                        className="w-full sm:w-auto min-h-[44px] border-green-300 text-green-700 hover:bg-green-100 text-sm sm:text-xs font-medium"
                      >
                        ➕ Nova Tarefa
                      </Button>
                    </div>
                  </div>
                )}
                </div>
              )}

            </div>

            {/* Tarefas Completadas Hoje - MOBILE OPTIMIZED */}
            {completedTasksToday.length > 0 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-green-600 mb-3 mt-6 sm:mt-8 text-center sm:text-left">✅ Concluídas Hoje</h2>
                <div className="space-y-3 sm:space-y-4">
                  {completedTasksToday.map(task => (
                    <TaskItem 
                      key={task.id}
                      task={task} 
                      onComplete={() => {}} // Não precisa de ação, já está concluída
                      onPostpone={() => {}} // Não precisa de ação, já está concluída
                      variant="completed"
                      isCompleting={false}
                    />
                  ))}
                </div>
                {/* Estatísticas de Progresso - MOBILE FRIENDLY */}
                <div className="mt-4 sm:mt-3 p-3 sm:p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-green-700">
                    <span className="font-medium text-center sm:text-left">🎉 Parabéns pelo progresso!</span>
                    <span className="font-semibold bg-green-200 px-3 py-1 rounded-full text-center">
                      {completedTasksToday.length} tarefa(s) concluída(s)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sala de Tarefas Adiadas */}
            {postponedTasks.length > 0 && (
              <div className="mt-12">
                 <PostponedTasksRoom />
              </div>
            )}
          </main>

        </div>
      </div>

      {/* --- Modais Globais --- */}
      {showCaptureModal && <NewTaskModal />}
      {showLowEnergyModal && <LowEnergyModal />}
      {postponeModal && (
        <PostponeConfirmModal
          isOpen={postponeModal.isOpen}
          onClose={() => setPostponeModal(null)}
          onConfirm={handlePostponeConfirm}
          taskDescription={postponeModal.taskDescription}
          currentPostponementCount={postponeModal.postponementCount}
        />
      )}
      <AchievementCelebration />
      
      {/* Sistema de notificações de conquista */}
      <AchievementNotificationSystem
        achievements={recentAchievements}
        onComplete={(achievement) => {
          console.log('Conquista celebrada no Bombeiro:', achievement.type);
        }}
      />
      
      <AlertComponent />
      
      {/* Modal de Lembrete para Hábitos */}
      {reminderModalHabit && (() => {
        const habit = todayHabits.find(h => h.id === reminderModalHabit);
        return habit ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white pr-2">
                  Lembretes - {habit.name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReminderModalHabit(null)}
                  className="text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex-shrink-0"
                >
                  ✕
                </Button>
              </div>
              <ReminderSectionIntegrated
                entity={habit}
                entityType="habit"
              />
            </div>
          </div>
        ) : null;
      })()}
      
      {/* Celebração de todos os hábitos completos */}
      <AllHabitsCompleteCelebration
        isVisible={showCelebration}
        onComplete={hideCelebration}
        streakCount={streakCount}
      />
      
      {/* Efeito de ondas no local do clique */}
      {completionEffect && (
        <div 
          className="fixed pointer-events-none z-50"
          style={{
            left: completionEffect.x - 50,
            top: completionEffect.y - 50,
            width: 100,
            height: 100
          }}
        >
          <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute inset-2 border-2 border-emerald-400 rounded-full animate-ping opacity-50 animation-delay-200"></div>
          <div className="absolute inset-4 border border-teal-400 rounded-full animate-ping opacity-25 animation-delay-400"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
            🎉
          </div>
        </div>
      )}
      
      {/* Testador de celebração (apenas desenvolvimento) */}
      <CelebrationTester />
      
    </>
  );
}
