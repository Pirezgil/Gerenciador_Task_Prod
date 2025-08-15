// ============================================================================
// REWARDS PAGE CLIENT - Componente principal da página de recompensas
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Settings, Medal, Plus, Grid3X3, Calendar, ListTodo } from 'lucide-react';
import { useRewardsPageData, useRecentAchievements } from '@/hooks/api/useAchievements';
import { useAchievementStore } from '@/stores/achievementStore';
import { AchievementGrid } from './AchievementGrid';
import { AchievementCalendar } from './AchievementCalendar';
import { MedalCard } from './MedalCard';
import { AdvancedMedalCard } from './medals/AdvancedMedalCard';
import { AchievementNotificationSystem } from './AchievementNotificationSystem';
import { RewardsSettingsPanel } from './RewardsSettingsPanel';
import { HabitStreakCounter } from './HabitStreakCounter';
import { Button } from '@/components/ui/button';
import type { Achievement } from '@/types/achievement';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

type TabType = 'stats' | 'gallery';

interface RecentAchievementsTimelineProps {
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
}

interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TabButtonProps {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (tab: TabType) => void;
  count?: number;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function TabButton({ id, label, icon, isActive, onClick, count }: TabButtonProps) {
  return (
    <Button
      onClick={() => onClick(id)}
      variant={isActive ? "default" : "outline"}
      className="flex items-center space-x-2"
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
          {count}
        </span>
      )}
    </Button>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          🏆
        </motion.div>
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Carregando suas conquistas épicas...</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Oops! Algo deu errado
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {error}
        </p>
        <Button onClick={onRetry}>
          Tentar novamente
        </Button>
      </motion.div>
    </div>
  );
}

