// ============================================================================
// ADVANCED MEDAL CARD - Implementação do design conceitual da Dra. Elara Vance
// ============================================================================

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '@/types/achievement';
import { MEDAL_CONFIGS } from '@/types/achievement';

// ============================================================================
// INTERFACES
// ============================================================================

interface AdvancedMedalCardProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showAnimation?: boolean;
  showDetails?: boolean;
  onClick?: () => void;
}

// ============================================================================
// COMPONENTES DE EFEITOS ESPECÍFICOS
// ============================================================================

// Faísca de Conquista - Partículas elétricas em movimento
function SparkParticles({ colors, size, subtype }: { colors: any; size: string; subtype?: string }) {
  const particleCount = subtype === 'gold' ? 12 : subtype === 'silver' ? 8 : 6;
  const particleSize = size === 'large' ? 'w-2 h-2' : size === 'medium' ? 'w-1.5 h-1.5' : 'w-1 h-1';
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute ${particleSize} rounded-full`}
          style={{ 
            backgroundColor: colors.accent,
            boxShadow: `0 0 8px ${colors.accent}`,
          }}
          initial={{
            x: '50%',
            y: '50%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: `${50 + Math.sin(i * Math.PI / 3) * 40}%`,
            y: `${50 + Math.cos(i * Math.PI / 3) * 40}%`,
            opacity: [0, 1, 0.7, 0],
            scale: [0, 1.2, 0.8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* Raio central pulsante */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div 
          className={`${size === 'large' ? 'w-8 h-1' : size === 'medium' ? 'w-6 h-0.5' : 'w-4 h-0.5'} rounded-full`}
          style={{ 
            backgroundColor: colors.accent,
            boxShadow: `0 0 12px ${colors.accent}`,
          }}
        />
      </motion.div>
    </div>
  );
}

// Arquiteto de Sonhos - Estrutura cristalina que se constrói
function CrystallineStructure({ colors, size }: { colors: any; size: string }) {
  const layers = size === 'large' ? 6 : size === 'medium' ? 4 : 3;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hexágono base com camadas translúcidas */}
      {[...Array(layers)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
            background: `linear-gradient(135deg, ${colors.primary}${Math.floor(80 - i * 10).toString(16)}, ${colors.secondary}${Math.floor(60 - i * 8).toString(16)})`,
            transform: `scale(${1 - i * 0.15}) rotate(${i * 30}deg)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* Linhas de circuito dourado */}
      <motion.div
        className="absolute inset-0 border-2 rounded-full opacity-60"
        style={{
          borderColor: colors.accent,
          borderStyle: 'dashed',
          borderDashArray: '4 8',
        }}
        animate={{
          rotate: [0, 360],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      
      {/* Reflexos prismáticos */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
        style={{
          background: `linear-gradient(45deg, transparent, ${colors.accent}40, transparent)`,
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Imperador da Jornada - Coroa imperial com cristais orbitantes
function ImperialCrown({ colors, size }: { colors: any; size: string }) {
  const crystalCount = 24; // Representando as 24 horas
  const crystalSize = size === 'large' ? 'w-1.5 h-1.5' : size === 'medium' ? 'w-1 h-1' : 'w-0.5 h-0.5';
  
  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      {/* Sol radiante central */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div 
          className={`${size === 'large' ? 'w-12 h-12' : size === 'medium' ? 'w-8 h-8' : 'w-6 h-6'} rounded-full`}
          style={{ 
            background: `radial-gradient(circle, ${colors.accent}, ${colors.primary})`,
            boxShadow: `0 0 20px ${colors.accent}`,
          }}
        />
      </motion.div>
      
      {/* 24 cristais orbitantes (horas do dia) */}
      {[...Array(crystalCount)].map((_, i) => {
        const angle = (i * 360) / crystalCount;
        const radius = size === 'large' ? 60 : size === 'medium' ? 45 : 35;
        
        return (
          <motion.div
            key={i}
            className={`absolute ${crystalSize} rounded-full`}
            style={{ 
              backgroundColor: colors.accent,
              boxShadow: `0 0 6px ${colors.accent}`,
              left: '50%',
              top: '50%',
              transformOrigin: '50% 50%',
            }}
            initial={{
              x: '-50%',
              y: '-50%',
              opacity: 0,
            }}
            animate={{
              x: `${Math.cos((angle - 90) * Math.PI / 180) * radius - 50}%`,
              y: `${Math.sin((angle - 90) * Math.PI / 180) * radius - 50}%`,
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        );
      })}
      
      {/* Partículas douradas convergentes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: colors.accent }}
          initial={{
            x: `${Math.random() * 200 - 100}%`,
            y: `${Math.random() * 200 - 100}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: '50%',
            y: '50%',
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Guardião do Tempo - Ampulheta cósmica com nebulosas
function CosmicHourglass({ colors, size }: { colors: any; size: string }) {
  const starCount = 7; // Representando os 7 dias da semana
  const starSize = size === 'large' ? 'w-2 h-2' : size === 'medium' ? 'w-1.5 h-1.5' : 'w-1 h-1';
  
  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      {/* Nebulosas estelares de fundo */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-40"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.primary}60, ${colors.secondary}20, transparent)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Partículas estelares fluindo */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: colors.accent }}
          initial={{
            x: '50%',
            y: '20%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: '50%',
            y: '80%',
            opacity: [0, 1, 0.7, 0],
            scale: [0, 1, 0.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.25,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Constelação de 7 estrelas (dias da semana) */}
      {[...Array(starCount)].map((_, i) => {
        const angle = (i * 360) / starCount;
        const radius = size === 'large' ? 70 : size === 'medium' ? 55 : 40;
        
        return (
          <motion.div
            key={`star-${i}`}
            className={`absolute ${starSize}`}
            style={{ 
              left: '50%',
              top: '50%',
              transformOrigin: '50% 50%',
            }}
            initial={{
              x: '-50%',
              y: '-50%',
              opacity: 0,
            }}
            animate={{
              x: `${Math.cos((angle - 90) * Math.PI / 180) * radius - 50}%`,
              y: `${Math.sin((angle - 90) * Math.PI / 180) * radius - 50}%`,
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          >
            <div 
              className="w-full h-full"
              style={{
                background: colors.accent,
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                filter: `drop-shadow(0 0 4px ${colors.accent})`,
              }}
            />
          </motion.div>
        );
      })}
      
      {/* Efeito de ampulheta */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, transparent 45%, ${colors.accent}20 50%, transparent 55%)`,
        }}
        animate={{
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
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

function getSizeClasses(size: AdvancedMedalCardProps['size']) {
  switch (size) {
    case 'small':
      return {
        container: 'w-14 h-14 sm:w-20 sm:h-20',
        emoji: 'text-lg sm:text-2xl',
        text: 'text-xs',
      };
    case 'large':
      return {
        container: 'w-28 h-28 sm:w-40 sm:h-40',
        emoji: 'text-5xl sm:text-7xl',
        text: 'text-base sm:text-lg',
      };
    default: // medium
      return {
        container: 'w-20 h-20 sm:w-28 sm:h-28',
        emoji: 'text-3xl sm:text-5xl',
        text: 'text-sm',
      };
  }
}

// ============================================================================
// COMPONENTE DE TOOLTIP AVANÇADO
// ============================================================================

function AdvancedTooltip({ achievement, medalConfig, isVisible }: {
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
          className="fixed inset-x-4 top-4 sm:top-8 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:max-w-md z-[9999] pointer-events-none"
        >
          <div 
            className="relative bg-gray-900 text-white p-3 sm:p-5 rounded-xl shadow-2xl border-2 w-full backdrop-blur-sm pointer-events-auto"
            style={{ 
              background: `linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))`,
              borderColor: medalConfig.colors.primary,
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px ${medalConfig.colors.primary}60, 0 0 30px ${medalConfig.colors.primary}40`,
            }}
          >
            <div className="text-center relative z-10">
              <div className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-4xl">{medalConfig.emoji}</span>
                <span className="text-sm sm:text-base">{medalConfig.name}</span>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-4">
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
// COMPONENTE PRINCIPAL
// ============================================================================

export function AdvancedMedalCard({ 
  achievement, 
  size = 'medium', 
  showAnimation = true,
  showDetails = false,
  onClick 
}: AdvancedMedalCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const medalConfig = getMedalConfig(achievement);
  const sizeClasses = getSizeClasses(size);
  
  // Renderizar efeito específico baseado no tipo de conquista
  function renderSpecialEffects() {
    if (!showAnimation) return null;
    
    switch (achievement.type) {
      case 'task_completion':
        return <SparkParticles colors={medalConfig.colors} size={size} subtype={achievement.subtype} />;
      case 'project_completion':
        return <CrystallineStructure colors={medalConfig.colors} size={size} />;
      case 'daily_master':
        return <ImperialCrown colors={medalConfig.colors} size={size} />;
      case 'weekly_legend':
        return <CosmicHourglass colors={medalConfig.colors} size={size} />;
      default:
        return null;
    }
  }
  
  return (
    <div className="relative">
      <motion.div
        className={`
          relative ${sizeClasses.container} cursor-pointer
          rounded-full flex items-center justify-center
          overflow-visible transition-all duration-300
        `}
        style={{
          background: `linear-gradient(135deg, ${medalConfig.colors.primary}, ${medalConfig.colors.secondary})`,
          boxShadow: isHovered 
            ? `0 0 30px ${medalConfig.colors.primary}60, 0 0 50px ${medalConfig.colors.secondary}30` 
            : `0 0 15px ${medalConfig.colors.primary}40`,
        }}
        whileHover={{ 
          scale: showAnimation ? 1.1 : 1,
          rotateY: showAnimation ? 10 : 0,
        }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          setIsHovered(true);
          if (!showDetails) {
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
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: Math.random() * 0.2 
        }}
      >
        {/* Efeito de brilho de fundo animado */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle at center, ${medalConfig.colors.accent}60, transparent 70%)`,
          }}
          animate={showAnimation ? {
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Emoji da medalha */}
        <motion.div
          className={`${sizeClasses.emoji} z-20 relative`}
          animate={showAnimation && isHovered ? {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          } : {}}
          transition={{ duration: 0.6 }}
          style={{ 
            filter: `drop-shadow(0 0 8px ${medalConfig.colors.accent})`,
          }}
        >
          {medalConfig.emoji}
        </motion.div>
        
        {/* Efeitos específicos de cada medalha */}
        {renderSpecialEffects()}
        
        {/* Borda externa animada para medalhas lendárias */}
        {medalConfig.rarity === 'legendary' && showAnimation && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 opacity-60"
            style={{ borderColor: medalConfig.colors.accent }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0, 0.8, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
      
      {/* Tooltip avançado */}
      <AdvancedTooltip 
        achievement={achievement}
        medalConfig={medalConfig}
        isVisible={showTooltip}
      />
      
      {/* Detalhes embaixo (quando showDetails = true) */}
      {showDetails && (
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`font-bold text-gray-800 dark:text-gray-200 ${sizeClasses.text} mb-1`}>
            {medalConfig.name}
          </div>
          <div className={`text-gray-600 dark:text-gray-400 ${sizeClasses.text}`}>
            {formatDate(achievement.earnedAt)}
          </div>
        </motion.div>
      )}
    </div>
  );
}