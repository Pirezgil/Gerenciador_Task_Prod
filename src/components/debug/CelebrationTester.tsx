'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AllHabitsCompleteCelebration } from '@/components/rewards/AllHabitsCompleteCelebration';

export function CelebrationTester() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakCount, setStreakCount] = useState(1);

  const triggerCelebration = () => {
    setShowCelebration(true);
  };

  const hideCelebration = () => {
    setShowCelebration(false);
  };

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border">
      <h3 className="font-bold mb-3 text-sm">🎉 Teste de Celebração</h3>
      
      <div className="space-y-2 mb-3">
        <label className="block text-xs">
          Streak Count:
          <input
            type="number"
            value={streakCount}
            onChange={(e) => setStreakCount(Number(e.target.value))}
            className="ml-2 w-16 px-1 py-0.5 border rounded text-xs"
            min="1"
          />
        </label>
      </div>

      <div className="mb-3">
        <Button
          onClick={triggerCelebration}
          className="text-xs px-3 py-2 h-auto w-full"
          size="sm"
        >
          🎯 Testar Celebração
        </Button>
      </div>

      <AllHabitsCompleteCelebration
        isVisible={showCelebration}
        onComplete={hideCelebration}
        streakCount={streakCount}
      />
    </div>
  );
}