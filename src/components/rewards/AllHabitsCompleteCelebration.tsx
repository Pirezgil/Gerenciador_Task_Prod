'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Trophy, Star, Flame, Zap } from 'lucide-react';

interface AllHabitsCompleteCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  streakCount: number;
}

export function AllHabitsCompleteCelebration({ 
  isVisible, 
  onComplete, 
  streakCount 
}: AllHabitsCompleteCelebrationProps) {
  const [stage, setStage] = useState(0);
  const [confettiParticles] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      delay: Math.random() * 2
    }))
  );

  useEffect(() => {
    if (isVisible) {
      const stages = [
        () => setStage(1), // Explosão inicial
        () => setStage(2), // Fogos de artifício 
        () => setStage(3), // Mensagem de parabéns
        () => setStage(4), // Contagem de streak
        () => setStage(5), // Final épico
        () => {
          setTimeout(onComplete, 1000);
        }
      ];

      stages.forEach((stage, index) => {
        setTimeout(stage, index * 1500);
      });
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-md"
      >
        {/* Confetti Background */}
        <div className="absolute inset-0 overflow-hidden">
          {confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ 
                scale: 0, 
                rotate: 0,
                y: 100,
                opacity: 0
              }}
              animate={{ 
                scale: [0, 1, 1, 0],
                rotate: [0, particle.rotation, particle.rotation * 2],
                y: [-100, -200, -300],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: particle.delay,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </div>

        {/* Ondas de energia */}
        {stage >= 1 && (
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-4 border-yellow-400/30"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 2, 4], opacity: [1, 0.5, 0] }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: stage === 1 ? 2 : 0
                }}
              />
            ))}
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="relative text-center text-white max-w-2xl mx-auto px-8">
          
          {/* Explosão inicial */}
          {stage >= 1 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 10,
                duration: 1
              }}
              className="mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="text-8xl mb-4"
                >
                  🎯
                </motion.div>
                
                {/* Estrelas orbitando */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-3xl"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      rotate: 360,
                      x: Math.cos((i * Math.PI * 2) / 8) * 80,
                      y: Math.sin((i * Math.PI * 2) / 8) * 80,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.1
                    }}
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Fogos de artifício */}
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="flex justify-center space-x-4 text-6xl">
                {['🎆', '🎇', '✨', '🌟', '💫'].map((emoji, i) => (
                  <motion.span
                    key={i}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 360, 0],
                      y: [0, -20, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2,
                      repeat: 2
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mensagem de parabéns */}
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <motion.h1
                animate={{ 
                  textShadow: [
                    '0 0 10px #FFD700',
                    '0 0 20px #FFD700, 0 0 30px #FF6B6B',
                    '0 0 10px #FFD700'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent"
              >
                INCRÍVEL!
              </motion.h1>
              
              <motion.p
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl text-yellow-200"
              >
                Todos os hábitos concluídos! 🏆
              </motion.p>
            </motion.div>
          )}

          {/* Contador de streak */}
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl border-4 border-yellow-400">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Flame className="w-12 h-12 text-yellow-300" />
                  </motion.div>
                  
                  <div className="text-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        color: ['#FFF', '#FFD700', '#FFF']
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-5xl font-bold"
                    >
                      {streakCount}
                    </motion.div>
                    <p className="text-yellow-200 font-semibold">
                      {streakCount === 1 ? 'DIA DE STREAK!' : 'DIAS DE STREAK!'}
                    </p>
                  </div>
                  
                  <motion.div
                    animate={{ 
                      rotate: [0, -15, 15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Flame className="w-12 h-12 text-yellow-300" />
                  </motion.div>
                </div>
                
                <motion.p
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-yellow-100 text-lg"
                >
                  {streakCount >= 7 ? 'Você é uma LENDA! 👑' : 
                   streakCount >= 3 ? 'Momentum imparável! 🚀' : 
                   'Construindo disciplina! 💪'}
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Final épico */}
          {stage >= 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 150,
                damping: 8,
                duration: 1
              }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6 shadow-2xl border-4 border-yellow-400">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">MISSÃO CUMPRIDA</span>
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-2"
                >
                  🎖️
                </motion.div>
                
                <p className="text-yellow-200 font-semibold">
                  Continue assim e domine seus objetivos!
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Partículas flutuantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
                rotate: [0, 360],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              {['✨', '🌟', '⭐', '💫', '🔥'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}