// ============================================================================
// REWARDS PAGE CLIENT - Componente principal da página de recompensas
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Settings, Medal, Plus, Grid3X3, Calendar } from 'lucide-react';
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
    <button
      onClick={() => onClick(id)}
      className={`
        responsive-button flex items-center gap-2 relative transition-all duration-200
        ${
          isActive
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        }
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`
          px-2 py-1 text-xs font-bold rounded-full
          ${
            isActive
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
          }
        `}>
          {count}
        </span>
      )}
    </button>
  );
}

function PageHeader({ onSettingsClick }: { onSettingsClick: () => void }) {
  return (
    <div className="mb-4">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🏆</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Central de Recompensas</h1>
              <p className="text-yellow-100 mt-1">Celebre suas conquistas e acompanhe seu progresso</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={onSettingsClick}
              className="flex items-center space-x-3 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-2xl hover:bg-white/25 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Settings className="w-5 h-5" />
              <span className="font-semibold">Configurações</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 responsive-spacing">
      <div className="responsive-container">
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
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
            <div className="responsive-subtitle text-gray-700 dark:text-gray-300 mb-4">
              Carregando suas conquistas épicas...
            </div>
            <motion.div 
              className="h-2 w-48 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 responsive-spacing">
      <div className="responsive-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <div className="text-6xl mb-4">😞</div>
          <h2 className="responsive-subtitle text-gray-800 dark:text-gray-200 mb-2">
            Oops! Algo deu errado
          </h2>
          <p className="responsive-text text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            {error}
          </p>
          <button
            onClick={onRetry}
            className="responsive-button bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Tentar novamente
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function RecentAchievementsTimeline({ achievements, onAchievementClick }: RecentAchievementsTimelineProps) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="text-6xl mb-4">🌟</div>
        <p className="responsive-text">
          Complete tarefas para ver suas conquistas recentes aqui!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="responsive-subtitle text-gray-800 dark:text-gray-200 mb-6">
        ⚡ Conquistas Recentes
      </h3>
      <div className="space-y-3">
        {achievements.slice(0, 8).map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="sentinela-card cursor-pointer group"
            onClick={() => onAchievementClick(achievement)}
          >
            <div className="flex items-center gap-4">
              <MedalCard 
                achievement={achievement}
                size="small"
                showAnimation={false}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {achievement.type === 'task_completion' && `⚡ Faísca ${achievement.subtype}`}
                  {achievement.type === 'project_completion' && '🏗️ Arquiteto de Sonhos'}
                  {achievement.type === 'daily_master' && '👑 Imperador da Jornada'}
                  {achievement.type === 'weekly_legend' && '⏳ Guardião do Tempo'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
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
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grade</span>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${viewMode === 'calendar' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendário</span>
                </button>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <PageHeader onSettingsClick={() => setShowSettings(true)} />
        
        {/* Contador de Sequência de Hábitos */}
        <div className="mb-6">
          <HabitStreakCounter />
        </div>

        {/* Navigation */}
        <div className="bg-gradient-to-br from-white via-slate-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200/60 backdrop-blur-sm p-6 mb-3">
          {/* Achievement Filters */}
            <div className="flex gap-1.5 justify-center w-full">
              <button
                onClick={() => handleFilterChange('all')}
                className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
                tabIndex={0}
              >
                <span className="text-xs">🏆</span>
                <span className="hidden sm:inline text-xs">Todas</span>
                <span className="sm:hidden text-xs">Tod</span>
                <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                  activeFilter === 'all'
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {emptyData.user.totalAchievements || 0}
                </span>
              </button>
              
              <button
                onClick={() => handleFilterChange('task_completion')}
                className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                  activeFilter === 'task_completion'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
                tabIndex={0}
              >
                <span className="text-xs">⚡</span>
                <span className="hidden sm:inline text-xs">Faíscas</span>
                <span className="sm:hidden text-xs">Faí</span>
                <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                  activeFilter === 'task_completion'
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  0
                </span>
              </button>
              
              <button
                onClick={() => handleFilterChange('project_completion')}
                className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                  activeFilter === 'project_completion'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
                tabIndex={0}
              >
                <span className="text-xs">🏗️</span>
                <span className="hidden sm:inline text-xs">Projetos</span>
                <span className="sm:hidden text-xs">Pro</span>
                <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                  activeFilter === 'project_completion'
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  0
                </span>
              </button>
              
              <button
                onClick={() => handleFilterChange('daily_master')}
                className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                  activeFilter === 'daily_master'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
                tabIndex={0}
              >
                <span className="text-xs">👑</span>
                <span className="hidden sm:inline text-xs">Imperador</span>
                <span className="sm:hidden text-xs">Imp</span>
                <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                  activeFilter === 'daily_master'
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  0
                </span>
              </button>
              
              <button
                onClick={() => handleFilterChange('weekly_legend')}
                className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                  activeFilter === 'weekly_legend'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
                tabIndex={0}
              >
                <span className="text-xs">⏳</span>
                <span className="hidden sm:inline text-xs">Guardião</span>
                <span className="sm:hidden text-xs">Gua</span>
                <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                  activeFilter === 'weekly_legend'
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  0
                </span>
              </button>
            </div>
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader onSettingsClick={() => setShowSettings(true)} />
      
      {/* Contador de Sequência de Hábitos */}
      <div className="mb-6">
        <HabitStreakCounter />
      </div>

      {/* Navigation */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200/60 backdrop-blur-sm p-6 mb-3">
        {/* Achievement Filters */}
          <div className="flex gap-1.5 justify-center w-full">
            <button
              onClick={() => handleFilterChange('all')}
              className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              tabIndex={0}
            >
              <span className="text-xs">🏆</span>
              <span className="hidden sm:inline text-xs">Todas</span>
              <span className="sm:hidden text-xs">Tod</span>
              <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                activeFilter === 'all'
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {rewardsData.user.totalAchievements || 0}
              </span>
            </button>
            
            <button
              onClick={() => handleFilterChange('task_completion')}
              className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                activeFilter === 'task_completion'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              tabIndex={0}
            >
              <span className="text-xs">⚡</span>
              <span className="hidden sm:inline text-xs">Faíscas</span>
              <span className="sm:hidden text-xs">Faí</span>
              <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                activeFilter === 'task_completion'
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {rewardsData.achievements.filter(a => a.type === 'task_completion').length}
              </span>
            </button>
            
            <button
              onClick={() => handleFilterChange('project_completion')}
              className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                activeFilter === 'project_completion'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              tabIndex={0}
            >
              <span className="text-xs">🏗️</span>
              <span className="hidden sm:inline text-xs">Projetos</span>
              <span className="sm:hidden text-xs">Pro</span>
              <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                activeFilter === 'project_completion'
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {rewardsData.achievements.filter(a => a.type === 'project_completion').length}
              </span>
            </button>
            
            <button
              onClick={() => handleFilterChange('daily_master')}
              className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                activeFilter === 'daily_master'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              tabIndex={0}
            >
              <span className="text-xs">👑</span>
              <span className="hidden sm:inline text-xs">Imperador</span>
              <span className="sm:hidden text-xs">Imp</span>
              <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                activeFilter === 'daily_master'
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {rewardsData.achievements.filter(a => a.type === 'daily_master').length}
              </span>
            </button>
            
            <button
              onClick={() => handleFilterChange('weekly_legend')}
              className={`responsive-button flex items-center gap-1.5 font-medium transition-all duration-300 text-xs shadow-lg flex-1 max-w-[21.6%] justify-center px-1.5 py-1.5 rounded-xl ${
                activeFilter === 'weekly_legend'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              tabIndex={0}
            >
              <span className="text-xs">⏳</span>
              <span className="hidden sm:inline text-xs">Guardião</span>
              <span className="sm:hidden text-xs">Gua</span>
              <span className={`text-xs px-1 py-0.5 rounded-full font-semibold ${
                activeFilter === 'weekly_legend'
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {rewardsData.achievements.filter(a => a.type === 'weekly_legend').length}
              </span>
            </button>
          </div>
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
  );
}