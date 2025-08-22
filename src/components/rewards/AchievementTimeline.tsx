// ============================================================================
// ACHIEVEMENT TIMELINE - Visualização cronológica neurodivergente-friendly
// ============================================================================

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { MedalCard } from './MedalCard';
import { AdvancedMedalCard } from './medals/AdvancedMedalCard';
import type { Achievement, AchievementFilters } from '@/types/achievement';

// ============================================================================
// INTERFACES
// ============================================================================

interface AchievementTimelineProps {
  achievements: Achievement[];
  isLoading?: boolean;
  showFilters?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
  medalSize?: 'small' | 'medium' | 'large';
}

interface TimelineGroupProps {
  date: string;
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
  medalSize: 'small' | 'medium' | 'large';
  isFirst: boolean;
}

interface FilterButtonProps {
  label: string;
  value: string;
  currentValue: string;
  emoji: string;
  onClick: (value: string) => void;
  count?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDateGroup(date: string): string {
  const today = new Date();
  const achievementDate = new Date(date);
  const diffTime = today.getTime() - achievementDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  
  return achievementDate.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function groupAchievementsByDate(achievements: Achievement[]) {
  const groups: { [key: string]: Achievement[] } = {};
  
  achievements.forEach(achievement => {
    const date = new Date(achievement.earnedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(achievement);
  });

  return Object.entries(groups)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
    .map(([date, achievements]) => ({ date, achievements }));
}

function getAchievementTitle(achievement: Achievement): string {
  switch (achievement.type) {
    case 'task_completion':
      return `⚡ Faísca ${achievement.subtype || 'Básica'}`;
    case 'project_completion':
      return '🏗️ Arquiteto de Sonhos';
    case 'daily_master':
      return '👑 Imperador da Jornada';
    case 'weekly_legend':
      return '⏳ Guardião do Tempo';
    default:
      return '🏆 Conquista Especial';
  }
}

function getAchievementDescription(achievement: Achievement): string {
  if (achievement.metadata?.taskDescription) {
    return achievement.metadata.taskDescription;
  }
  if (achievement.metadata?.projectName) {
    return `Projeto: ${achievement.metadata.projectName}`;
  }
  return 'Conquista desbloqueada';
}

// ============================================================================
// COMPONENTS
// ============================================================================

function FilterButton({ label, value, currentValue, emoji, onClick, count }: FilterButtonProps) {
  const isActive = currentValue === value;
  
  return (
    <motion.button
      className={`
        px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm
        flex items-center gap-2 min-w-fit whitespace-nowrap
        ${isActive 
          ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }
      `}
      onClick={() => onClick(value)}
      whileHover={{ scale: isActive ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`
          text-xs px-2 py-0.5 rounded-full font-semibold
          ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
        `}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

function TimelineGroup({ date, achievements, onAchievementClick, medalSize, isFirst }: TimelineGroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* Timeline line */}
      <div className={`
        absolute left-8 ${isFirst ? 'top-16' : 'top-0'} w-0.5 h-full 
        bg-gradient-to-b from-blue-200 to-gray-200
      `} />
      
      {/* Date header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-16 h-16 bg-white border-4 border-blue-100 rounded-full shadow-md z-10">
          <Calendar className="w-6 h-6 text-blue-500" />
        </div>
        <div className="bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800">{formatDateGroup(date)}</h3>
          <p className="text-sm text-gray-500">
            {achievements.length} conquista{achievements.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Achievements list */}
      <div className="ml-20 space-y-4 pb-8">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group"
          >
            {/* Achievement card */}
            <div 
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer"
              onClick={() => onAchievementClick?.(achievement)}
            >
              <div className="flex items-start gap-4">
                {/* Medal */}
                <div className="flex-shrink-0">
                  <AdvancedMedalCard
                    achievement={achievement}
                    size={medalSize === 'large' ? 'medium' : 'small'}
                    showAnimation={false}
                    showDetails={false}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {getAchievementTitle(achievement)}
                  </h4>
                  
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {getAchievementDescription(achievement)}
                  </p>

                  {/* Time and metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(achievement.earnedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {(achievement as any).points && (
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        <span>{(achievement as any).points} pontos</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                  <span className="text-lg">→</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function LoadingTimeline() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="bg-gray-200 rounded-xl h-16 w-48 animate-pulse" />
          </div>
          <div className="ml-20 space-y-4">
            {[1, 2].map((_, j) => (
              <div key={j} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyTimeline() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-6xl mb-6">🗓️</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-3">
        Sua linha do tempo está vazia
      </h3>
      <p className="text-gray-500 max-w-md leading-relaxed">
        Complete tarefas e projetos para começar a construir sua jornada de conquistas!
      </p>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AchievementTimeline({ 
  achievements, 
  isLoading = false,
  showFilters = true,
  onAchievementClick,
  medalSize = 'medium'
}: AchievementTimelineProps) {
  const [filters, setFilters] = useState<Pick<AchievementFilters, 'type'>>({
    type: 'all'
  });

  // Calcular estatísticas para os filtros
  const achievementStats = useMemo(() => {
    return {
      all: achievements.length,
      task_completion: achievements.filter(a => a.type === 'task_completion').length,
      project_completion: achievements.filter(a => a.type === 'project_completion').length,
      daily_master: achievements.filter(a => a.type === 'daily_master').length,
      weekly_legend: achievements.filter(a => a.type === 'weekly_legend').length,
    };
  }, [achievements]);

  // Filtrar conquistas
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(achievement => achievement.type === filters.type);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    );
  }, [achievements, filters]);

  // Agrupar por data
  const timelineGroups = useMemo(() => {
    return groupAchievementsByDate(filteredAchievements);
  }, [filteredAchievements]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Filtros */}
      {showFilters && (
        <motion.div 
          className="mb-8 bg-gray-50 rounded-2xl p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-sm font-medium text-gray-700 mb-4">Filtrar conquistas:</h4>
          <div className="flex flex-wrap gap-3">
            <FilterButton
              label="Todas"
              value="all"
              currentValue={filters.type || 'all'}
              emoji="🏆"
              onClick={(value) => setFilters(f => ({ ...f, type: value as any }))}
              count={achievementStats.all}
            />
            <FilterButton
              label="Faíscas"
              value="task_completion"
              currentValue={filters.type || 'all'}
              emoji="⚡"
              onClick={(value) => setFilters(f => ({ ...f, type: value as any }))}
              count={achievementStats.task_completion}
            />
            <FilterButton
              label="Projetos"
              value="project_completion"
              currentValue={filters.type || 'all'}
              emoji="🏗️"
              onClick={(value) => setFilters(f => ({ ...f, type: value as any }))}
              count={achievementStats.project_completion}
            />
            <FilterButton
              label="Imperador"
              value="daily_master"
              currentValue={filters.type || 'all'}
              emoji="👑"
              onClick={(value) => setFilters(f => ({ ...f, type: value as any }))}
              count={achievementStats.daily_master}
            />
            <FilterButton
              label="Guardião"
              value="weekly_legend"
              currentValue={filters.type || 'all'}
              emoji="⏳"
              onClick={(value) => setFilters(f => ({ ...f, type: value as any }))}
              count={achievementStats.weekly_legend}
            />
          </div>
        </motion.div>
      )}

      {/* Timeline content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {isLoading ? (
          <LoadingTimeline />
        ) : timelineGroups.length === 0 ? (
          <EmptyTimeline />
        ) : (
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {timelineGroups.map(({ date, achievements }, index) => (
                <TimelineGroup
                  key={date}
                  date={date}
                  achievements={achievements}
                  onAchievementClick={onAchievementClick}
                  medalSize={medalSize}
                  isFirst={index === 0}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      {!isLoading && filteredAchievements.length > 0 && (
        <motion.div 
          className="text-center mt-6 text-sm text-gray-500 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Mostrando {filteredAchievements.length} de {achievements.length} conquistas na linha do tempo
        </motion.div>
      )}
    </div>
  );
}