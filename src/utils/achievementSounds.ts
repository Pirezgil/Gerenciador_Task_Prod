// ============================================================================
// ACHIEVEMENT SOUNDS - Sistema de áudio para conquistas (TDAH-friendly)
// ============================================================================

type AchievementType = 'task_completion' | 'project_completion' | 'daily_master' | 'weekly_legend';
type SoundRarity = 'common' | 'rare' | 'epic' | 'legendary';

// ============================================================================
// GERADOR DE SONS USANDO WEB AUDIO API
// ============================================================================

class AchievementSoundGenerator {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    // Inicializar AudioContext apenas quando necessário
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        console.warn('AudioContext não suportado:', error);
        this.isEnabled = false;
      }
    } else {
      this.isEnabled = false;
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Som para Faísca de Conquista - Som elétrico energético
  private createSparkSound(rarity: SoundRarity): void {
    if (!this.audioContext || !this.isEnabled) return;

    const now = this.audioContext.currentTime;
    const duration = rarity === 'epic' ? 0.8 : rarity === 'rare' ? 0.6 : 0.4;
    
    // Frequências baseadas na raridade
    const baseFreq = rarity === 'epic' ? 800 : rarity === 'rare' ? 600 : 400;
    
    // Oscillator principal (zap elétrico)
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.1);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + duration);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(this.volume, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    // Oscillator secundário para harmônicos
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + 0.1);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
    
    // Filtro para dar o efeito "elétrico"
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(8000, now + 0.1);
    filter.frequency.exponentialRampToValueAtTime(1000, now + duration);
    
    // Conectar e tocar
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(this.audioContext.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Som para Arquiteto de Sonhos - Som cristalino construtivo
  private createCrystallineSound(): void {
    if (!this.audioContext || !this.isEnabled) return;

    const now = this.audioContext.currentTime;
    const duration = 1.2;
    
    // Sequência de notas cristalinas (acorde construindo)
    const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    
    frequencies.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      const startTime = now + index * 0.2;
      const endTime = startTime + 0.8;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      // Reverb simulado
      const delay = this.audioContext!.createDelay();
      const delayGain = this.audioContext!.createGain();
      delay.delayTime.setValueAtTime(0.1, now);
      delayGain.gain.setValueAtTime(0.2, now);
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(this.audioContext!.destination);
      
      osc.start(startTime);
      osc.stop(endTime);
    });
  }

  // Som para Imperador da Jornada - Som majestoso triunfante
  private createImperialSound(): void {
    if (!this.audioContext || !this.isEnabled) return;

    const now = this.audioContext.currentTime;
    const duration = 1.5;
    
    // Fanfarra imperial - sequência de trompete
    const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    melody.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      const startTime = now + index * 0.25;
      const noteTime = 0.4;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.6, startTime + 0.05);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + noteTime * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteTime);
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.start(startTime);
      osc.stop(startTime + noteTime);
    });
    
    // Som de "cristais orbitando" - tons altos suaves
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760 + i * 100, now + 1);
        
        gain.gain.setValueAtTime(0, now + 1);
        gain.gain.linearRampToValueAtTime(this.volume * 0.1, now + 1 + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        
        osc.connect(gain);
        gain.connect(this.audioContext!.destination);
        
        osc.start(now + 1);
        osc.stop(now + 1.5);
      }
    }, 50);
  }

  // Som para Guardião do Tempo - Som cósmico épico
  private createCosmicSound(): void {
    if (!this.audioContext || !this.isEnabled) return;

    const now = this.audioContext.currentTime;
    const duration = 2.5;
    
    // Som de base cósmica - drone profundo
    const bassOsc = this.audioContext.createOscillator();
    const bassGain = this.audioContext.createGain();
    
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(55, now); // A1
    bassOsc.frequency.linearRampToValueAtTime(110, now + duration);
    
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.5);
    bassGain.gain.linearRampToValueAtTime(this.volume * 0.3, now + duration * 0.8);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    bassOsc.connect(bassGain);
    bassGain.connect(this.audioContext.destination);
    
    bassOsc.start(now);
    bassOsc.stop(now + duration);
    
    // Sons estelares - partículas fluindo
    for (let i = 0; i < 7; i++) { // 7 estrelas da semana
      const starOsc = this.audioContext.createOscillator();
      const starGain = this.audioContext.createGain();
      
      starOsc.type = 'sine';
      const freq = 880 + Math.random() * 880; // Frequências aleatórias altas
      starOsc.frequency.setValueAtTime(freq, now);
      starOsc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 1);
      
      const startTime = now + i * 0.3;
      const endTime = startTime + 1;
      
      starGain.gain.setValueAtTime(0, startTime);
      starGain.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.1);
      starGain.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      // Filtro passa-baixas para suavizar
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, startTime);
      
      starOsc.connect(starGain);
      starGain.connect(filter);
      filter.connect(this.audioContext.destination);
      
      starOsc.start(startTime);
      starOsc.stop(endTime);
    }
    
    // Efeito de "ampulheta" - som que oscila
    const hourglassOsc = this.audioContext.createOscillator();
    const hourglassGain = this.audioContext.createGain();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    
    hourglassOsc.type = 'triangle';
    hourglassOsc.frequency.setValueAtTime(440, now);
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2, now); // 2Hz oscilação
    lfoGain.gain.setValueAtTime(100, now);
    
    lfo.connect(lfoGain);
    lfoGain.connect(hourglassOsc.frequency);
    
    hourglassGain.gain.setValueAtTime(0, now + 0.5);
    hourglassGain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 1);
    hourglassGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    hourglassOsc.connect(hourglassGain);
    hourglassGain.connect(this.audioContext.destination);
    
    lfo.start(now);
    hourglassOsc.start(now + 0.5);
    lfo.stop(now + duration);
    hourglassOsc.stop(now + duration);
  }

  // Método público para tocar som de conquista
  public playAchievementSound(type: AchievementType, rarity: SoundRarity = 'common', subtype?: string) {
    if (!this.isEnabled || !this.audioContext) return;

    // Retomar contexto se estiver suspenso
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.playSound(type, rarity, subtype);
      });
    } else {
      this.playSound(type, rarity, subtype);
    }
  }

  private playSound(type: AchievementType, rarity: SoundRarity, subtype?: string) {
    switch (type) {
      case 'task_completion':
        this.createSparkSound(rarity);
        break;
      case 'project_completion':
        this.createCrystallineSound();
        break;
      case 'daily_master':
        this.createImperialSound();
        break;
      case 'weekly_legend':
        this.createCosmicSound();
        break;
      default:
        console.warn('Tipo de conquista desconhecido:', type);
    }
  }

  // Método para testar sons
  public testSound(type: AchievementType) {
    const rarityMap = {
      'task_completion': 'epic' as SoundRarity,
      'project_completion': 'epic' as SoundRarity,
      'daily_master': 'epic' as SoundRarity,
      'weekly_legend': 'legendary' as SoundRarity,
    };
    
    this.playAchievementSound(type, rarityMap[type]);
  }
}

