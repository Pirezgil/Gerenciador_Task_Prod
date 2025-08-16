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
      {/* Header Mobile-First */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 lg:py-8">
            {/* Título e Botão de Ação - Mobile Stack */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Central de Hábitos</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Construa uma vida melhor, um dia de cada vez</p>
              </div>
              
              <Button
                onClick={() => setShowNewHabitModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Hábito</span>
              </Button>
            </div>
            
            {/* Métricas - Ocultas em mobile, visíveis em desktop */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{completedToday}</div>
                <div className="text-sm text-green-600 font-medium">Feitos Hoje</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{todayHabits.length}</div>
                <div className="text-sm text-blue-600 font-medium">Para Hoje</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-700">{activeHabits.length}</div>
                <div className="text-sm text-purple-600 font-medium">Ativos</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-orange-700">
                  {Math.round((completedToday / Math.max(todayHabits.length, 1)) * 100)}%
                </div>
                <div className="text-sm text-orange-600 font-medium">Taxa Hoje</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Mobile-Optimized */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;
              
              // Ocultar "Estatísticas" em mobile
              if (view.id === 'stats') {
                return (
                  <Button
                    key={view.id}
                    onClick={() => setCurrentView(view.id)}
                    variant={isActive ? "default" : "outline"}
                    className={`
                      hidden lg:flex flex-col sm:flex-row items-center justify-center 
                      p-3 sm:p-2 space-y-1 sm:space-y-0 sm:space-x-2 
                      h-auto min-h-[64px] sm:min-h-[40px]
                      ${isActive ? 'bg-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700'}
                    `}
                  >
                    <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                    <div className="flex flex-col sm:flex-row items-center space-y-0 sm:space-x-1">
                      <span className="text-xs sm:text-sm font-medium">{view.label}</span>
                      {view.count !== undefined && (
                        <span 
                          className={`
                            px-1.5 py-0.5 rounded-full text-xs font-bold
                            ${isActive 
                              ? 'bg-blue-500 text-blue-100' 
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}
                        >
                          {view.count}
                        </span>
                      )}
                    </div>
                  </Button>
                );
              }
              
              return (
                <Button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  variant={isActive ? "default" : "outline"}
                  className={`
                    flex flex-col sm:flex-row items-center justify-center 
                    p-3 sm:p-2 space-y-1 sm:space-y-0 sm:space-x-2 
                    h-auto min-h-[64px] sm:min-h-[40px]
                    ${isActive ? 'bg-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700'}
                  `}
                >
                  <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                  <div className="flex flex-col sm:flex-row items-center space-y-0 sm:space-x-1">
                    <span className="text-xs sm:text-sm font-medium">{view.label}</span>
                    {view.count !== undefined && (
                      <span 
                        className={`
                          px-1.5 py-0.5 rounded-full text-xs font-bold
                          ${isActive 
                            ? 'bg-blue-500 text-blue-100' 
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}
                      >
                        {view.count}
                      </span>
                    )}
                  </div>
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