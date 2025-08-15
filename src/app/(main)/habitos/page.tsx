'use client';

// ============================================================================
// PÁGINA DE HÁBITOS - Gerenciamento completo de hábitos
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, TrendingUp, Calendar, ListTodo } from 'lucide-react';
import { useHabits, useTodayHabits, useActiveHabits } from '@/hooks/api/useHabits';
import { HabitList } from '@/components/habits/HabitList';
import { HabitStats } from '@/components/habits/HabitStats';
import { NewHabitModal } from '@/components/habits/NewHabitModal';
import { AchievementNotificationSystem } from '@/components/rewards/AchievementNotificationSystem';
import { useRecentAchievements } from '@/hooks/api/useAchievements';
import { Button } from '@/components/ui/button';

type ViewMode = 'today' | 'all' | 'stats';

export default function HabitosPage() {
  const { data: allHabits = [], isLoading } = useHabits();
  const todayHabits = useTodayHabits();
  const activeHabits = useActiveHabits();
  const recentAchievements = useRecentAchievements();
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);

  const completedToday = todayHabits.filter(habit => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completions?.some(c => c.date === today);
  }).length;

  const views = [
    { id: 'today' as ViewMode, label: 'Hoje', icon: Target, count: todayHabits.length },
    { id: 'all' as ViewMode, label: 'Todos', icon: Calendar, count: activeHabits.length },
    { id: 'stats' as ViewMode, label: 'Estatísticas', icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Carregando hábitos...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Central de Hábitos</h1>
                <p className="text-gray-600 mt-1">Construa uma vida melhor, um dia de cada vez</p>
              </div>
              
              {/* Métricas Simplificadas */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{completedToday}</div>
                  <div className="text-sm text-gray-500">Feitos Hoje</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{todayHabits.length}</div>
                  <div className="text-sm text-gray-500">Para Hoje</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{activeHabits.length}</div>
                  <div className="text-sm text-gray-500">Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round((completedToday / Math.max(todayHabits.length, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Taxa Hoje</div>
                </div>
              </div>
            </div>
            
            {/* Botão de Ação */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowNewHabitModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Hábito</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Simplificada */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <Button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  variant={currentView === view.id ? "default" : "outline"}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{view.label}</span>
                  {view.count !== undefined && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {view.count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentView === 'today' && `Hábitos de Hoje (${todayHabits.length})`}
              {currentView === 'all' && `Todos os Hábitos (${activeHabits.length})`}
              {currentView === 'stats' && 'Estatísticas'}
            </h2>
          </div>

          {currentView === 'today' && (
            <div className="bg-white rounded-lg border border-gray-200">
              {todayHabits.length === 0 ? (
                <div className="p-12 text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum hábito para hoje</p>
                  <Button 
                    onClick={() => setShowNewHabitModal(true)}
                    variant="outline"
                  >
                    Criar primeiro hábito
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <HabitList habits={todayHabits} showDate={false} />
                </div>
              )}
            </div>
          )}

          {currentView === 'all' && (
            <div className="bg-white rounded-lg border border-gray-200">
              {activeHabits.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum hábito ativo</p>
                  <Button 
                    onClick={() => setShowNewHabitModal(true)}
                    variant="outline"
                  >
                    Criar primeiro hábito
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <HabitList habits={activeHabits} showDate={true} />
                </div>
              )}
            </div>
          )}

          {currentView === 'stats' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <HabitStats />
              </div>
            </div>
          )}
        </motion.div>

        {/* Modal */}
        <NewHabitModal 
          isOpen={showNewHabitModal}
          onClose={() => setShowNewHabitModal(false)}
        />

        {/* Sistema de notificações de conquista */}
        <AchievementNotificationSystem
          achievements={recentAchievements}
          onComplete={(achievement) => {
            console.log('Conquista celebrada:', achievement.type);
          }}
        />
      </div>
    </div>
  );
}