// ============================================================================
// ACHIEVEMENT NOTIFICATION SYSTEM - Celebração épica para TDAH
// ============================================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '@/types/achievement';
import { MEDAL_CONFIGS } from '@/types/achievement';
import { playAchievementSound } from '@/utils/achievementSounds';

// ============================================================================
// INTERFACES
// ============================================================================

interface AchievementNotificationSystemProps {
  achievements: Achievement[];
  onComplete?: (achievement: Achievement) => void;
}

interface NotificationProps {
  achievement: Achievement;
  onComplete: () => void;
}

// ============================================================================
// SISTEMA DE PARTÍCULAS EXPLOSIVAS
// ============================================================================

function ExplosiveParticles({ colors, trigger }: { colors: any; trigger: boolean }) {
  if (!trigger) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Explosão principal */}
      {[...Array(20)].map((_, i) => {
        const angle = (i * 360) / 20;
        const distance = 100 + Math.random() * 100;
        const size = 4 + Math.random() * 8;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent,
              left: '50%',
              top: '50%',
              boxShadow: `0 0 ${size * 2}px currentColor`,
            }}
            initial={{
              x: '-50%',
              y: '-50%',
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `${Math.cos(angle * Math.PI / 180) * distance - 50}%`,
              y: `${Math.sin(angle * Math.PI / 180) * distance - 50}%`,
              scale: [0, 1.5, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 2,
              ease: 'easeOut',
            }}
          />
        );
      })}
      
      {/* Ondas de choque */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute inset-0 border-4 rounded-full"
          style={{
            borderColor: colors.accent + '60',
            left: '50%',
            top: '50%',
          }}
          initial={{
            x: '-50%',
            y: '-50%',
            scale: 0,
            opacity: 0.8,
          }}
          animate={{
            scale: [0, 3],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE NOTIFICAÇÃO INDIVIDUAL
// ============================================================================

function AchievementNotification({ achievement, onComplete }: NotificationProps) {
  const [showExplosion, setShowExplosion] = useState(false);
  
  const medalConfig = getMedalConfig(achievement);
  
  // Reproduzir som de conquista usando Web Audio API
  useEffect(() => {
    const timer = setTimeout(() => {
      // Determinar raridade baseada no tipo de conquista
      const rarity = medalConfig.rarity as any;
      playAchievementSound(achievement.type, rarity, achievement.subtype);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [achievement.type, achievement.subtype, medalConfig.rarity]);
  
  // Trigger da explosão após entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowExplosion(true);
    }, 500);
    
    // Auto-remove após 6 segundos
    const autoRemove = setTimeout(onComplete, 6000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(autoRemove);
    };
  }, [onComplete]);
  
  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overlay escuro */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        {/* Container principal da notificação */}
        <motion.div
          className="relative z-10 max-w-md w-full mx-4 pointer-events-auto"
          initial={{ 
            scale: 0.3, 
            y: 100, 
            rotate: -10,
            opacity: 0 
          }}
          animate={{ 
            scale: 1, 
            y: 0, 
            rotate: 0,
            opacity: 1 
          }}
          exit={{ 
            scale: 0.8, 
            y: -100, 
            opacity: 0 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.6
          }}
          onClick={onComplete}
        >
          {/* Card principal */}
          <div 
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-center border-4 shadow-2xl overflow-hidden"
            style={{
              borderColor: medalConfig.colors.primary,
              boxShadow: `
                0 0 30px ${medalConfig.colors.primary}40,
                0 0 60px ${medalConfig.colors.secondary}20,
                inset 0 0 20px ${medalConfig.colors.accent}10
              `,
            }}
          >
            {/* Efeito de brilho de fundo animado */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at center, ${medalConfig.colors.accent}40, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-6 relative z-10"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                🎉 Nova Conquista! 🎉
              </h2>
              <div 
                className="text-sm font-medium px-4 py-1 rounded-full inline-block"
                style={{
                  backgroundColor: medalConfig.colors.primary + '20',
                  color: medalConfig.colors.primary,
                  border: `1px solid ${medalConfig.colors.primary}40`,
                }}
              >
                {getRarityLabel(medalConfig.rarity)}
              </div>
            </motion.div>
            
            {/* Medalha central com efeitos */}
            <motion.div 
              className="relative mb-6 flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.4, 
                type: "spring", 
                stiffness: 200, 
                damping: 15 
              }}
            >
              <div className="relative">
                {/* Medalha principal */}
                <motion.div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-6xl relative z-10"
                  style={{
                    background: `linear-gradient(135deg, ${medalConfig.colors.primary}, ${medalConfig.colors.secondary})`,
                    boxShadow: `
                      0 0 20px ${medalConfig.colors.primary}60,
                      0 0 40px ${medalConfig.colors.secondary}30
                    `,
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {medalConfig.emoji}
                </motion.div>
                
                {/* Sistema de partículas explosivas */}
                <ExplosiveParticles colors={medalConfig.colors} trigger={showExplosion} />
                
                {/* Raios de luz */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-16 opacity-60"
                    style={{
                      backgroundColor: medalConfig.colors.accent,
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'bottom center',
                      transform: `translateX(-50%) rotate(${i * 45}deg)`,
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ 
                      scaleY: [0, 1, 0], 
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.6 + i * 0.1,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
            
            {/* Informações da conquista */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mb-6 relative z-10"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {medalConfig.name}
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                {medalConfig.description}
              </p>
              
              {/* Metadados específicos */}
              {achievement.metadata && (
                <div className="space-y-2">
                  {achievement.metadata.energyPoints && (
                    <div 
                      className="text-sm px-3 py-1 rounded-full inline-flex items-center gap-2"
                      style={{
                        backgroundColor: '#FFD70020',
                        color: '#FFD700',
                        border: '1px solid #FFD70040',
                      }}
                    >
                      <span>⚡</span>
                      <span>{achievement.metadata.energyPoints} pontos de energia</span>
                    </div>
                  )}
                  {achievement.metadata.projectName && (
                    <div 
                      className="text-sm px-3 py-1 rounded-full inline-flex items-center gap-2 ml-2"
                      style={{
                        backgroundColor: '#4169E120',
                        color: '#4169E1',
                        border: '1px solid #4169E140',
                      }}
                    >
                      <span>🏗️</span>
                      <span>{achievement.metadata.projectName}</span>
                    </div>
                  )}
                  {achievement.metadata.tasksCompletedToday && (
                    <div 
                      className="text-sm px-3 py-1 rounded-full inline-flex items-center gap-2 ml-2"
                      style={{
                        backgroundColor: '#32CD3220',
                        color: '#32CD32',
                        border: '1px solid #32CD3240',
                      }}
                    >
                      <span>✅</span>
                      <span>{achievement.metadata.tasksCompletedToday} tarefas</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            
            {/* Footer */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-xs text-gray-400 relative z-10"
            >
              Clique para continuar...
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
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

function getRarityLabel(rarity: string) {
  switch (rarity) {
    case 'legendary': return '🌟 LENDÁRIA';
    case 'epic': return '✨ ÉPICA';
    case 'rare': return '💎 RARA';
    default: return '⭐ CONQUISTA';
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AchievementNotificationSystem({ 
  achievements, 
  onComplete 
}: AchievementNotificationSystemProps) {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(new Set());
  const [pendingToShow, setPendingToShow] = useState<Set<string>>(new Set());
  
  // Carregar conquistas já exibidas do localStorage na inicialização
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shown-achievements');
      if (stored) {
        try {
          const storedIds = JSON.parse(stored);
          setShownAchievements(new Set(storedIds));
        } catch (error) {
          console.warn('Erro ao carregar conquistas exibidas do localStorage:', error);
        }
      }
      
      // Carregar conquistas pendentes para exibição
      const pendingStored = localStorage.getItem('pending-achievements');
      if (pendingStored) {
        try {
          const pendingIds = JSON.parse(pendingStored);
          setPendingToShow(new Set(pendingIds));
        } catch (error) {
          console.warn('Erro ao carregar conquistas pendentes do localStorage:', error);
        }
      }
      
      // Limpar conquistas muito antigas do localStorage periodicamente
      const cleanupOldNotifications = () => {
        try {
          const stored = localStorage.getItem('shown-achievements');
          if (stored) {
            const storedKeys = JSON.parse(stored);
            
            // Como agora usamos chaves baseadas em tipo_relatedId_subtype,
            // vamos manter apenas as mais recentes por limite de quantidade
            // (não por tempo, já que queremos evitar reexibição permanentemente)
            if (storedKeys.length > 200) {
              const recentKeys = storedKeys.slice(-200); // Manter apenas as 200 mais recentes
              localStorage.setItem('shown-achievements', JSON.stringify(recentKeys));
            }
          }
        } catch (error) {
          console.warn('Erro na limpeza de conquistas antigas:', error);
        }
      };
      
      cleanupOldNotifications();
      
      // Função de debug disponível no console
      if (typeof window !== 'undefined') {
        (window as any).clearShownAchievements = () => {
          localStorage.removeItem('shown-achievements');
          localStorage.removeItem('pending-achievements');
          setShownAchievements(new Set());
          setPendingToShow(new Set());
          console.log('🗑️ Cache de conquistas exibidas e pendentes limpo!');
        };
        
        // Função para marcar conquista como pendente (usada quando tarefa é finalizada)
        (window as any).addPendingAchievement = (achievementId: string) => {
          const current = JSON.parse(localStorage.getItem('pending-achievements') || '[]');
          const updated = [...current, achievementId];
          localStorage.setItem('pending-achievements', JSON.stringify(updated));
          console.log('✨ Conquista marcada como pendente:', achievementId);
        };
        
        (window as any).listShownAchievements = () => {
          const stored = localStorage.getItem('shown-achievements');
          if (stored) {
            const keys = JSON.parse(stored);
            console.log('📋 Conquistas já exibidas:');
            keys.forEach((key: string, index: number) => {
              const [type, relatedId, subtype] = key.split('_');
              console.log(`${index + 1}. Tipo: ${type}, Tarefa/Projeto: ${relatedId}, Subtipo: ${subtype}`);
            });
            return keys;
          } else {
            console.log('📋 Nenhuma conquista no cache');
            return [];
          }
        };
      }
    }
  }, []);
  
  // Atualizar fila APENAS com conquistas disparadas por cliques de finalização
  useEffect(() => {
    const newAchievements = achievements.filter(achievement => {
      // Verificar se está na lista de pendentes
      let isPending = pendingToShow.has(achievement.id);
      
      // Verificar se é uma conquista criada após finalização DISPARADA POR CLIQUE
      let isTriggeredByClick = false;
      if (typeof window !== 'undefined') {
        // Verificar conquistas de tarefa
        const taskCompletionTimestamp = localStorage.getItem('task-completion-timestamp');
        const lastTaskId = localStorage.getItem('last-completed-task-id');
        const taskTriggered = localStorage.getItem('task-completion-triggered') === 'true';
        
        // Verificar conquistas de projeto
        const projectCompletionTimestamp = localStorage.getItem('project-completion-timestamp');
        const lastProjectId = localStorage.getItem('last-completed-project-id');
        const projectTriggered = localStorage.getItem('project-completion-triggered') === 'true';
        
        // Processar conquistas de tarefa
        if (taskCompletionTimestamp && lastTaskId && taskTriggered) {
          const achievementTime = new Date(achievement.earnedAt).getTime();
          const taskCompletionTime = parseInt(taskCompletionTimestamp);
          
          // Conquista criada nos últimos 10 segundos após clique
          const isWithinWindow = achievementTime > taskCompletionTime && (achievementTime - taskCompletionTime) < 10000;
          
          // Para task_completion, verificar se está relacionada à tarefa finalizada
          if (achievement.type === 'task_completion' && achievement.relatedId === lastTaskId) {
            isTriggeredByClick = isWithinWindow;
          }
          // Para outras conquistas relacionadas a tarefas, verificar apenas a janela de tempo
          else if (achievement.type !== 'task_completion' && achievement.type !== 'project_completion') {
            isTriggeredByClick = isWithinWindow;
          }
          
          // Se detectou uma conquista de tarefa, limpar timestamps
          if (isTriggeredByClick) {
            localStorage.removeItem('task-completion-timestamp');
            localStorage.removeItem('last-completed-task-id');
            localStorage.removeItem('task-completion-triggered');
          }
        }
        
        // Processar conquistas de projeto
        if (projectCompletionTimestamp && lastProjectId && projectTriggered) {
          const achievementTime = new Date(achievement.earnedAt).getTime();
          const projectCompletionTime = parseInt(projectCompletionTimestamp);
          
          // Conquista criada nos últimos 10 segundos após clique
          const isWithinWindow = achievementTime > projectCompletionTime && (achievementTime - projectCompletionTime) < 10000;
          
          // Para project_completion, verificar se está relacionada ao projeto finalizado
          if (achievement.type === 'project_completion' && achievement.relatedId === lastProjectId) {
            isTriggeredByClick = isWithinWindow;
          }
          // Para outras conquistas relacionadas a projetos (maestria diária, etc), verificar janela de tempo
          else if (achievement.type !== 'project_completion' && achievement.type !== 'task_completion') {
            isTriggeredByClick = isWithinWindow;
          }
          
          // Se detectou uma conquista de projeto, limpar timestamps
          if (isTriggeredByClick) {
            localStorage.removeItem('project-completion-timestamp');
            localStorage.removeItem('last-completed-project-id');
            localStorage.removeItem('project-completion-triggered');
          }
        }
        
        // Se detectou uma conquista (tarefa ou projeto), adicionar à lista pendente
        if (isTriggeredByClick) {
          const current = JSON.parse(localStorage.getItem('pending-achievements') || '[]');
          if (!current.includes(achievement.id)) {
            const updated = [...current, achievement.id];
            localStorage.setItem('pending-achievements', JSON.stringify(updated));
            setPendingToShow(prev => new Set([...prev, achievement.id]));
            console.log('✨ Conquista detectada após clique:', achievement.type, achievement.id);
          }
        }
      }
      
      // Criar chave única baseada no tipo, relatedId (tarefa/projeto) e subtype
      const uniqueKey = achievement.relatedId 
        ? `${achievement.type}_${achievement.relatedId}_${achievement.subtype || 'default'}`
        : `${achievement.type}_${achievement.id}_${achievement.subtype || 'default'}`;
      
      const alreadyShown = shownAchievements.has(uniqueKey);
      
      return (isPending || isTriggeredByClick) && !alreadyShown;
    });
    
    if (newAchievements.length > 0) {
      setQueue(prev => {
        // Evitar duplicatas na fila
        const existingIds = new Set(prev.map(a => a.id));
        const filteredNew = newAchievements.filter(a => !existingIds.has(a.id));
        console.log('🎬 Adicionando conquistas à fila de animação:', filteredNew.map(a => `${a.type} (${a.id})`));
        return [...prev, ...filteredNew];
      });
    }
  }, [achievements, shownAchievements, pendingToShow]);
  
  // Processar fila
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [current, queue]);
  
  const handleComplete = () => {
    if (current) {
      // Criar chave única baseada no tipo, relatedId (tarefa/projeto) e subtype
      // Isso garante que a mesma conquista para a mesma tarefa nunca apareça novamente
      const uniqueKey = current.relatedId 
        ? `${current.type}_${current.relatedId}_${current.subtype || 'default'}`
        : `${current.type}_${current.id}_${current.subtype || 'default'}`;
      
      // Marcar como exibida com a chave única
      const newShownAchievements = new Set(shownAchievements);
      newShownAchievements.add(uniqueKey);
      setShownAchievements(newShownAchievements);
      
      // Remover da lista de pendentes
      const newPendingToShow = new Set(pendingToShow);
      newPendingToShow.delete(current.id);
      setPendingToShow(newPendingToShow);
      
      // Salvar ambos no localStorage
      if (typeof window !== 'undefined') {
        const achievementKeys = Array.from(newShownAchievements);
        const recentKeys = achievementKeys.slice(-200); // Manter as 200 mais recentes
        localStorage.setItem('shown-achievements', JSON.stringify(recentKeys));
        
        const pendingKeys = Array.from(newPendingToShow);
        localStorage.setItem('pending-achievements', JSON.stringify(pendingKeys));
      }
      
      onComplete?.(current);
      setCurrent(null);
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      {current && (
        <AchievementNotification
          key={current.id}
          achievement={current}
          onComplete={handleComplete}
        />
      )}
    </AnimatePresence>
  );
}