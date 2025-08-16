'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Calendar, Flame, Target, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCompleteHabit } from '@/hooks/api/useHabits';
import { HabitCompletionAnimation } from './HabitCompletionAnimation';
import { useReminders } from '@/hooks/api/useReminders';
import { useHabitNotifications, useNotification } from '@/hooks/useNotification';
import type { Habit } from '@/types/habit';

interface HabitListProps {
  habits: Habit[];
  showDate?: boolean;
}

export function HabitList({ habits, showDate = false }: HabitListProps) {
  const router = useRouter();
  const completeHabitMutation = useCompleteHabit();
  const { data: allReminders = [] } = useReminders() as { data?: any[] };
  const habitNotifications = useHabitNotifications();
  const { error } = useNotification();
  const [showCompletionAnimation, setCompletionAnimation] = useState(false);
  const [completionAnimationData, setCompletionAnimationData] = useState<{
    habitName: string;
    streak: number;
  } | null>(null);
  
  const today = new Date().toISOString().split('T')[0];

  // Helper para obter lembretes de um hábito
  const getHabitReminders = (habitId: string) => {
    return allReminders.filter(reminder => 
      reminder.entityId === habitId && 
      reminder.entityType === 'habit' && 
      reminder.isActive
    );
  };

  const isCompletedToday = (habit: Habit) => {
    return habit.completions.some(c => c.date === today);
  };

  const getTodayCompletionCount = (habit: Habit) => {
    const todayCompletions = habit.completions.filter(c => c.date === today);
    return todayCompletions.reduce((sum, c) => sum + c.count, 0);
  };

  const handleComplete = async (habit: Habit) => {
    try {
      if (!isCompletedToday(habit)) {
        await completeHabitMutation.mutateAsync({
          habitId: habit.id,
          date: today,
          notes: `Completado em ${new Date().toLocaleString('pt-BR')}`
        });
        
        // Mostrar notificação de celebração
        habitNotifications.habitCompleted(habit.name, habit.streak + 1);
        
        // Trigger completion animation
        setCompletionAnimationData({
          habitName: habit.name,
          streak: habit.streak + 1
        });
        setCompletionAnimation(true);
      }
    } catch (err) {
      error('Erro ao completar hábito', {
        description: err instanceof Error ? err.message : 'Tente novamente',
        context: 'habit_crud'
      });
    }
  };

  const handleIncrement = async (habit: Habit) => {
    try {
      await completeHabitMutation.mutateAsync({
        habitId: habit.id,
        date: today,
        notes: `Incrementado em ${new Date().toLocaleString('pt-BR')}`
      });
      
      // Check if target is reached and trigger animation
      const currentCount = getTodayCompletionCount(habit);
      if (currentCount + 1 >= (habit.targetCount || 1)) {
        // Mostrar notificação de celebração
        habitNotifications.habitCompleted(habit.name, habit.streak + 1);
        
        setCompletionAnimationData({
          habitName: habit.name,
          streak: habit.streak + 1
        });
        setCompletionAnimation(true);
      }
    } catch (err) {
      error('Erro ao incrementar hábito', {
        description: err instanceof Error ? err.message : 'Tente novamente',
        context: 'habit_crud'
      });
    }
  };

  const handleDecrement = (habit: Habit) => {
    // Por enquanto, não implementamos decremento via API
    error('Funcionalidade em desenvolvimento', {
      description: 'O decremento de hábitos ainda não está implementado',
      context: 'habit_crud'
    });
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-700 bg-gradient-to-r from-purple-200 to-purple-300 border-purple-400';
    if (streak >= 14) return 'text-blue-700 bg-gradient-to-r from-blue-200 to-blue-300 border-blue-400';
    if (streak >= 7) return 'text-green-700 bg-gradient-to-r from-green-200 to-green-300 border-green-400';
    if (streak >= 3) return 'text-orange-700 bg-gradient-to-r from-orange-200 to-orange-300 border-orange-400';
    return 'text-gray-700 bg-gradient-to-r from-gray-200 to-gray-300 border-gray-400';
  };

  if (habits.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum hábito encontrado</h3>
        <p className="text-gray-600 mb-6">
          {showDate ? 'Você ainda não criou nenhum hábito.' : 'Não há hábitos programados para hoje.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {habits.map((habit, index) => {
        const completed = isCompletedToday(habit);
        const count = getTodayCompletionCount(habit);
        const hasTarget = habit.targetCount && habit.targetCount > 1;
        
        return (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all ${
              completed ? 'ring-2 ring-green-200 bg-green-50' : 'hover:shadow-md'
            }`}
          >
            {/* Header com ícone, título e ações secundárias */}
            <div className="flex items-center justify-between mb-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer flex-1"
                onClick={() => router.push(`/habit/${habit.id}`)}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: habit.color }}
                >
                  {habit.icon}
                </div>
                <h3 className={`font-bold text-lg ${completed ? 'text-green-800' : 'text-gray-900'}`}>
                  {habit.name}
                </h3>
              </div>

            </div>

            {/* Estatísticas Mobile-First */}
            <div className="space-y-4">
              {/* Cards de estatísticas empilhados em mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <div className="font-bold text-xl sm:text-2xl text-blue-600">{habit.streak}</div>
                  <div className="text-blue-500 text-xs sm:text-sm font-medium">Sequência</div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                  <div className="font-bold text-xl sm:text-2xl text-green-600">{habit.bestStreak || 0}</div>
                  <div className="text-green-500 text-xs sm:text-sm font-medium">Recorde</div>
                </div>
                
                {/* Lembretes */}
                {(() => {
                  const habitReminders = getHabitReminders(habit.id);
                  return habitReminders.length > 0 ? (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Bell className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-xl sm:text-2xl text-purple-600">{habitReminders.length}</span>
                      </div>
                      <div className="text-purple-500 text-xs sm:text-sm font-medium">
                        {habitReminders.length === 1 ? 'Lembrete' : 'Lembretes'}
                      </div>
                    </div>
                  ) : null;
                })()
                }
              </div>

              {/* Ação principal - Mobile Touch Optimized */}
              {hasTarget && (
                <div className="flex items-center justify-center space-x-4 bg-gray-50 rounded-2xl p-4">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDecrement(habit);
                    }}
                    disabled={count === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-200"
                  >
                    <Minus className="w-5 h-5 sm:w-4 sm:h-4 text-gray-600" />
                  </motion.button>
                  
                  <div className="bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-200">
                    <div className="text-2xl sm:text-xl font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500 text-center">de {habit.targetCount}</div>
                  </div>
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIncrement(habit);
                    }}
                    disabled={count >= (habit.targetCount || 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={count === habit.targetCount ? {
                      backgroundColor: ['#dcfce7', '#bbf7d0', '#dcfce7'],
                      transition: { duration: 1, repeat: Infinity }
                    } : {}}
                    className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg"
                  >
                    <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      
      {/* Animação de conclusão */}
      <HabitCompletionAnimation
        show={showCompletionAnimation}
        habitName={completionAnimationData?.habitName || ''}
        streak={completionAnimationData?.streak || 0}
        onComplete={() => setCompletionAnimation(false)}
      />
    </div>
  );
}