'use client';

// ============================================================================
// PÁGINA DE HÁBITOS - Gerenciamento completo de hábitos
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react';
import { useHabits, useTodayHabits, useActiveHabits } from '@/hooks/api/useHabits';
import { HabitList } from '@/components/habits/HabitList';
import { HabitStats } from '@/components/habits/HabitStats';
import { NewHabitModal } from '@/components/habits/NewHabitModal';

type ViewMode = 'today' | 'all' | 'stats';

export default function HabitosPage() {
  const { data: allHabits = [], isLoading } = useHabits();
  const todayHabits = useTodayHabits();
  const activeHabits = useActiveHabits();
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando hábitos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-4xl">🎯</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Central de Hábitos</h1>
                <p className="text-green-100 mt-1">Construa uma vida melhor, um dia de cada vez</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowNewHabitModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors border border-white/30 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Hábito</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{completedToday}</div>
              <div className="text-sm text-green-100">Feitos Hoje</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{todayHabits.length}</div>
              <div className="text-sm text-green-100">Para Hoje</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{activeHabits.length}</div>
              <div className="text-sm text-green-100">Ativos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">
                {Math.round((completedToday / Math.max(todayHabits.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-green-100">Taxa Hoje</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  currentView === view.id
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{view.label}</span>
                {view.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    currentView === view.id
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {view.count}
                  </span>
                )}
              </button>
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
        {currentView === 'today' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hábitos de Hoje</h2>
            <HabitList habits={todayHabits} showDate={false} />
          </div>
        )}

        {currentView === 'all' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Todos os Hábitos</h2>
            <HabitList habits={activeHabits} showDate={true} />
          </div>
        )}

        {currentView === 'stats' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas</h2>
            <HabitStats />
          </div>
        )}

      </motion.div>

      {/* Modal */}
      <NewHabitModal 
        isOpen={showNewHabitModal}
        onClose={() => setShowNewHabitModal(false)}
      />
    </div>
  );
}