// ============================================================================
// MEDAL CARD - Componente para exibir conquistas individuais
// ============================================================================

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement, MedalProps } from '@/types/achievement';
import { MEDAL_CONFIGS } from '@/types/achievement';

// ============================================================================
// INTERFACES
// ============================================================================

interface MedalCardProps extends Omit<MedalProps, 'achievement'> {
  achievement: Achievement;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  showAnimation?: boolean;
  showDetails?: boolean;
  onClick?: () => void;
  disableTooltip?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMedalConfig(achievement: Achievement) {
  let key = achievement.type;
  if (achievement.subtype) {
    key += `_${achievement.subtype}`;
  }
  
  return MEDAL_CONFIGS[key] || {
    name: 'Conquista Desconhecida',
    emoji: '🏆',
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FFFF00'
    },
    description: 'Uma conquista especial',
    rarity: 'common' as const
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getSizeClasses(size: MedalCardProps['size']) {
  switch (size) {
    case 'tiny':
      return {
        container: 'w-6 h-6 sm:w-8 sm:h-8',
        emoji: 'text-xs sm:text-sm',
        text: 'text-xs',
      };
    case 'small':
      return {
        container: 'w-11 h-11 sm:w-16 sm:h-16',
        emoji: 'text-lg sm:text-2xl',
        text: 'text-xs',
      };
    case 'large':
      return {
        container: 'w-22 h-22 sm:w-32 sm:h-32',
        emoji: 'text-4xl sm:text-6xl',
        text: 'text-base sm:text-lg',
      };
    default: // medium
      return {
        container: 'w-17 h-17 sm:w-24 sm:h-24',
        emoji: 'text-3xl sm:text-4xl',
        text: 'text-sm',
      };
  }
}

function getRarityEffects(rarity: string) {
  switch (rarity) {
    case 'legendary':
      return {
        glow: 'drop-shadow-2xl',
        border: 'border-4 border-purple-400',
        background: 'bg-gradient-to-br from-purple-600 to-pink-600',
        particles: true,
      };
    case 'epic':
      return {
        glow: 'drop-shadow-xl',
        border: 'border-3 border-yellow-400',
        background: 'bg-gradient-to-br from-yellow-500 to-orange-500',
        particles: true,
      };
    case 'rare':
      return {
        glow: 'drop-shadow-lg',
        border: 'border-2 border-blue-400',
        background: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        particles: false,
      };
    default: // common
      return {
        glow: 'drop-shadow-md',
        border: 'border-2 border-gray-400',
        background: 'bg-gradient-to-br from-gray-500 to-gray-600',
        particles: false,
      };
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

function MedalParticles({ colors, size }: { colors: any; size: string }) {
  if (size === 'tiny' || size === 'small') return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: colors.accent }}
          initial={{
            x: '50%',
            y: '50%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 100}%`,
            y: `${50 + (Math.random() - 0.5) * 100}%`,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function MedalTooltip({ achievement, medalConfig, isVisible }: {
  achievement: Achievement;
  medalConfig: any;
  isVisible: boolean;
}) {
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`tooltip-${achievement.id}`}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-4 top-4 sm:top-8 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:max-w-sm z-[9999] pointer-events-none"
        >
          <div 
            className="relative bg-gray-900 text-white p-3 sm:p-4 rounded-xl shadow-2xl border border-gray-700 backdrop-blur-sm pointer-events-auto"
            style={{ 
              background: `linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))`,
              borderColor: medalConfig.colors.primary,
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px ${medalConfig.colors.primary}60, 0 0 30px ${medalConfig.colors.primary}40`
            }}
          >
            <div className="text-center relative z-10">
              <div className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-4xl">{medalConfig.emoji}</span>
                <span className="text-sm sm:text-base">{medalConfig.name}</span>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="text-sm sm:text-lg font-bold text-yellow-300 text-center">
                  Medalha nível {achievement.subtype || 'bronze'}
                </div>
                
                <div className="text-center space-y-2 sm:space-y-3">
                  {achievement.metadata?.projectName && (
                    <div className="text-xs sm:text-base text-blue-300 font-medium">
                      🏗️ Projeto: {achievement.metadata.projectName}
                    </div>
                  )}
                  {achievement.metadata?.taskDescription && (
                    <div className="text-xs sm:text-base text-green-300 font-medium">
                      ✅ Tarefa: {achievement.metadata.taskDescription}
                    </div>
                  )}
                  <div className="text-xs sm:text-base text-white font-medium">
                    {formatDate(achievement.earnedAt)}
                  </div>
                  {achievement.metadata?.energyPoints && (
                    <div className="text-sm sm:text-lg text-yellow-400 font-semibold">
                      ⚡ {achievement.metadata.energyPoints} pontos de energia
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MedalCard({ 
  achievement, 
  size = 'medium', 
  showAnimation = true,
  showDetails = false,
  onClick,
  disableTooltip = false
}: MedalCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const medalConfig = getMedalConfig(achievement);
  const sizeClasses = getSizeClasses(size);
  const rarityEffects = getRarityEffects(medalConfig.rarity);
  
  return (
    <div className="relative">
      <motion.div
        className={`
          relative ${sizeClasses.container} cursor-pointer
          ${rarityEffects.border} ${rarityEffects.glow}
          rounded-full flex items-center justify-center
          overflow-hidden transition-all duration-300
        `}
        style={{
          background: `linear-gradient(135deg, ${medalConfig.colors.primary}, ${medalConfig.colors.secondary})`,
        }}
        whileHover={{ 
          scale: showAnimation ? 1.05 : 1,
          rotateY: showAnimation ? 5 : 0,
        }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          setIsHovered(true);
          if (!showDetails && !disableTooltip) {
            hoverTimeoutRef.current = setTimeout(() => {
              setShowTooltip(true);
            }, 200);
          }
        }}
        onHoverEnd={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          setIsHovered(false);
          hoverTimeoutRef.current = setTimeout(() => {
            setShowTooltip(false);
          }, 50);
        }}
        onClick={onClick}
      >
        {/* Efeito de brilho de fundo */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${medalConfig.colors.accent}40, transparent 70%)`,
          }}
          animate={showAnimation ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Emoji da medalha */}
        <motion.div
          className={`${sizeClasses.emoji} z-10`}
          animate={showAnimation && isHovered ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {medalConfig.emoji}
        </motion.div>
        
        {/* Partículas para medalhas épicas/lendárias */}
        {rarityEffects.particles && showAnimation && (
          <MedalParticles colors={medalConfig.colors} size={size} />
        )}
        
        {/* Efeito de pulso para medalhas lendárias */}
        {medalConfig.rarity === 'legendary' && showAnimation && (
          <motion.div
            className="absolute inset-0 border-4 border-purple-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
      
      {/* Tooltip */}
      {!disableTooltip && (
        <MedalTooltip 
          achievement={achievement}
          medalConfig={medalConfig}
          isVisible={showTooltip}
        />
      )}
      
      {/* Detalhes embaixo (quando showDetails = true) */}
      {showDetails && (
        <motion.div 
          className="mt-2 text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`font-semibold text-gray-800 dark:text-gray-200 ${sizeClasses.text}`}>
            {medalConfig.name}
          </div>
          <div className={`text-gray-600 dark:text-gray-400 ${sizeClasses.text} mt-1`}>
            {formatDate(achievement.earnedAt)}
          </div>
        </motion.div>
      )}
    </div>
  );
}