'use client';

// ============================================================================
// ULTRA-REWARDING CELEBRATION SYSTEM
// Criado por Animato - Especialista em Animações de Recompensa
// Sistema de progresso gamificado épico que transforma cada completar
// de tarefa em uma experiência visual viciante e satisfatória
// ============================================================================

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';
import type { Task } from '@/types';

interface CelebrationState {
  isActive: boolean;
  type: 'energy_1' | 'energy_3' | 'energy_5' | 'combo' | 'perfect_day';
  intensity: 'gentle' | 'medium' | 'explosive' | 'legendary';
  task?: Task;
  comboCount: number;
  showSpecialEffect: boolean;
}

interface ParticleProps {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'sparkle' | 'star' | 'heart' | 'diamond' | 'lightning' | 'leaf';
  velocity: { x: number; y: number };
  rotation: number;
  life: number;
}

interface SoundWave {
  id: number;
  x: number;
  y: number;
  intensity: number;
}

export function UltraRewardingCelebration() {
  const { todayTasks, calculateEnergyBudget } = useTasksStore();
  const [celebration, setCelebration] = useState<CelebrationState>({
    isActive: false,
    type: 'energy_3',
    intensity: 'medium',
    comboCount: 0,
    showSpecialEffect: false
  });
  
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const [soundWaves, setSoundWaves] = useState<SoundWave[]>([]);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showComboText, setShowComboText] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const mainAnimation = useAnimation();
  const comboAnimation = useAnimation();
  const lastCompletionTime = useRef<number>(0);

  // Detectar quando uma tarefa é completada
  useEffect(() => {
    // Detectar tarefas completadas automaticamente
    const completedTasks = todayTasks.filter(task => task.status === 'done');
    const lastTask = completedTasks[completedTasks.length - 1];
      
    if (lastTask && completedTasks.length > 0) {
        detectAndTriggerCelebration(lastTask, completedTasks.length);
      }
  }, [todayTasks]);

  const detectAndTriggerCelebration = useCallback((task: Task, totalCompleted: number) => {
    const now = Date.now();
    const timeSinceLastCompletion = now - lastCompletionTime.current;
    const isCombo = timeSinceLastCompletion < 30000; // 30 segundos para combo
    
    lastCompletionTime.current = now;
    
    let type: CelebrationState['type'] = 'energy_3';
    let intensity: CelebrationState['intensity'] = 'medium';
    let comboCount = isCombo ? comboMultiplier + 1 : 1;
    
    // Determinar tipo baseado na energia da tarefa
    if (task.energyPoints === 1) {
      type = 'energy_1';
      intensity = 'gentle';
    } else if (task.energyPoints === 3) {
      type = 'energy_3';
      intensity = 'medium';
    } else if (task.energyPoints === 5) {
      type = 'energy_5';
      intensity = 'explosive';
    }
    
    // Detectar combos especiais
    if (comboCount >= 3) {
      type = 'combo';
      intensity = 'legendary';
    }
    
    // Verificar se completou o dia perfeito
    const energyBudget = calculateEnergyBudget();
    if (energyBudget.percentage >= 100 && energyBudget.used === energyBudget.total) {
      type = 'perfect_day';
      intensity = 'legendary';
    }
    
    setComboMultiplier(comboCount);
    
    triggerEpicCelebration(type, intensity, task, comboCount);
  }, [comboMultiplier, calculateEnergyBudget]);

  const triggerEpicCelebration = useCallback((
    type: CelebrationState['type'],
    intensity: CelebrationState['intensity'],
    task: Task,
    comboCount: number
  ) => {
    setCelebration({
      isActive: true,
      type,
      intensity,
      task,
      comboCount,
      showSpecialEffect: intensity === 'legendary'
    });

    // Gerar partículas épicas
    generateEpicParticles(type, intensity, comboCount);
    
    // Criar ondas sonoras visuais
    generateSoundWaves(intensity);
    
    // Iniciar sequência de animações
    startEpicAnimationSequence(type, intensity, comboCount);
    
    // Mostrar texto de combo
    if (comboCount > 1) {
      setShowComboText(true);
      setTimeout(() => setShowComboText(false), 2000);
    }
    
    // Duração baseada na intensidade
    const duration = getDurationByIntensity(intensity);
    setTimeout(() => {
      setCelebration(prev => ({ ...prev, isActive: false }));
      setParticles([]);
      setSoundWaves([]);
    }, duration);
  }, []);

  const generateEpicParticles = (
    type: CelebrationState['type'],
    intensity: CelebrationState['intensity'],
    comboCount: number
  ) => {
    const particleCount = {
      gentle: 15,
      medium: 30,
      explosive: 60,
      legendary: 100
    }[intensity];

    const colors = getColorsForType(type);
    const particleTypes = getParticleTypesForType(type);
    const newParticles: ParticleProps[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 50 + Math.random() * 100;
      const speed = 2 + Math.random() * 4;
      
      newParticles.push({
        id: i,
        x: 50 + Math.cos(angle) * (Math.random() * 30),
        y: 50 + Math.sin(angle) * (Math.random() * 30),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.5 + Math.random() * (intensity === 'legendary' ? 3 : 1.5),
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
        velocity: {
          x: Math.cos(angle) * speed * (0.5 + Math.random()),
          y: Math.sin(angle) * speed * (0.5 + Math.random())
        },
        rotation: Math.random() * 360,
        life: 1
      });
    }

    setParticles(newParticles);
  };

  const generateSoundWaves = (intensity: CelebrationState['intensity']) => {
    const waveCount = intensity === 'legendary' ? 6 : intensity === 'explosive' ? 4 : 2;
    const newWaves: SoundWave[] = [];

    for (let i = 0; i < waveCount; i++) {
      newWaves.push({
        id: i,
        x: 50,
        y: 50,
        intensity: intensity === 'legendary' ? 3 : intensity === 'explosive' ? 2 : 1
      });
    }

    setSoundWaves(newWaves);
  };

  const startEpicAnimationSequence = async (
    type: CelebrationState['type'],
    intensity: CelebrationState['intensity'],
    comboCount: number
  ) => {
    // Sequência 1: Impacto inicial
    await mainAnimation.start({
      scale: [1, intensity === 'legendary' ? 1.3 : 1.1, 1],
      rotate: [0, intensity === 'legendary' ? 5 : 2, 0],
      transition: { duration: 0.6, ease: "backOut" }
    });

    // Sequência 2: Combo especial
    if (comboCount > 1) {
      await comboAnimation.start({
        scale: [1, 1.4, 1],
        y: [0, -20, 0],
        transition: { duration: 0.8, ease: "elasticOut" }
      });
    }

    // Sequência 3: Finale épico para lendários
    if (intensity === 'legendary') {
      await mainAnimation.start({
        scale: [1, 1.5, 1.2, 1],
        rotate: [0, 10, -10, 0],
        transition: { duration: 1.2, ease: "anticipate" }
      });
    }
  };

  const getColorsForType = (type: CelebrationState['type']): string[] => {
    switch (type) {
      case 'energy_1': return ['#fbbf24', '#f59e0b', '#d97706']; // Amarelos
      case 'energy_3': return ['#3b82f6', '#1d4ed8', '#1e40af']; // Azuis
      case 'energy_5': return ['#8b5cf6', '#7c3aed', '#6d28d9']; // Roxos
      case 'combo': return ['#ef4444', '#dc2626', '#b91c1c', '#fbbf24']; // Vermelhos + dourado
      case 'perfect_day': return ['#10b981', '#059669', '#047857', '#fbbf24', '#f59e0b']; // Verdes + dourado
      default: return ['#3b82f6', '#1d4ed8'];
    }
  };

  const getParticleTypesForType = (type: CelebrationState['type']): ParticleProps['type'][] => {
    switch (type) {
      case 'energy_1': return ['sparkle', 'star'];
      case 'energy_3': return ['sparkle', 'star', 'diamond'];
      case 'energy_5': return ['lightning', 'diamond', 'star'];
      case 'combo': return ['lightning', 'diamond', 'heart'];
      case 'perfect_day': return ['leaf', 'star', 'diamond', 'heart'];
      default: return ['sparkle', 'star'];
    }
  };

  const getDurationByIntensity = (intensity: CelebrationState['intensity']) => {
    return {
      gentle: 2000,
      medium: 3500,
      explosive: 5000,
      legendary: 7000
    }[intensity];
  };

  const getParticleIcon = (type: ParticleProps['type']) => {
    switch (type) {
      case 'sparkle': return '✨';
      case 'star': return '⭐';
      case 'heart': return '💖';
      case 'diamond': return '💎';
      case 'lightning': return '⚡';
      case 'leaf': return '🍃';
      default: return '✨';
    }
  };

  const getCelebrationMessage = () => {
    const { type, comboCount, task } = celebration;
    
    switch (type) {
      case 'energy_1':
        return { title: "Pequeno Passo! 🌱", subtitle: "Cada ação conta!" };
      case 'energy_3':
        return { title: "Missão Concluída! 🎯", subtitle: "Mantendo o ritmo!" };
      case 'energy_5':
        return { title: "TAREFA ÉPICA! ⚡", subtitle: "Energia máxima!" };
      case 'combo':
        return { title: `COMBO ${comboCount}X! 🔥`, subtitle: "Sequência imparável!" };
      case 'perfect_day':
        return { title: "DIA PERFEITO! 👑", subtitle: "Energia completa alcançada!" };
      default:
        return { title: "Excelente! 🎉", subtitle: "Continue assim!" };
    }
  };

  if (!celebration.isActive) return null;

  const message = getCelebrationMessage();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background dinamico baseado no tipo */}
        <motion.div
          className={`absolute inset-0 ${
            celebration.type === 'perfect_day' || celebration.type === 'combo'
              ? 'bg-gradient-to-br from-yellow-500/20 via-green-500/20 to-blue-500/20'
              : celebration.type === 'energy_5'
              ? 'bg-gradient-to-br from-purple-500/15 to-pink-500/15'
              : celebration.type === 'energy_3'
              ? 'bg-gradient-to-br from-blue-500/15 to-cyan-500/15'
              : 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
          } backdrop-blur-sm`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Ondas sonoras visuais */}
        <div className="absolute inset-0" ref={canvasRef}>
          {soundWaves.map((wave, index) => (
            <motion.div
              key={wave.id}
              className="absolute border-2 border-white/30 rounded-full"
              style={{
                left: `${wave.x}%`,
                top: `${wave.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ 
                scale: [0, 3, 6], 
                opacity: [0.8, 0.4, 0] 
              }}
              transition={{ 
                duration: 2,
                delay: index * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Partículas épicas */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                fontSize: `${particle.size}rem`,
                color: particle.color,
                filter: celebration.intensity === 'legendary' ? 'drop-shadow(0 0 10px currentColor)' : 'none'
              }}
              initial={{ 
                scale: 0, 
                opacity: 1,
                rotate: particle.rotation,
                x: 0,
                y: 0
              }}
              animate={{ 
                scale: [0, 1.2, 0.8, 0],
                opacity: [0, 1, 1, 0],
                rotate: [particle.rotation, particle.rotation + 360],
                x: particle.velocity.x * 50,
                y: particle.velocity.y * 50,
              }}
              transition={{ 
                duration: celebration.intensity === 'legendary' ? 4 : 3,
                delay: particle.id * 0.02,
                ease: "easeOut"
              }}
            >
              {getParticleIcon(particle.type)}
            </motion.div>
          ))}
        </div>

        {/* Texto de combo */}
        <AnimatePresence>
          {showComboText && celebration.comboCount > 1 && (
            <motion.div
              animate={comboAnimation}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 z-60"
              initial={{ opacity: 0, scale: 0, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-yellow-300">
                <div className="text-3xl font-black text-center">
                  COMBO {celebration.comboCount}X! 🔥
                </div>
                <div className="text-sm text-center mt-1 opacity-90">
                  Sequência Imparável!
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensagem principal de celebração */}
        <motion.div
          animate={mainAnimation}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            className={`
              bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border p-8 max-w-md mx-4 text-center relative overflow-hidden
              ${celebration.intensity === 'legendary' 
                ? 'border-yellow-300/50 shadow-yellow-500/25' 
                : 'border-white/30'
              }
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
            {/* Efeito de brilho para celebrações épicas */}
            {celebration.intensity === 'legendary' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            )}

            {/* Ícone principal dinâmico */}
            <motion.div
              className={`text-6xl mb-4 ${
                celebration.intensity === 'legendary' ? 'filter drop-shadow-lg' : ''
              }`}
              animate={{
                scale: celebration.intensity === 'legendary' ? [1, 1.3, 1] : [1, 1.1, 1],
                rotate: celebration.intensity === 'legendary' ? [0, 10, -10, 0] : [0, 5, -5, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: celebration.intensity === 'legendary' ? 2 : 1,
                repeatType: "reverse"
              }}
            >
              {celebration.type === 'energy_1' && '🌱'}
              {celebration.type === 'energy_3' && '🎯'}
              {celebration.type === 'energy_5' && '⚡'}
              {celebration.type === 'combo' && '🔥'}
              {celebration.type === 'perfect_day' && '👑'}
            </motion.div>

            {/* Título principal */}
            <motion.h3
              className={`font-bold mb-3 ${
                celebration.intensity === 'legendary' 
                  ? 'text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent'
                  : celebration.intensity === 'explosive'
                  ? 'text-xl text-purple-700'
                  : celebration.intensity === 'medium'
                  ? 'text-lg text-blue-700'
                  : 'text-lg text-orange-700'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {message.title}
            </motion.h3>

            {/* Subtítulo */}
            <motion.p
              className="text-gray-700 text-sm leading-relaxed mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {message.subtitle}
            </motion.p>

            {/* Descrição da tarefa */}
            {celebration.task && (
              <motion.p
                className="text-gray-600 text-xs bg-gray-50 rounded-lg p-3 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                "{celebration.task.description}"
              </motion.p>
            )}

            {/* Barra de progresso */}
            <motion.div
              className={`rounded-full p-3 ${
                celebration.type === 'perfect_day'
                  ? 'bg-gradient-to-r from-green-100 to-yellow-100'
                  : celebration.type === 'combo'
                  ? 'bg-gradient-to-r from-red-100 to-orange-100'
                  : 'bg-gradient-to-r from-blue-100 to-cyan-100'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="flex items-center justify-center space-x-2 text-xs font-medium">
                <span>🌟</span>
                <span>
                  {celebration.type === 'perfect_day' 
                    ? 'Dia perfeito conquistado!' 
                    : 'Progresso alcançado!'
                  }
                </span>
                <span>🌟</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
