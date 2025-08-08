'use client';

import { motion } from 'framer-motion';
import { useHabitStreak } from '@/hooks/api/useHabitStreak';

export function HabitStreakCounter() {
  const { data: streak, isLoading, error } = useHabitStreak();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <div className="animate-pulse">
          <div className="h-4 bg-orange-200 rounded w-32 mb-3"></div>
          <div className="h-8 bg-orange-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-orange-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error || !streak) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">😴</div>
          <p className="text-sm">Dados não disponíveis</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Sequência de Hábitos</h3>
            <p className="text-sm text-gray-600">Complete todos os hábitos diariamente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <motion.div
            key={streak.currentStreak}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="relative"
          >
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {streak.currentStreak}
            </div>
            {streak.currentStreak > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 text-yellow-500"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                ✨
              </motion.div>
            )}
          </motion.div>
          <p className="text-sm text-gray-600 font-medium">Sequência Atual</p>
          {streak.currentStreak === 0 && (
            <p className="text-xs text-gray-500 mt-1">Complete todos os hábitos hoje!</p>
          )}
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {streak.bestStreak}
          </div>
          <p className="text-sm text-gray-600 font-medium">Melhor Sequência</p>
          {streak.bestStreak === 0 && (
            <p className="text-xs text-gray-500 mt-1">Seu recorde aparecerá aqui</p>
          )}
        </div>
      </div>

      {streak.currentStreak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏆</span>
            <p className="text-sm font-medium text-orange-800">
              {streak.currentStreak >= 7 && "Incrível! Uma semana inteira! 🎉"}
              {streak.currentStreak >= 3 && streak.currentStreak < 7 && "Você está pegando o ritmo! 🔥"}
            </p>
          </div>
        </motion.div>
      )}

      {streak.lastCompleted && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Última vez: {new Date(streak.lastCompleted).toLocaleDateString('pt-BR')}
        </div>
      )}
    </motion.div>
  );
}