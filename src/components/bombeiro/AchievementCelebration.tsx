'use client';

// ============================================================================
// ACHIEVEMENT CELEBRATION - Sistema de Celebração de Conquistas Avançado
// Criado por Animato - Especialista em Animações de Recompensa
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';
import type { Task } from '@/types';

interface CelebrationState {
  isActive: boolean;
  type: 'task_complete' | 'energy_milestone' | 'streak_bonus' | 'garden_growth';
  intensity: 'small' | 'medium' | 'large' | 'epic';
  task?: Task;
  message?: string;
  icon?: string;
}

interface ParticleProps {
  id: number;
  startX: number;
  startY: number;
  color: string;
  size: number;
  type: 'sparkle' | 'leaf' | 'star' | 'heart';
}

export function AchievementCelebration() {
  const { todayTasks, calculateEnergyBudget, lastCompletedTask, clearLastCompletedTask } = useTasksStore();
  const [celebration, setCelebration] = useState<CelebrationState>({
    isActive: false,
    type: 'task_complete',
    intensity: 'small'
  });
  
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const [showTree, setShowTree] = useState(false);
  const [treeGrowth, setTreeGrowth] = useState(0);
  
  const mainAnimation = useAnimation();
  const treeAnimation = useAnimation();

  const getDurationByIntensity = useCallback((intensity: CelebrationState['intensity']) => {
    return {
      small: 2000,
      medium: 3500,
      large: 5000,
      epic: 7000
    }[intensity];
  }, []);

  const generateParticles = useCallback((intensity: CelebrationState['intensity']) => {
    const particleCount = {
      small: 12,
      medium: 24,
      large: 36,
      epic: 48
    }[intensity];

    const newParticles: ParticleProps[] = [];
    const colors = ['#10b981', '#059669', '#fbbf24', '#f59e0b', '#ef4444', '#dc2626'];
    const types: ParticleProps['type'][] = ['sparkle', 'leaf', 'star', 'heart'];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        startX: 50 + (Math.random() * 40 - 20), // Centro da tela ±20%
        startY: 50 + (Math.random() * 30 - 15), // Centro ±15%
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.5 + Math.random() * 1.5,
        type: types[Math.floor(Math.random() * types.length)]
      });
    }

    setParticles(newParticles);
  }, []);

  const startCelebrationSequence = useCallback(async (intensity: CelebrationState['intensity']) => {
    // Sequência 1: Pulse inicial
    await mainAnimation.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.6, ease: "backOut" }
    });

    // Sequência 2: Mostrar árvore se intensidade média ou maior
    if (intensity !== 'small') {
      setShowTree(true);
      setTreeGrowth(prev => prev + 1);
      
      await treeAnimation.start({
        scale: [0, 1.2, 1],
        rotate: [0, 5, -5, 0],
        transition: { duration: 1, type: "tween", ease: "backOut" }
      });
    }

    // Sequência 3: Pulse final épico para conquistas máximas
    if (intensity === 'epic') {
      await mainAnimation.start({
        scale: [1, 1.3],
        transition: { duration: 0.4, ease: "anticipate" }
      });
    }
  }, [mainAnimation, treeAnimation]);

  const triggerCelebration = useCallback((
    type: CelebrationState['type'],
    intensity: CelebrationState['intensity'],
    message: string,
    icon: string
  ) => {
    setCelebration({
      isActive: true,
      type,
      intensity,
      message,
      icon
    });

    // Gerar partículas baseadas na intensidade
    generateParticles(intensity);
    
    // Iniciar sequência de animações
    startCelebrationSequence(intensity);
    
    // Auto-resetar após duração apropriada
    const duration = getDurationByIntensity(intensity);
    setTimeout(() => {
      setCelebration(prev => ({ ...prev, isActive: false }));
      setParticles([]);
      setShowTree(false);
    }, duration);
  }, [generateParticles, getDurationByIntensity, startCelebrationSequence]);

  // Detectar quando uma tarefa é completada e disparar celebração
  useEffect(() => {
    if (lastCompletedTask) {
      const completedTasks = todayTasks.filter(task => task.status === 'completed').length;
      const energyBudget = calculateEnergyBudget();
      
      // Determinar tipo e intensidade da celebração
      let type: CelebrationState['type'] = 'task_complete';
      let intensity: CelebrationState['intensity'] = 'small';
      let message = lastCompletedTask.description;
      let icon = '🎉';
      
      // Lógica de intensidade baseada em contexto
      if (energyBudget.percentage >= 100) {
        type = 'energy_milestone';
        intensity = 'epic';
        message = 'Energia do dia COMPLETA! 🔥';
        icon = '⚡';
      } else if (completedTasks % 3 === 0 && completedTasks > 0) {
        type = 'streak_bonus';
        intensity = 'large';
        message = `Sequência de ${completedTasks} tarefas! 🔥`;
        icon = '🏆';
      } else if (energyBudget.percentage >= 75) {
        intensity = 'medium';
        icon = '💪';
      }
      
      triggerCelebration(type, intensity, message, icon);
      clearLastCompletedTask(); // Limpa a tarefa para não celebrar de novo
    }
  }, [lastCompletedTask, clearLastCompletedTask, todayTasks, calculateEnergyBudget, triggerCelebration]);

  const ParticleComponent = ({ particle }: { particle: ParticleProps }) => {
    const getParticleIcon = (type: ParticleProps['type']) => {
      switch (type) {
        case 'sparkle': return '✨';
        case 'leaf': return '🍃';
        case 'star': return '⭐';
        case 'heart': return '💚';
        default: return '✨';
      }
    };

    return (
      <motion.div
        key={particle.id}
        className="absolute pointer-events-none text-lg"
        style={{
          left: `${particle.startX}%`,
          top: `${particle.startY}%`,
          fontSize: `${particle.size}rem`,
          color: particle.color,
        }}
        initial={{ 
          scale: 0, 
          opacity: 1,
          rotate: 0,
          y: 0,
          x: 0
        }}
        animate={{ 
          scale: [0, 1, 0.8, 0],
          opacity: [0, 1, 1, 0],
          rotate: [0, 180, 360],
          y: [-50, -100, -150],
          x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
        }}
        transition={{ 
          duration: 3,
          type: "tween",
          delay: particle.id * 0.05,
          ease: "easeOut"
        }}
      >
        {getParticleIcon(particle.type)}
      </motion.div>
    );
  };

  const TreeGrowthVisual = () => (
    <motion.div
      animate={treeAnimation}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div className="relative">
        {/* Tronco */}
        <motion.div
          className="w-4 h-16 bg-amber-800 rounded-t-full mx-auto"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        
        {/* Copa da árvore */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full -mt-8 mx-auto relative overflow-hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 150 }}
        >
          {/* Folhas que crescem */}
          {Array.from({ length: treeGrowth }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute w-2 h-2 bg-green-300 rounded-full"
              style={{
                top: `${20 + (index % 3) * 20}%`,
                left: `${20 + (index % 4) * 20}%`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1] }}
              transition={{ 
                delay: 0.8 + (index * 0.1),
                duration: 0.6,
                type: "spring"
              }}
            />
          ))}
          
          {/* Brilho na copa */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-transparent rounded-full"
            animate={{
              opacity: [0, 0.7, 0],
              scale: [0.8, 1.1, 0.9]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );

  if (!celebration.isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background overlay com gradiente baseado na intensidade */}
        <motion.div
          className={`absolute inset-0 ${
            celebration.intensity === 'epic' 
              ? 'bg-gradient-to-br from-yellow-500/20 via-green-500/20 to-blue-500/20'
              : celebration.intensity === 'large'
              ? 'bg-gradient-to-br from-green-500/15 to-emerald-500/15'
              : 'bg-gradient-to-br from-green-500/10 to-green-600/10'
          } backdrop-blur-sm`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Partículas */}
        <div className="absolute inset-0">
          {particles.map(particle => (
            <ParticleComponent key={particle.id} particle={particle} />
          ))}
        </div>

        {/* Árvore de crescimento */}
        <AnimatePresence>
          {showTree && <TreeGrowthVisual />}
        </AnimatePresence>

        {/* Mensagem de celebração central */}
        <motion.div
          animate={mainAnimation}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            className={`
              bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md mx-4 text-center
              ${celebration.intensity === 'epic' ? 'border-yellow-300/50 shadow-yellow-500/25' : ''}
            `}
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 15,
              delay: 0.2 
            }}
          >
            {/* Ícone principal */}
            <motion.div
              className={`text-6xl mb-4 ${
                celebration.intensity === 'epic' ? 'filter drop-shadow-lg' : ''
              }`}
              animate={{
                scale: celebration.intensity === 'epic' ? [1, 1.2, 1] : [1, 1.1, 1],
                rotate: celebration.intensity === 'epic' ? [0, 5, -5, 0] : [0, 2, -2, 0]
              }}
              transition={{
                duration: 1,
                type: "tween",
                repeat: celebration.intensity === 'epic' ? 2 : 1,
                repeatType: "reverse"
              }}
            >
              {celebration.icon}
            </motion.div>

            {/* Título da conquista */}
            <motion.h3
              className={`font-bold mb-3 ${
                celebration.intensity === 'epic' 
                  ? 'text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent'
                  : celebration.intensity === 'large'
                  ? 'text-xl text-green-700'
                  : 'text-lg text-green-600'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {celebration.type === 'energy_milestone' && 'Energia Completa!'}
              {celebration.type === 'streak_bonus' && 'Sequência Épica!'}
              {celebration.type === 'task_complete' && 'Missão Concluída!'}
              {celebration.type === 'garden_growth' && 'Jardim Floresceu!'}
            </motion.h3>

            {/* Mensagem */}
            <motion.p
              className="text-gray-700 text-sm leading-relaxed mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {celebration.message}
            </motion.p>

            {/* Barra de progresso para energia */}
            <motion.div
              className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full p-3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center justify-center space-x-2 text-xs font-medium text-green-700">
                <span>🌱</span>
                <span>Sua árvore cresceu!</span>
                <span>🌿</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}