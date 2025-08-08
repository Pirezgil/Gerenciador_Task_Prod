'use client';

import { useCallback, useEffect } from 'react';

export function useHabitCelebration() {
  // Função para vibrar o dispositivo (se disponível)
  const vibrate = useCallback(() => {
    if ('navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }, []);

  // Função para tocar som de sucesso
  const playSuccessSound = useCallback(() => {
    try {
      // Criar um tom de sucesso usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sequência de notas para um som agradável
      const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * 0.15);
        const duration = 0.2;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      console.log('Web Audio API não disponível ou erro:', error);
    }
  }, []);

  // Função principal de celebração
  const celebrate = useCallback(() => {
    vibrate();
    playSuccessSound();
    
    // Disparar confetti se disponível
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [vibrate, playSuccessSound]);

  return { celebrate, vibrate, playSuccessSound };
}