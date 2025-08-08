// ============================================================================
// REWARDS STATS - Componente de estatísticas para a página de recompensas
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RewardsPageData } from '@/types/achievement';

// ============================================================================
// INTERFACES
// ============================================================================

interface RewardsStatsProps {
  data: RewardsPageData;
  showAnimations?: boolean;
}

interface StatCardProps {
  icon: string;
  title: string;
  value: number;
  subtitle: string;
  color: string;
  delay?: number;
  onClick?: () => void;
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function AnimatedCounter({ target, duration = 1000, delay = 0 }: { 
  target: number; 
  duration?: number; 
  delay?: number; 
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = target / (duration / 16); // 60fps
      let value = 0;
      
      const counter = setInterval(() => {
        value += increment;
        if (value >= target) {
          setCurrent(target);
          clearInterval(counter);
        } else {
          setCurrent(Math.floor(value));
        }
      }, 16);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return <span>{current}</span>;
}

function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
            <AnimatedCounter target={Math.round(progress)} delay={500} />%
          </span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, delay = 0, onClick }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        sentinela-card cursor-pointer transition-all duration-300
        ${onClick ? 'hover:border-blue-300 dark:hover:border-blue-600' : ''}
      `}
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${color}08, transparent)`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="text-2xl sm:text-3xl p-2 sm:p-3 rounded-lg flex items-center justify-center min-w-[48px] min-h-[48px]"
          style={{ backgroundColor: color + '20' }}
        >
          {icon}
        </div>
        <div className="text-right flex-1 ml-4">
          <div className="responsive-subtitle font-bold text-gray-800 dark:text-gray-200">
            <AnimatedCounter target={value} delay={delay + 300} />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {title}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {subtitle}
      </div>
    </motion.div>
  );
}

function StreakIndicator({ currentStreak, bestStreak, delay = 0 }: {
  currentStreak: number;
  bestStreak: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl responsive-spacing text-white shadow-lg"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <div className="text-sm opacity-90 mb-1">Streak Atual</div>
          <div className="responsive-title font-bold">
            <AnimatedCounter target={currentStreak} delay={delay + 300} />
          </div>
          <div className="text-xs opacity-75">dias consecutivos</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl sm:text-4xl mb-2">🔥</div>
          <div className="text-xs opacity-90">
            Recorde: {bestStreak} dias
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RewardsStats({ data, showAnimations = true }: RewardsStatsProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  
  const totalAchievements = data.user.totalAchievements;
  const stats = data.stats;
  
  // Calcular progresso para próximas conquistas
  const completionRate = totalAchievements > 0 ? 100 : 0;
  
  return (
    <div className="w-full space-y-6">
      {/* Header com nome e conquistas totais */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="responsive-title text-gray-800 dark:text-gray-200 mb-4">
          Jornada de {data.user.name}
        </h1>
        <p className="responsive-text text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          🌟 Suas conquistas são prova do seu poder de transformar intenção em ação.
        </p>
        
        {/* Total de conquistas com destaque */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', bounce: 0.4 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white responsive-button shadow-lg"
        >
          <span className="text-xl sm:text-2xl">🏆</span>
          <AnimatedCounter target={totalAchievements} delay={500} />
          <span className="hidden sm:inline">Conquistas Épicas</span>
          <span className="sm:hidden">Conquistas</span>
        </motion.div>
      </motion.div>

      {/* Grid de estatísticas principais */}
      <div className="responsive-grid cols-2-sm cols-4-md gap-4 sm:gap-6">
        <StatCard
          icon="⚡"
          title="Faíscas"
          value={stats.taskCount}
          subtitle="Tarefas conquistadas com energia"
          color="#F59E0B"
          delay={showAnimations ? 0.1 : 0}
          onClick={() => setSelectedStat('tasks')}
        />
        
        <StatCard
          icon="🏗️"
          title="Projetos"
          value={stats.projectCount}
          subtitle="Sonhos arquitetados e realizados"
          color="#3B82F6"
          delay={showAnimations ? 0.2 : 0}
          onClick={() => setSelectedStat('projects')}
        />
        
        <StatCard
          icon="👑"
          title="Imperador"
          value={stats.dailyMasterCount}
          subtitle="Dias dominados completamente"
          color="#EF4444"
          delay={showAnimations ? 0.3 : 0}
          onClick={() => setSelectedStat('daily')}
        />
        
        <StatCard
          icon="⏳"
          title="Guardião"
          value={stats.weeklyLegendCount}
          subtitle="Semanas de domínio temporal"
          color="#8B5CF6"
          delay={showAnimations ? 0.4 : 0}
          onClick={() => setSelectedStat('weekly')}
        />
      </div>

      {/* Seção de streak */}
      <div className="responsive-grid cols-3-md gap-4 sm:gap-6">
        <div className="md:col-span-2">
          <StreakIndicator 
            currentStreak={stats.currentStreak}
            bestStreak={stats.bestStreak}
            delay={showAnimations ? 0.5 : 0}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: showAnimations ? 0.6 : 0 }}
          className="flex items-center justify-center py-4"
        >
          <ProgressRing 
            progress={stats.currentStreak > 0 ? Math.min((stats.currentStreak / 30) * 100, 100) : 0}
            color="#F59E0B"
            size={120}
          />
        </motion.div>
      </div>

      {/* Estatísticas detalhadas expandíveis */}
      <AnimatePresence>
        {selectedStat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Detalhes da Conquista
              </h3>
              <button
                onClick={() => setSelectedStat(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="responsive-grid cols-2-sm gap-4">
              {selectedStat === 'tasks' && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">⚡ Bronze</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tarefas de 1 energia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">⚡ Prata</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tarefas de 3 energia</div>
                  </div>
                </>
              )}
              
              {selectedStat === 'daily' && (
                <div className="col-span-full text-center">
                  <div className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                    Você dominou <span className="font-bold text-red-500">{stats.dailyMasterCount}</span> dias completamente!
                  </div>
                  <div className="text-sm text-gray-500">
                    Completando todas as tarefas planejadas para o dia
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}