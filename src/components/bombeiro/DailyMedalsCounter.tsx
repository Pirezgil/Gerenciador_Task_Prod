// ============================================================================
// WEEKLY MEDALS COUNTER - Contador de medalhas ganhas na semana
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWeeklyAchievements } from '@/hooks/api/useAchievements';

// ============================================================================
// INTERFACES
// ============================================================================

interface WeeklyMedalsCounterProps {
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WeeklyMedalsCounter({ className = '' }: WeeklyMedalsCounterProps) {
  const router = useRouter();
  const { data: weeklyData, isLoading } = useWeeklyAchievements();
  
  const medalsCount = weeklyData?.totalCount || 0;
  const medalsByType = weeklyData?.medalsByType || [];
  const weekStart = weeklyData?.weekStart || '';
  const weekEnd = weeklyData?.weekEnd || '';
  
  // Função para formatar período da semana
  const getWeekPeriod = () => {
    if (!weekStart || !weekEnd) return '';
    const start = new Date(weekStart).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const end = new Date(weekEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${start} - ${end}`;
  };

  const handleClick = () => {
    router.push('/recompensas?view=calendario&periodo=semana');
  };

  // Estados de progresso
  const getProgressColor = () => {
    if (medalsCount === 0) return 'from-gray-100 to-gray-200';
    if (medalsCount <= 3) return 'from-blue-100 to-blue-200';
    if (medalsCount <= 6) return 'from-yellow-100 to-yellow-200';
    if (medalsCount <= 10) return 'from-orange-100 to-orange-200';
    return 'from-purple-100 to-purple-200';
  };

  const getIconColor = () => {
    if (medalsCount === 0) return 'text-gray-400';
    if (medalsCount <= 3) return 'text-blue-500';
    if (medalsCount <= 6) return 'text-yellow-500';
    if (medalsCount <= 10) return 'text-orange-500';
    return 'text-purple-500';
  };

  const getMotivationalMessage = () => {
    if (medalsCount === 0) return 'Primeira conquista da semana te espera!';
    if (medalsCount === 1) return 'Primeira medalha da semana! 🎯';
    if (medalsCount <= 5) return 'Bom progresso semanal! 🚀';
    if (medalsCount <= 10) return 'Semana impressionante! 💪';
    if (medalsCount <= 15) return 'Semana épica em andamento! 🔥';
    return 'Semana lendária! Você é imparável! ⭐';
  };

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse" />
            <div className="h-3 bg-gray-300 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-r ${getProgressColor()} border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {/* Ícone principal */}
        <div className="relative">
          <motion.div
            className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm ${getIconColor()}`}
            animate={medalsCount > 0 ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0] 
            } : {}}
            transition={{ 
              duration: 2,
              repeat: medalsCount > 5 ? Infinity : 0,
              ease: "easeInOut" 
            }}
          >
            {medalsCount === 0 ? (
              <Award className="w-6 h-6" />
            ) : medalsCount <= 5 ? (
              <Trophy className="w-6 h-6" />
            ) : (
              <Zap className="w-6 h-6" />
            )}
          </motion.div>

          {/* Badge de contagem */}
          {medalsCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 15,
                delay: 0.2 
              }}
            >
              {medalsCount > 99 ? '99+' : medalsCount}
            </motion.div>
          )}
        </div>

        {/* Conteúdo textual */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
              Medalhas da Semana
            </h3>
            <div className="text-xs text-gray-500 mt-1">
              {getWeekPeriod()}
            </div>
            {medalsCount > 0 && (
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              >
                🏆
              </motion.span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {getMotivationalMessage()}
          </p>

          {/* Grid de medalhas por tipo */}
          {medalsCount > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-center gap-4 bg-white/30 rounded-lg p-3">
                {medalsByType.map((medal, index) => {
                  const getTooltipText = () => {
                    switch (medal.type) {
                      case 'task_completion':
                        if (medal.subtype === 'bronze') return 'Medalha Bronze: Tarefas de 1-2 pontos de energia';
                        if (medal.subtype === 'silver') return 'Medalha Prata: Tarefas de 3 pontos de energia';
                        if (medal.subtype === 'gold') return 'Medalha Ouro: Tarefas de 4+ pontos de energia';
                        return 'Medalha por completar tarefas';
                      case 'daily_master': 
                        return 'Mestre do Dia: Completou todas as tarefas planejadas';
                      case 'project_completion':
                        return 'Arquiteto de Sonhos: Finalizou um projeto completo';
                      default:
                        return 'Medalha conquistada';
                    }
                  };

                  return (
                    <motion.div
                      key={`${medal.type}-${medal.subtype}`}
                      className="relative flex flex-col items-center group"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.15, duration: 0.4 }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        {getTooltipText()}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>

                      {/* Medalha */}
                      <motion.div
                        className="relative w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg cursor-pointer"
                        style={{ backgroundColor: medal.color }}
                        whileHover={{ scale: 1.1 }}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: medal.type === 'daily_master' ? [0, 5, -5, 0] : 0
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: medal.type === 'daily_master' ? Infinity : 0,
                          ease: "easeInOut" 
                        }}
                      >
                        {medal.icon}
                        
                        {/* Badge de contagem */}
                        <motion.div
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 15,
                            delay: index * 0.15 + 0.2 
                          }}
                        >
                          {medal.count > 99 ? '99+' : medal.count}
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de tempo real */}
      {medalsCount >= 10 && (
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-white/30">
          <motion.span
            className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌟 Semana Épica!
          </motion.span>
        </div>
      )}
    </motion.div>
  );
}