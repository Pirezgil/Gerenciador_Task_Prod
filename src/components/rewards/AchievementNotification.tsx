// ============================================================================
// ACHIEVEMENT NOTIFICATION - Sistema de notificações para novas conquistas
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MedalCard } from './MedalCard';
import { useAchievementStore } from '@/stores/achievementStore';
import type { Achievement } from '@/types/achievement';

// ============================================================================
// INTERFACES
// ============================================================================

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  duration?: number;
}

interface NotificationContainerProps {
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

// ============================================================================
// COMPONENTS
// ============================================================================

function AchievementNotificationCard({ 
  achievement, 
  onClose, 
  duration = 5000 
}: AchievementNotificationProps) {
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const getMedalName = (achievement: Achievement) => {
    switch (achievement.type) {
      case 'task_completion':
        return `⚡ Faísca ${achievement.subtype?.charAt(0).toUpperCase()}${achievement.subtype?.slice(1)} Conquistada!`;
      case 'project_completion':
        return '🏗️ Arquiteto de Sonhos Desbloqueado!';
      case 'daily_master':
        return '👑 Imperador da Jornada Alcançado!';
      case 'weekly_legend':
        return '⏳ Guardião do Tempo Conquistado!';
      default:
        return '🏆 Nova Conquista Desbloqueada!';
    }
  };

  const getSubtitle = (achievement: Achievement) => {
    if (achievement.metadata?.taskDescription) {
      return `"${achievement.metadata.taskDescription}"`;
    }
    if (achievement.metadata?.projectName) {
      return `Projeto: ${achievement.metadata.projectName}`;
    }
    if (achievement.metadata?.tasksCompletedToday) {
      return `${achievement.metadata.tasksCompletedToday} tarefas dominadas hoje!`;
    }
    return 'Você está evoluindo magnificamente!';
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8, 
        x: 300,
        rotateY: -90 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        x: 0,
        rotateY: 0 
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.9, 
        x: 300,
        rotateY: 90 
      }}
      transition={{ 
        duration: 0.6, 
        ease: 'easeOut',
        type: 'spring',
        bounce: 0.3
      }}
      className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 min-w-[320px] max-w-md overflow-hidden"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg z-10"
      >
        ✕
      </button>

      {/* Content */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <MedalCard
            achievement={achievement}
            size="medium"
            showAnimation={true}
          />
        </div>
        
        <div className="flex-1 pt-2">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1"
          >
            {getMedalName(achievement)}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-600 dark:text-gray-400 mb-3"
          >
            {getSubtitle(achievement)}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
          >
            <span>🎉</span>
            <span>Continue assim, campeão!</span>
          </motion.div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
            initial={{
              x: '50%',
              y: '50%',
              scale: 0,
            }}
            animate={{
              x: `${50 + (Math.random() - 0.5) * 200}%`,
              y: `${50 + (Math.random() - 0.5) * 200}%`,
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function NotificationContainer({ position = 'top-right' }: NotificationContainerProps) {
  const { pendingNotifications, clearNotification } = useAchievementStore();
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default: // top-right
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {pendingNotifications.filter(n => !n.seen).slice(0, 3).map((notification) => (
            <AchievementNotificationCard
              key={notification.id}
              achievement={notification.achievement}
              onClose={() => clearNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// CELEBRATION OVERLAY - Para conquistas épicas/lendárias
// ============================================================================

interface CelebrationOverlayProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
}

export function CelebrationOverlay({ 
  achievement, 
  isVisible, 
  onClose 
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Celebration content */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.5,
              rotateY: -180
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotateY: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5,
              rotateY: 180
            }}
            transition={{ 
              duration: 1,
              type: 'spring',
              bounce: 0.4
            }}
            className="relative text-center"
          >
            <div className="mb-8">
              <MedalCard
                achievement={achievement}
                size="large"
                showAnimation={true}
              />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              🎉 ÉPICO! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-yellow-300 mb-8"
            >
              Você é verdadeiramente lendário!
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              onClick={onClose}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all"
            >
              Continuar a Lenda! 🚀
            </motion.button>

            {/* Epic particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 300}%`,
                    y: `${50 + (Math.random() - 0.5) * 300}%`,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}