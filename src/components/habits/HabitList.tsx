'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Minus, Calendar, Flame, Target } from 'lucide-react';
import { useHabitsStore } from '@/stores/habitsStore';
import { HabitCompletionAnimation } from './HabitCompletionAnimation';
import type { Habit } from '@/types/habit';

interface HabitListProps {
  habits: Habit[];
  showDate?: boolean;
}

export function HabitList({ habits, showDate = false }: HabitListProps) {
  const { 
    completeHabit, 
    undoHabitCompletion, 
    getHabitCompletionsForDate,
    showCompletionAnimation,
    completionAnimationData,
    setCompletionAnimation
  } = useHabitsStore();
  
  const today = new Date().toISOString().split('T')[0];

  const isCompletedToday = (habit: Habit) => {
    return habit.completions.some(c => c.date === today);
  };

  const getTodayCompletionCount = (habit: Habit) => {
    const todayCompletions = habit.completions.filter(c => c.date === today);
    return todayCompletions.reduce((sum, c) => sum + c.count, 0);
  };

  const handleComplete = (habit: Habit) => {
    if (isCompletedToday(habit)) {
      undoHabitCompletion(habit.id, today);
    } else {
      completeHabit(habit.id, 1);
    }
  };

  const handleIncrement = (habit: Habit) => {
    completeHabit(habit.id, 1);
  };

  const handleDecrement = (habit: Habit) => {
    const count = getTodayCompletionCount(habit);
    if (count > 0) {
      undoHabitCompletion(habit.id, today);
      if (count > 1) {
        completeHabit(habit.id, count - 1);
      }
    }
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
    <div className="space-y-4">
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
            <div className="flex items-center justify-between">
              {/* Habit Info */}
              <div className="flex items-center space-x-4 flex-1">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: habit.color }}
                >
                  {habit.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className={`font-semibold ${completed ? 'text-green-800' : 'text-gray-900'}`}>
                      {habit.name}
                    </h3>
                    
                    {habit.streak > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-2xl text-sm font-bold border-2 ${getStreakColor(habit.streak)} shadow-lg`}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.3, 1]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          <Flame className="w-4 h-4 drop-shadow-sm" />
                        </motion.div>
                        <motion.span
                          key={habit.streak}
                          initial={{ scale: 2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                          className="font-extrabold text-base"
                        >
                          {habit.streak} dias
                        </motion.span>
                      </motion.div>
                    )}
                  </div>
                  
                  {habit.description && (
                    <p className={`text-sm ${completed ? 'text-green-600' : 'text-gray-600'} truncate`}>
                      {habit.description}
                    </p>
                  )}

                  {showDate && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {habit.frequency.type === 'daily' && 'Diário'}
                          {habit.frequency.type === 'weekly' && 'Semanal'}
                          {habit.frequency.type === 'custom' && 'Personalizado'}
                        </span>
                      </div>
                      {habit.targetCount && (
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{habit.targetCount}x por dia</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {hasTarget ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDecrement(habit)}
                      disabled={count === 0}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <div className="w-12 text-center">
                      <div className="text-lg font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-500">/ {habit.targetCount}</div>
                    </div>
                    
                    <motion.button
                      onClick={() => handleIncrement(habit)}
                      disabled={count >= (habit.targetCount || 1)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={count === habit.targetCount ? {
                        backgroundColor: ['#dcfce7', '#bbf7d0', '#dcfce7'],
                        transition: { duration: 1, repeat: Infinity }
                      } : {}}
                      className="w-8 h-8 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 text-green-600" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => handleComplete(habit)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={completed ? { 
                      scale: [1, 1.3, 1.1, 1],
                      backgroundColor: ['#10b981', '#059669', '#34d399', '#10b981'],
                      boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0)', '0 0 0 10px rgba(16, 185, 129, 0.3)', '0 0 0 20px rgba(16, 185, 129, 0)', '0 0 0 0 rgba(16, 185, 129, 0)'],
                      transition: { duration: 1.2, ease: "easeInOut" }
                    } : {}}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      completed
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-xl shadow-green-500/40'
                        : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                    }`}
                  >
                    <motion.div
                      animate={completed ? {
                        rotate: [0, 360, 720],
                        scale: [1, 1.2, 1],
                        transition: { duration: 0.8, delay: 0.1 }
                      } : {}}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  </motion.button>
                )}
              </div>
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