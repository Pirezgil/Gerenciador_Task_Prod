// ============================================================================
// TEST SOUNDS BUTTON - Botão para testar os sons de conquista implementados
// ============================================================================

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { testAchievementSound } from '@/utils/achievementSounds';

export function TestSoundsButton() {
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const sounds = [
    { type: 'task_completion', name: 'Faísca ⚡', color: '#FFD700' },
    { type: 'project_completion', name: 'Arquiteto 🏗️', color: '#4169E1' },
    { type: 'daily_master', name: 'Imperador 👑', color: '#DAA520' },
    { type: 'weekly_legend', name: 'Guardião ⏳', color: '#9370DB' },
  ] as const;

  const handleTestSound = (type: string, name: string) => {
    setPlayingSound(type);
    testAchievementSound(type as any);
    setTimeout(() => setPlayingSound(null), 3000);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
        🎵 Testar Sons de Conquista
      </div>
      <div className="grid grid-cols-2 gap-2">
        {sounds.map(({ type, name, color }) => (
          <motion.button
            key={type}
            onClick={() => handleTestSound(type, name)}
            disabled={playingSound === type}
            className="p-2 rounded text-xs font-medium transition-all duration-300 hover:shadow-md disabled:opacity-50"
            style={{
              backgroundColor: playingSound === type ? color + '30' : color + '10',
              borderColor: color,
              color: playingSound === type ? color : '#374151',
              border: `1px solid ${color}40`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {playingSound === type ? 'Tocando...' : name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}