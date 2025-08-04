'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame, Calendar, Award, BarChart3 } from 'lucide-react';
import { useHabitsStore } from '@/stores/habitsStore';

export function HabitStats() {
  const { habits, getHabitStats } = useHabitsStore();
  
  const activeHabits = habits.filter(h => h.isActive);
  
  // Estatísticas gerais
  const totalHabits = activeHabits.length;
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.completions.length, 0);
  const avgStreak = totalHabits > 0 
    ? Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / totalHabits)
    : 0;
  const bestOverallStreak = Math.max(...habits.map(h => h.bestStreak), 0);

  // Hábito com melhor streak atual
  const habitWithBestStreak = habits.reduce((best, current) => 
    current.streak > (best?.streak || 0) ? current : best, null as any
  );

  // Estatísticas de hoje
  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = habits.filter(habit => 
    habit.completions.some(c => c.date === today)
  ).length;

  const stats = [
    {
      title: 'Hábitos Ativos',
      value: totalHabits,
      icon: Target,
      color: 'blue',
      description: 'Hábitos que você está cultivando'
    },
    {
      title: 'Completados Hoje',
      value: todayCompletions,
      icon: Calendar,
      color: 'green',
      description: 'Hábitos feitos hoje'
    },
    {
      title: 'Total de Completamentos',
      value: totalCompletions,
      icon: BarChart3,
      color: 'purple',
      description: 'Todas as vezes que você completou hábitos'
    },
    {
      title: 'Melhor Sequência',
      value: bestOverallStreak,
      icon: Award,
      color: 'yellow',
      description: 'Sua maior sequência de dias seguidos'
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-8 h-8" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{stat.title}</h3>
              <p className="text-xs opacity-80">{stat.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Destaque do Melhor Hábito */}
      {habitWithBestStreak && habitWithBestStreak.streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">
              {habitWithBestStreak.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="w-6 h-6" />
                <h3 className="text-xl font-bold">Sequência em Chamas!</h3>
              </div>
              <p className="text-lg">
                <strong>{habitWithBestStreak.name}</strong> - {habitWithBestStreak.streak} dias seguidos
              </p>
              <p className="text-orange-100 text-sm mt-1">
                Continue assim! Você está construindo um hábito sólido.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lista Detalhada de Hábitos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Detalhes por Hábito
        </h3>

        {activeHabits.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600">Nenhum hábito ativo para mostrar estatísticas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeHabits.map((habit, index) => {
              const stats = getHabitStats(habit.id);
              
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: habit.color }}
                      >
                        {habit.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{habit.name}</h4>
                        <p className="text-sm text-gray-600">
                          {stats.totalCompletions} completamentos totais
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-lg text-blue-600">{stats.currentStreak}</div>
                        <div className="text-gray-500">Sequência</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">{Math.round(stats.completionRate)}%</div>
                        <div className="text-gray-500">Taxa (30d)</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-purple-600">{stats.weeklyCompletions}</div>
                        <div className="text-gray-500">Esta semana</div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}