// ============================================================================
// INSTÂNCIA GLOBAL E CONFIGURAÇÃO
// ============================================================================

const achievementSounds = new AchievementSoundGenerator();

// Configuração inicial baseada no localStorage
if (typeof window !== 'undefined') {
  const savedVolume = localStorage.getItem('achievement-sound-volume');
  const soundsEnabled = localStorage.getItem('achievement-sounds-enabled');
  
  if (savedVolume) {
    achievementSounds.setVolume(parseFloat(savedVolume));
  }
  
  if (soundsEnabled !== null) {
    achievementSounds.setEnabled(soundsEnabled === 'true');
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

export function playAchievementSound(type: AchievementType, rarity?: SoundRarity, subtype?: string) {
  const actualRarity = rarity || getRarityFromType(type, subtype);
  achievementSounds.playAchievementSound(type, actualRarity, subtype);
}

export function setAchievementSoundVolume(volume: number) {
  achievementSounds.setVolume(volume);
  if (typeof window !== 'undefined') {
    localStorage.setItem('achievement-sound-volume', volume.toString());
  }
}

export function setAchievementSoundsEnabled(enabled: boolean) {
  achievementSounds.setEnabled(enabled);
  if (typeof window !== 'undefined') {
    localStorage.setItem('achievement-sounds-enabled', enabled.toString());
  }
}

export function testAchievementSound(type: AchievementType) {
  achievementSounds.testSound(type);
}

function getRarityFromType(type: AchievementType, subtype?: string): SoundRarity {
  switch (type) {
    case 'task_completion':
      return subtype === 'gold' ? 'epic' : subtype === 'silver' ? 'rare' : 'common';
    case 'project_completion':
      return 'epic';
    case 'daily_master':
      return 'epic';
    case 'weekly_legend':
      return 'legendary';
    default:
      return 'common';
  }
}

export default achievementSounds;