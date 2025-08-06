'use client';

// ============================================================================
// CLIENTE DA PÁGINA BOMBEIRO - VERSÃO COMPLETA E INTEGRADA
// ============================================================================

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Stores e Hooks
import { useTodayTasks, useCompleteTask, usePostponeTask } from '@/hooks/api/useTasks';
import { useTodayHabits, useCompleteHabit } from '@/hooks/api/useHabits';
import { useModalsStore } from '@/stores/modalsStore';
import { useHydration } from '@/hooks/useHydration';
import { useStandardAlert } from '@/components/shared/StandardAlert';

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

export function BombeiroPageClient() {
  const isHydrated = useHydration();
  const router = useRouter();
  const { showAlert, AlertComponent } = useStandardAlert();

  // Hooks de estado
  const { data: todayTasks = [], isLoading } = useTodayTasks();
  const completeTaskMutation = useCompleteTask();
  const postponeTaskMutation = usePostponeTask();
  const { setShowCaptureModal, showCaptureModal, showLowEnergyModal } = useModalsStore();
  const todayHabits = useTodayHabits();
  const completeHabitMutation = useCompleteHabit();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [postponeModal, setPostponeModal] = useState<{isOpen: boolean; taskId: string; taskDescription: string; postponementCount: number} | null>(null);

  const pendingTasks = todayTasks.filter(task => task.status === 'pending');
  const postponedTasks = todayTasks.filter(task => task.status === 'postponed');
  const completedTasks = todayTasks.filter(task => task.status === 'completed');
  
  // Verificar quais hábitos foram completados hoje
  const today = new Date().toISOString().split('T')[0];
  const completedHabits = todayHabits.filter(habit => 
    habit.completions.some(c => c.date === today)
  );
  const pendingHabits = todayHabits.filter(habit => 
    !habit.completions.some(c => c.date === today)
  );

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
      <div className="container mx-auto p-2 sm:p-4 lg:p-6">
        <div className="space-y-6">
          

          {/* Seção Principal de Tarefas */}
          <main className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary ml-16 lg:ml-0">🔥 Missões de Hoje</h1>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={() => setShowCaptureModal(true)} className="flex-1 sm:flex-none">
                  <span className="mr-2 text-lg font-bold">+</span>
                  <span className="sm:inline">Adicionar Tarefa</span>
                </Button>
                <Button 
                  onClick={() => router.push('/planejamento')}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  📋 Planejamento
                </Button>
              </div>
            </div>

            {/* Hábitos do Dia */}
            {todayHabits.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3">🎯 Hábitos de Hoje</h2>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {todayHabits.map(habit => {
                      const isCompleted = habit.completions.some(c => c.date === today);
                      const count = habit.completions.filter(c => c.date === today).reduce((sum, c) => sum + c.count, 0);
                      
                      // Debug logs
                      console.log(`🔎 Hábito ${habit.name}:`);
                      console.log(`  - Hoje: ${today}`);
                      console.log(`  - Completions:`, habit.completions.map(c => `${c.date} (count: ${c.count})`));
                      console.log(`  - isCompleted: ${isCompleted}`);
                      console.log(`  - count hoje: ${count}`);
                      
                      return (
                        <div
                          key={habit.id}
                          className={`p-3 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                            isCompleted 
                              ? 'bg-green-100 border border-green-300' 
                              : 'bg-white border border-teal-200 hover:border-teal-300'
                          }`}
                          onClick={() => router.push(`/habit/${habit.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
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
                                <div className="relative flex items-center justify-center w-16 h-16 ml-2">
                                  <div className={`text-orange-500 text-3xl animate-pulse ${habit.streak >= 7 ? 'animate-bounce' : ''}`}>
                                    🔥
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center mt-1">
                                    <div className="bg-orange-600 rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-orange-700">
                                      <span className="text-[10px] font-black text-white leading-none">
                                        {habit.streak}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (isCompleted) {
                                  // TODO: Implementar undo completion
                                  console.log('Undo completion não implementado');
                                } else {
                                  console.log('🎯 Completando hábito:', habit.id, 'data:', today);
                                  completeHabitMutation.mutate({
                                    habitId: habit.id,
                                    date: today
                                  });
                                }
                              }}
                              variant="ghost"
                              size="icon"
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-gray-100 text-gray-400 hover:bg-teal-100 hover:text-teal-600'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-3 text-xs text-teal-700 flex items-center justify-between">
                    <span>💡 Hábitos não consomem energia</span>
                    <span>{completedHabits.length}/{todayHabits.length} concluídos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Listas de Tarefas do Dia */}
            <div className="space-y-6 lg:space-y-8">
              {/* Tarefas Pendentes */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3">⚡ Tarefas Pendentes</h2>
                {pendingTasks.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {pendingTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={(taskId) => completeTaskMutation.mutate(taskId)}
                        onPostpone={handlePostponeClick}
                        isExpanded={expandedTask === task.id}
                        onToggleExpansion={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-10 bg-surface-secondary rounded-lg border border-border-sentinela border-dashed">
                    <div className="text-3xl sm:text-4xl mb-3">👍</div>
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary">Tudo em ordem!</h3>
                    <p className="mt-1 text-sm text-text-secondary px-4">Nenhuma tarefa pendente por enquanto.</p>
                  </div>
                )}
              </div>

              {/* Tarefas Finalizadas */}
              {completedTasks.length > 0 && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3">Finalizadas</h2>
                  <div className="space-y-3 sm:space-y-4">
                    {completedTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={(taskId) => completeTaskMutation.mutate(taskId)}
                        onPostpone={handlePostponeClick}
                        isExpanded={expandedTask === task.id}
                        onToggleExpansion={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

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
      <AlertComponent />
      
    </>
  );
}