function RecentAchievementsTimeline({ achievements, onAchievementClick }: RecentAchievementsTimelineProps) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🌟</div>
        <p className="text-gray-600">
          Complete tarefas para ver suas conquistas recentes aqui!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        ⚡ Conquistas Recentes
      </h3>
      <div className="space-y-3">
        {achievements.slice(0, 8).map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer group hover:border-gray-300 transition-colors"
            onClick={() => onAchievementClick(achievement)}
          >
            <div className="flex items-center gap-4">
              <MedalCard 
                achievement={achievement}
                size="small"
                showAnimation={false}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">
                  {achievement.type === 'task_completion' && `⚡ Faísca ${achievement.subtype}`}
                  {achievement.type === 'project_completion' && '🏗️ Arquiteto de Sonhos'}
                  {achievement.type === 'daily_master' && '👑 Imperador da Jornada'}
                  {achievement.type === 'weekly_legend' && '⏳ Guardião do Tempo'}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(achievement.earnedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  return null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RewardsPageClient() {
  const searchParams = useSearchParams();
  
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [calendarInitialView, setCalendarInitialView] = useState<'day' | 'week' | 'month'>('month');
  
  // Configurar estado inicial baseado nos parâmetros da URL
  useEffect(() => {
    const view = searchParams?.get('view');
    const periodo = searchParams?.get('periodo');
    
    if (view === 'calendario') {
      setViewMode('calendar');
    }
    
    if (periodo === 'semana') {
      setCalendarInitialView('week');
    } else if (periodo === 'dia') {
      setCalendarInitialView('day');
    }
  }, [searchParams]);
  
  const { 
    data: rewardsData, 
    isLoading, 
    error,
    refetch 
  } = useRewardsPageData();
  
  // Sincronizar com o store
  const { setRewardsPageData } = useAchievementStore();
  
  useEffect(() => {
    if (rewardsData) {
      setRewardsPageData(rewardsData);
    }
  }, [rewardsData, setRewardsPageData]);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAchievement(null);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Function to filter achievements based on active filter
  const getFilteredAchievements = (achievements: Achievement[]) => {
    if (activeFilter === 'all') {
      return achievements;
    }
    return achievements.filter(achievement => achievement.type === activeFilter);
  };

  // Estados de loading e erro
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error?.message || 'Erro ao carregar dados das conquistas'} 
        onRetry={() => refetch()} 
      />
    );
  }

  // Função para renderizar conteúdo das tabs
  const renderTabContent = (data: any) => {
    switch (activeTab) {
      case 'gallery':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Galeria de Medalhas
              </h2>
              
              {/* View toggle */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? "default" : "outline"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grade</span>
                </Button>
                <Button
                  onClick={() => setViewMode('calendar')}
                  variant={viewMode === 'calendar' ? "default" : "outline"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendário</span>
                </Button>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <AchievementGrid
                  achievements={getFilteredAchievements(data.achievements)}
                  showFilters={false}
                  onAchievementClick={handleAchievementClick}
                  maxColumns={3}
                  medalSize="medium"
                  viewMode="grid"
                />
              </div>
            ) : (
              <AchievementCalendar
                achievements={getFilteredAchievements(data.achievements)}
                onAchievementClick={handleAchievementClick}
                initialView={calendarInitialView}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Se não há dados ainda (usuário novo), mostrar dados vazios mas funcionais
  if (!rewardsData) {
    const emptyData = {
      user: {
        name: 'Aventureiro',
        totalAchievements: 0,
      },
      achievements: [],
      dailyProgress: [],
      stats: {
        taskCount: 0,
        projectCount: 0,
        dailyMasterCount: 0,
        weeklyLegendCount: 0,
        currentStreak: 0,
        bestStreak: 0,
      }
    };
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Simplificado */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Central de Recompensas</h1>
                  <p className="text-gray-600 mt-1">Celebre suas conquistas e acompanhe seu progresso</p>
                </div>
                
                {/* Botão de Configurações */}
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="inline-flex items-center space-x-2 px-4 py-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Contador de Sequência de Hábitos */}
          <div className="mb-6">
            <HabitStreakCounter />
          </div>

          {/* Navigation Simplificada com Filtros */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => handleFilterChange('all')}
                variant={activeFilter === 'all' ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <span>🏆</span>
                <span>Todas</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {emptyData.user.totalAchievements || 0}
                </span>
              </Button>
              
              <Button
                onClick={() => handleFilterChange('task_completion')}
                variant={activeFilter === 'task_completion' ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <span>⚡</span>
                <span>Faíscas</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  0
                </span>
              </Button>
              
              <Button
                onClick={() => handleFilterChange('project_completion')}
                variant={activeFilter === 'project_completion' ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <span>🏗️</span>
                <span>Projetos</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  0
                </span>
              </Button>
              
              <Button
                onClick={() => handleFilterChange('daily_master')}
                variant={activeFilter === 'daily_master' ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <span>👑</span>
                <span>Imperador</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  0
                </span>
              </Button>
              
              <Button
                onClick={() => handleFilterChange('weekly_legend')}
                variant={activeFilter === 'weekly_legend' ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <span>⏳</span>
                <span>Guardião</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  0
                </span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Galeria de Medalhas
            </h2>
          </div>

          {/* Conteúdo da tab */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {renderTabContent(emptyData)}
            </AnimatePresence>
          </motion.div>

          {/* Sistema de notificações de conquista */}
          <AchievementNotificationSystem
            achievements={[]}
            onComplete={(achievement) => {
              console.log('Conquista celebrada:', achievement);
            }}
          />

          {/* Painel de configurações */}
          <RewardsSettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
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
                <h1 className="text-2xl font-bold text-gray-900">Central de Recompensas</h1>
                <p className="text-gray-600 mt-1">Celebre suas conquistas e acompanhe seu progresso</p>
              </div>
              
              {/* Botão de Configurações */}
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="inline-flex items-center space-x-2 px-4 py-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contador de Sequência de Hábitos */}
        <div className="mb-6">
          <HabitStreakCounter />
        </div>

        {/* Navigation Simplificada com Filtros */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleFilterChange('all')}
              variant={activeFilter === 'all' ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <span>🏆</span>
              <span>Todas</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {rewardsData.user.totalAchievements || 0}
              </span>
            </Button>
            
            <Button
              onClick={() => handleFilterChange('task_completion')}
              variant={activeFilter === 'task_completion' ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <span>⚡</span>
              <span>Faíscas</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {rewardsData.achievements.filter(a => a.type === 'task_completion').length}
              </span>
            </Button>
            
            <Button
              onClick={() => handleFilterChange('project_completion')}
              variant={activeFilter === 'project_completion' ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <span>🏗️</span>
              <span>Projetos</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {rewardsData.achievements.filter(a => a.type === 'project_completion').length}
              </span>
            </Button>
            
            <Button
              onClick={() => handleFilterChange('daily_master')}
              variant={activeFilter === 'daily_master' ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <span>👑</span>
              <span>Imperador</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {rewardsData.achievements.filter(a => a.type === 'daily_master').length}
              </span>
            </Button>
            
            <Button
              onClick={() => handleFilterChange('weekly_legend')}
              variant={activeFilter === 'weekly_legend' ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <span>⏳</span>
              <span>Guardião</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {rewardsData.achievements.filter(a => a.type === 'weekly_legend').length}
              </span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Galeria de Medalhas
          </h2>
        </div>

        {/* Conteúdo da tab */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {renderTabContent(rewardsData)}
          </AnimatePresence>
        </motion.div>

        {/* Modal de detalhes da conquista */}
        <AchievementModal
          achievement={selectedAchievement}
          isOpen={showModal}
          onClose={handleCloseModal}
        />

        {/* Sistema de notificações de conquista */}
        <AchievementNotificationSystem
          achievements={rewardsData.achievements}
          onComplete={(achievement) => {
            console.log('Conquista celebrada:', achievement);
            }}
          />

        {/* Painel de configurações */}
        <RewardsSettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
}