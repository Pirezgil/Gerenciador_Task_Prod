// Utility para reproduzir sons de celebração usando Web Audio API
class CelebrationSounds {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API não suportado:', error);
        this.isEnabled = false;
      }
    }
  }

  private createOscillator(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.audioContext || !this.isEnabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Erro ao reproduzir som:', error);
    }
  }

  // Som de sucesso épico (acordes progressivos)
  playEpicSuccess(): void {
    const notes = [
      { freq: 261.63, delay: 0 },    // C4
      { freq: 329.63, delay: 0.1 },  // E4
      { freq: 392.00, delay: 0.2 },  // G4
      { freq: 523.25, delay: 0.3 },  // C5
      { freq: 659.25, delay: 0.4 },  // E5
      { freq: 783.99, delay: 0.5 },  // G5
      { freq: 1046.5, delay: 0.6 },  // C6
    ];

    notes.forEach(({ freq, delay }) => {
      setTimeout(() => this.createOscillator(freq, 0.8, 'triangle'), delay * 1000);
    });
  }

  // Som de fogos de artifício
  playFireworks(): void {
    const fireworkSounds = [
      () => {
        // Subida do foguete
        const startTime = this.audioContext?.currentTime || 0;
        for (let i = 0; i < 20; i++) {
          const freq = 200 + i * 20;
          setTimeout(() => this.createOscillator(freq, 0.1, 'sawtooth'), i * 10);
        }
      },
      () => {
        // Explosão
        setTimeout(() => {
          for (let i = 0; i < 10; i++) {
            const freq = 400 + Math.random() * 800;
            setTimeout(() => this.createOscillator(freq, 0.3, 'square'), i * 30);
          }
        }, 300);
      }
    ];

    fireworkSounds.forEach(sound => sound());
  }

  // Som de streak de fogo
  playStreakFire(): void {
    // Som de fogo crepitante
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const freq = 150 + Math.random() * 300;
        this.createOscillator(freq, 0.15, 'sawtooth');
      }, i * 80);
    }

    // Som de poder aumentando
    setTimeout(() => {
      const powerNotes = [220, 247, 277, 294, 330, 370, 415, 466];
      powerNotes.forEach((freq, i) => {
        setTimeout(() => this.createOscillator(freq, 0.4, 'triangle'), i * 100);
      });
    }, 500);
  }

  // Som de conquista final
  playVictoryFanfare(): void {
    // Fanfare épica
    const fanfareNotes = [
      { freq: 523.25, duration: 0.3, delay: 0 },    // C5
      { freq: 523.25, duration: 0.3, delay: 0.3 },  // C5
      { freq: 698.46, duration: 0.4, delay: 0.6 },  // F5
      { freq: 659.25, duration: 0.6, delay: 1.0 },  // E5
      { freq: 783.99, duration: 0.8, delay: 1.6 },  // G5
      { freq: 1046.5, duration: 1.2, delay: 2.4 },  // C6 (final épico)
    ];

    fanfareNotes.forEach(({ freq, duration, delay }) => {
      setTimeout(() => this.createOscillator(freq, duration, 'triangle'), delay * 1000);
    });
  }

  // Som de confetti
  playConfetti(): void {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const freq = 800 + Math.random() * 400;
        this.createOscillator(freq, 0.1, 'sine');
      }, Math.random() * 1000);
    }
  }

  // Reproduzir sequência completa de celebração
  playFullCelebration(streakCount: number): void {
    if (!this.isEnabled) return;

    // Som inicial épico
    this.playEpicSuccess();
    
    // Fogos de artifício
    setTimeout(() => this.playFireworks(), 1000);
    setTimeout(() => this.playFireworks(), 1500);
    
    // Som de streak baseado na contagem
    setTimeout(() => {
      if (streakCount >= 7) {
        this.playVictoryFanfare(); // Som épico para 7+ dias
      } else {
        this.playStreakFire(); // Som de fogo para streak menor
      }
    }, 2500);
    
    // Confetti no final
    setTimeout(() => this.playConfetti(), 3500);
    setTimeout(() => this.playConfetti(), 4000);
  }

  // Método para habilitar/desabilitar sons
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Método para ativar o contexto de áudio (necessário após interação do usuário)
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Erro ao ativar áudio:', error);
      }
    }
  }
}

// Instância singleton
export const celebrationSounds = new CelebrationSounds();

// Hook para usar os sons de celebração
export function useCelebrationSounds() {
  const playEpicCelebration = (streakCount: number) => {
    celebrationSounds.resumeAudioContext().then(() => {
      celebrationSounds.playFullCelebration(streakCount);
    });
  };

  const enableSounds = () => celebrationSounds.setEnabled(true);
  const disableSounds = () => celebrationSounds.setEnabled(false);

  return {
    playEpicCelebration,
    enableSounds,
    disableSounds,
    playFireworks: () => celebrationSounds.playFireworks(),
    playStreakFire: () => celebrationSounds.playStreakFire(),
    playVictoryFanfare: () => celebrationSounds.playVictoryFanfare()
  };
}