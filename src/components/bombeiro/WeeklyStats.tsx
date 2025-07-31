'use client';

// ============================================================================
// WEEKLY STATS COMPONENT - Estatísticas Semanais
// ============================================================================
// Componente que exibe estatísticas semanais das tarefas
// Corrigido para evitar erros de hidratação

import React, { useState, useEffect, useMemo } from 'react';
import { useTasksStore } from '@/stores/tasksStore';
import { useEnergyBudget } from '@/hooks/useEnergyBudget';

interface WeeklyStatsData {
  tasksCompleted: number;
  energySpent: number;
  averageEnergy: number;
  mostProductiveDay: string;
  completionRate: number;
  totalTasks: number;
}

export default function WeeklyStats() {
  // ✅ Estado de hidratação para evitar erros SSR
  const [isHydrated, setIsHydrated] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData | null>(null);
  
  const { tasks } = useTasksStore();
  const { currentEnergy, maxEnergy } = useEnergyBudget();

  // ✅ Garantir que só renderiza após hidratação
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ✅ Calcular estatísticas apenas no cliente
  const calculatedStats = useMemo(() => {
    if (!isHydrated || !tasks) return null;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filtrar tarefas da última semana
    const weeklyTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt || now);
      return taskDate >= oneWeekAgo && taskDate <= now;
    });
    
    const completedTasks = weeklyTasks.filter(task => task.status === 'completed');
    const totalEnergy = completedTasks.reduce((sum, task) => sum + (task.energyCost || 0), 0);
    
    // Calcular estatísticas por dia
    const dailyStats: Record<string, number> = {};
    completedTasks.forEach(task => {
      const day = new Date(task.completedAt || task.createdAt || now).toLocaleDateString('pt-BR', { weekday: 'long' });
      dailyStats[day] = (dailyStats[day] || 0) + 1;
    });
    
    const mostProductiveDay = Object.keys(dailyStats).reduce((a, b) => 
      dailyStats[a] > dailyStats[b] ? a : b, 'Nenhum'
    );
    
    return {
      tasksCompleted: completedTasks.length,
      energySpent: totalEnergy,
      averageEnergy: completedTasks.length > 0 ? Math.round(totalEnergy / completedTasks.length) : 0,
      mostProductiveDay,
      completionRate: weeklyTasks.length > 0 ? Math.round((completedTasks.length / weeklyTasks.length) * 100) : 0,
      totalTasks: weeklyTasks.length
    };
  }, [tasks, isHydrated]);

  // ✅ Atualizar estado apenas no cliente
  useEffect(() => {
    if (calculatedStats) {
      setWeeklyStats(calculatedStats);
    }
  }, [calculatedStats]);

  // ✅ Loading state durante hidratação
  if (!isHydrated || !weeklyStats) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-on-primary flex items-center">
          📊 Estatísticas da Semana
        </h3>
        <div className="text-sm text-text-primary-muted dark:text-gray-400">
          Últimos 7 dias
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Tarefas Completadas */}
        <div className="text-center p-3 bg-energia-baixa/10 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-energia-baixa dark:text-green-400">
            {weeklyStats.tasksCompleted}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Completadas
          </div>
        </div>

        {/* Energia Gasta */}
        <div className="text-center p-3 bg-energia-normal/10 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-energia-normal dark:text-energia-normal">
            {weeklyStats.energySpent}
          </div>
          <div className="text-sm text-energia-normal dark:text-blue-300">
            Energia Gasta
          </div>
        </div>

        {/* Taxa de Conclusão */}
        <div className="text-center p-3 bg-energia-alta/10 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-energia-alta dark:text-energia-alta">
            {weeklyStats.completionRate}%
          </div>
          <div className="text-sm text-energia-alta dark:text-purple-300">
            Taxa Conclusão
          </div>
        </div>

        {/* Média por Tarefa */}
        <div className="text-center p-3 bg-energia-baixa/10 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-energia-baixa dark:text-orange-400">
            {weeklyStats.averageEnergy}
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            Média/Tarefa
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary-secondary dark:text-gray-400">
            📅 Dia mais produtivo:
          </span>
          <span className="font-medium text-text-primary dark:text-text-primary-on-primary capitalize">
            {weeklyStats.mostProductiveDay}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary-secondary dark:text-gray-400">
            ⚡ Energia atual:
          </span>
          <span className="font-medium text-text-primary dark:text-text-primary-on-primary">
            {currentEnergy}/{maxEnergy}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary-secondary dark:text-gray-400">
            📈 Total de tarefas:
          </span>
          <span className="font-medium text-text-primary dark:text-text-primary-on-primary">
            {weeklyStats.totalTasks}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-text-primary-muted dark:text-gray-400 mb-1">
          <span>Progresso Semanal</span>
          <span>{weeklyStats.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(weeklyStats.completionRate, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Motivational Message */}
      {weeklyStats.tasksCompleted > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg">
          <div className="text-sm text-center text-text-primary-secondary dark:text-gray-300">
            {weeklyStats.tasksCompleted >= 10 ? 
              "🔥 Semana incrível! Você está em chamas!" :
              weeklyStats.tasksCompleted >= 5 ?
              "⭐ Ótimo progresso esta semana!" :
              "💪 Continue firme, você consegue!"
            }
          </div>
        </div>
      )}
    </div>
  );
}

