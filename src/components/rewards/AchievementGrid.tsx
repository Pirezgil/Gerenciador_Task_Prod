// ============================================================================
// ACHIEVEMENT GRID - Grid organizada para exibir medalhas
// ============================================================================

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MedalCard } from './MedalCard';
import { AdvancedMedalCard } from './medals/AdvancedMedalCard';
import { AchievementTimeline } from './AchievementTimeline';
import type { Achievement, AchievementFilters } from '@/types/achievement';

// ============================================================================
// INTERFACES
// ============================================================================

interface AchievementGridProps {
  achievements: Achievement[];
  isLoading?: boolean;
  showFilters?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
  maxColumns?: 3 | 4 | 5 | 6;
  medalSize?: 'small' | 'medium' | 'large';
  viewMode?: 'grid' | 'timeline';
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

function sortAchievements(achievements: Achievement[], sortBy: AchievementFilters['sortBy'], sortOrder: AchievementFilters['sortOrder']) {
  const sorted = [...achievements].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime();
      case 'type':
        return a.type.localeCompare(b.type);
      case 'rarity':
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return (rarityOrder[a.type as keyof typeof rarityOrder] || 1) - 
               (rarityOrder[b.type as keyof typeof rarityOrder] || 1);
      default:
        return 0;
    }
  });

  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function FilterButton({ label, value, currentValue, emoji, onClick, count }: FilterButtonProps) {
  const isActive = currentValue === value;
  
  return (
    <motion.button
      className={`
        responsive-button flex items-center gap-2 font-medium transition-all duration-300 text-sm sm:text-base
        ${isActive 
          ? 'bg-blue-500 text-white shadow-lg' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        }
      `}
      onClick={() => onClick(value)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-sm sm:text-base">{emoji}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden text-xs">{label.substring(0, 3)}</span>
      {count !== undefined && count > 0 && (
        <span className={`
          text-xs px-1.5 py-0.5 rounded-full font-semibold
          ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
        `}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

function LoadingSkeleton({ count = 6, medalSize }: { count?: number; medalSize: 'small' | 'medium' | 'large' }) {
  const sizeClass = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }[medalSize];

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`${sizeClass} bg-gray-200 dark:bg-gray-700 rounded-full`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
            scale: 1 
          }}
          transition={{ 
            opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 0.3, delay: i * 0.1 }
          }}
        />
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <motion.div 
      className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-4xl sm:text-6xl mb-4">🏆</div>
      <h3 className="responsive-subtitle text-gray-700 dark:text-gray-300 mb-2">
        Nenhuma conquista ainda
      </h3>
      <p className="responsive-text text-gray-500 dark:text-gray-400 text-center max-w-md px-4">
        Complete tarefas e projetos para começar a colecionar suas primeiras medalhas!
      </p>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AchievementGrid({ 
  achievements, 
  isLoading = false,
  showFilters = true,
  onAchievementClick,
  maxColumns = 4,
  medalSize = 'medium',
  viewMode = 'grid'
}: AchievementGridProps) {
  const [filters, setFilters] = useState<AchievementFilters>({
    type: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
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

  // Filtrar e ordenar conquistas
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    
    // Filtrar por tipo
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(achievement => achievement.type === filters.type);
    }
    
    // Ordenar
    filtered = sortAchievements(filtered, filters.sortBy, filters.sortOrder);
    
    return filtered;
  }, [achievements, filters]);

  // Se o modo for timeline, usar o componente AchievementTimeline
  if (viewMode === 'timeline') {
    return (
      <AchievementTimeline
        achievements={achievements}
        isLoading={isLoading}
        showFilters={showFilters}
        onAchievementClick={onAchievementClick}
        medalSize={medalSize}
      />
    );
  }

  // Modo grid padrão
  return (
    <div className="w-full">
      {/* Filtros */}
      {showFilters && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Filtros de tipo */}
          <div className="responsive-flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-6">
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

          {/* Ordenação */}
          <div className="responsive-flex items-center justify-center sm:justify-start gap-3 text-sm">
            <span className="text-gray-600 dark:text-gray-400 hidden sm:inline">Ordenar por:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm min-w-[100px]"
            >
              <option value="date">Data</option>
              <option value="type">Tipo</option>
              <option value="rarity">Raridade</option>
            </select>
            
            <button
              onClick={() => setFilters(f => ({ 
                ...f, 
                sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="text-blue-500 hover:text-blue-700 transition-colors px-2 py-1 rounded text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">
                {filters.sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
              </span>
              <span className="sm:hidden">
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid de medalhas - LAYOUT 3 COLUNAS */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {isLoading ? (
          <LoadingSkeleton count={8} medalSize={medalSize} />
        ) : filteredAchievements.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
                className="flex justify-center"
              >
                <AdvancedMedalCard
                  achievement={achievement}
                  size={medalSize}
                  showAnimation={true}
                  showDetails={medalSize === 'large'}
                  onClick={() => onAchievementClick?.(achievement)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Contador de resultados */}
      {!isLoading && filteredAchievements.length > 0 && (
        <motion.div 
          className="text-center mt-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="hidden sm:inline">
            Exibindo {filteredAchievements.length} de {achievements.length} conquistas
          </span>
          <span className="sm:hidden">
            {filteredAchievements.length}/{achievements.length}
          </span>
        </motion.div>
      )}
    </div>
  );
}