'use client';

// ============================================================================
// CLIENTE DA PÁGINA BOMBEIRO - VERSÃO REDESENHADA COM MELHORES PRÁTICAS DE UX/UI
// ============================================================================
// Implementa:
// - Hierarquia visual clara com sistema de grid 8px
// - Paleta de cores acessível seguindo WCAG
// - Layout responsivo e mobile-first
// - Redução de carga cognitiva
// - Tipografia otimizada e consistente
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
      {/* Container Principal com Grid System */}
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Header Mobile-First Otimizado */}
          <header className="mb-8 lg:mb-12">
            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                  Modo Bombeiro
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
                  Foque na execução. Gerencie sua energia. Conquiste seus objetivos.
                </p>
              </div>
              
              {/* Actions no Header - Mobile First */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={() => setShowCaptureModal(true)} 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-none min-h-[44px]"
                >
                  <span className="mr-2 text-lg sm:text-xl">+</span>
                  Nova Tarefa
                </Button>
                <Button 
                  onClick={() => router.push('/planejamento')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 text-gray-700 font-semibold px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-none min-h-[44px]"
                >
                  📋 Planejamento
                </Button>
              </div>
            </div>
          </header>

          {/* Contador de Medalhas com Design Melhorado */}
          <section className="mb-8">
            <WeeklyMedalsCounter />
          </section>

          {/* Grid Principal - Mobile-First Layout */}
          <div className="space-y-6 lg:space-y-8">
            {/* Em mobile: stack vertical. Em desktop: mantém o grid complexo quando necessário */}
            <div className="lg:grid lg:grid-cols-1 xl:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
              
              {/* Coluna Principal - Tarefas e Hábitos */}
              <div className="xl:col-span-2 space-y-6 lg:space-y-8">

              {/* Seção de Hábitos Mobile-First */}
              {todayHabits.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Hábitos Diários</h2>
                      <p className="text-sm sm:text-base text-gray-600">Construa sua rotina ideal</p>
                    </div>
                    <div className="bg-blue-50 px-3 sm:px-4 py-2 rounded-xl border border-blue-200 self-start sm:self-auto">
                      <span className="text-blue-700 font-semibold text-xs sm:text-sm">
                        {completedHabits.length}/{todayHabits.length} concluídos
                      </span>
                    </div>
                  </div>
                  
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
                          className={`p-4 sm:p-5 rounded-lg transition-all cursor-pointer hover:shadow-md relative overflow-hidden min-w-0 ${
                            isCelebrating 
                              ? 'bg-gradient-to-r from-green-200 to-emerald-200 border-2 border-green-400 animate-pulse shadow-lg' 
                              : isCompleted 
                                ? 'bg-green-100 border border-green-300' 
                                : 'bg-white border border-teal-200 hover:border-teal-300'
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
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                              <div 
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                style={{ backgroundColor: habit.color }}
                              >
                                {habit.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-sm sm:text-base truncate ${
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
                                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                                  <div className={`text-orange-500 text-2xl sm:text-3xl animate-pulse ${habit.streak >= 7 ? 'animate-bounce' : ''}`}>
                                    🔥
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-orange-600 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg border border-orange-700">
                                      <span className="text-[10px] sm:text-[12px] font-black text-white leading-none">
                                        {habit.streak}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              {/* Botão de Lembrete - Mobile Friendly */}
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReminderModalHabit(habit.id);
                                }}
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-transparent hover:border-purple-200 flex-shrink-0"
                                title="Configurar lembretes"
                              >
                                <Bell className="w-4 h-4" />
                              </Button>

                              {/* Botão de Conclusão - Mobile Friendly */}
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
                              className={`w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all transform flex-shrink-0 ${
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
                  
                  
                  <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <span className="text-lg">💡</span>
                      <span className="font-medium text-sm sm:text-base text-center">Hábitos não consomem energia do dia</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Estado Vazio - Mobile Friendly */}
              {pendingTasks.length === 0 && missedTasks.length === 0 && todayHabits.length === 0 && (
                <section className="text-center py-12 sm:py-20 bg-white rounded-2xl shadow-sm border border-gray-200 mx-auto">
                  <div className="max-w-sm sm:max-w-md mx-auto space-y-4 sm:space-y-6 px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-3xl sm:text-4xl">🎯</span>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Nenhuma Missão Planejada</h2>
                      <p className="text-base sm:text-lg text-gray-600">
                        Que tal planejar o seu dia e definir suas prioridades?
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200">
                      <p className="text-xs sm:text-sm text-blue-700 font-medium">
                        💡 Dica: Comece definindo 2-3 tarefas importantes para focar sua energia hoje
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Seções de Tarefas Mobile-First */}
              <div className="space-y-6 sm:space-y-8">
              {/* Tarefas Não Executadas */}
              {missedTasks.length > 0 && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-red-600 mb-3 px-1">⚠️ Tarefas não executadas</h2>
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

              {/* Tarefas Pendentes (Planejadas para Hoje) */}
              {pendingTasks.length > 0 && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3 px-1">⚡ Tarefas de Hoje</h2>
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
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button 
                        onClick={() => router.push('/planejamento')}
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100 text-sm"
                      >
                        📋 Planejar Amanhã
                      </Button>
                      <Button 
                        onClick={() => setShowCaptureModal(true)}
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100 text-sm"
                      >
                        ➕ Nova Tarefa
                      </Button>
                    </div>
                  </div>
                )}
                </div>
              )}

              </div>
            </div>
            
            {/* Coluna Lateral - Mobile: sempre visible, Desktop: sidebar */}
            <div className="space-y-6 xl:max-w-sm">
              
              {/* Tarefas Completadas Hoje - Mobile Friendly */}
              {completedTasksToday.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-green-50 border-b border-green-200 px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold text-sm">✅</span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-green-800">Concluídas Hoje</h2>
                        <p className="text-xs sm:text-sm text-green-600">{completedTasksToday.length} tarefa{completedTasksToday.length > 1 ? 's' : ''} finalizada{completedTasksToday.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                      {completedTasksToday.map(task => (
                        <TaskItem 
                          key={task.id}
                          task={task} 
                          onComplete={() => {}}
                          onPostpone={() => {}}
                          variant="completed"
                          isCompleting={false}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <span className="text-lg">🎉</span>
                        <span className="font-semibold text-sm sm:text-base text-center">Excelente progresso hoje!</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Sala de Tarefas Adiadas - Mobile Friendly */}
              {postponedTasks.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-bold text-sm">🗓️</span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Tarefas Adiadas</h2>
                        <p className="text-xs sm:text-sm text-gray-600">Reorganize quando possível</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <PostponedTasksRoom />
                  </div>
                </section>
              )}
              
            </div>
          </div>
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
      
      {/* Modal de Lembrete para Hábitos - Mobile Optimized */}
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
