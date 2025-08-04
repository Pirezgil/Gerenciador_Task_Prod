'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Flame, Star } from 'lucide-react';

interface HabitCompletionAnimationProps {
  show: boolean;
  habitName: string;
  streak: number;
  onComplete: () => void;
}

export function HabitCompletionAnimation({ show, habitName, streak, onComplete }: HabitCompletionAnimationProps) {
  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return { message: "Lendário!", color: "from-purple-500 to-pink-500", icon: Trophy };
    if (streak >= 14) return { message: "Impressionante!", color: "from-blue-500 to-cyan-500", icon: Star };
    if (streak >= 7) return { message: "Fantástico!", color: "from-green-500 to-emerald-500", icon: Flame };
    if (streak >= 3) return { message: "Ótimo trabalho!", color: "from-orange-500 to-yellow-500", icon: Sparkles };
    return { message: "Parabéns!", color: "from-blue-400 to-purple-400", icon: Sparkles };
  };

  const { message, color, icon: Icon } = getStreakMessage(streak);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.6 
            }}
            className="relative bg-white rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${color} text-white mb-4 shadow-lg`}
              >
                <Icon className="w-10 h-10" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                {message}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-4 font-medium"
              >
                Hábito &ldquo;{habitName}&rdquo; concluído!
              </motion.p>

              {streak > 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${color} text-white text-sm font-semibold mb-4 shadow-md`}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  {streak} dias consecutivos!
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Continuar
              </motion.button>
            </motion.div>

            {/* Partículas de celebração */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (i % 2 ? 1 : -1) * (50 + i * 20)],
                  y: [0, -50 - i * 10]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: i * 0.2
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
              />
            ))}

            {/* Círculos decorativos */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity
              }}
              className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r ${color} rounded-full opacity-20`}
            />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                delay: 1
              }}
              className={`absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-r ${color} rounded-full opacity-20`}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}