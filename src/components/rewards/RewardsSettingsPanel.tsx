// ============================================================================
// REWARDS SETTINGS PANEL - Configurações de experiência sensorial para TDAH
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  setAchievementSoundVolume, 
  setAchievementSoundsEnabled, 
  testAchievementSound 
} from '@/utils/achievementSounds';

// ============================================================================
// INTERFACES
// ============================================================================

interface RewardsSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function VolumeSlider({ value, onChange, disabled = false }: VolumeSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className={`flex items-center gap-4 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-2xl">🔇</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${value * 100}%, #E5E7EB ${value * 100}%, #E5E7EB 100%)`
          }}
        />
        <div 
          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-lg transition-all duration-300"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-2xl">🔊</span>
      <div className="text-sm text-gray-600 dark:text-gray-400 w-10">
        {Math.round(value * 100)}%
      </div>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">
          {label}
        </div>
        {description && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>
      <motion.button
        className={`
          relative w-12 h-6 rounded-full p-1 transition-colors duration-300
          ${enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
        `}
        onClick={() => onChange(!enabled)}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-4 h-4 bg-white rounded-full shadow-md"
          animate={{
            x: enabled ? 24 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}

function SettingItem({ icon, title, description, children }: SettingItemProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SoundTestButtons() {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const testSounds = [
    { type: 'task_completion', name: 'Faísca', emoji: '⚡', color: '#F59E0B' },
    { type: 'project_completion', name: 'Arquiteto', emoji: '🏗️', color: '#3B82F6' },
    { type: 'daily_master', name: 'Imperador', emoji: '👑', color: '#EF4444' },
    { type: 'weekly_legend', name: 'Guardião', emoji: '⏳', color: '#8B5CF6' },
  ] as const;

  const handleTestSound = (type: string) => {
    setIsPlaying(type);
    testAchievementSound(type as any);
    setTimeout(() => setIsPlaying(null), 2000);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {testSounds.map(({ type, name, emoji, color }) => (
        <motion.button
          key={type}
          onClick={() => handleTestSound(type)}
          disabled={isPlaying === type}
          className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-center transition-all duration-300 hover:shadow-md disabled:opacity-50"
          style={{
            backgroundColor: isPlaying === type ? color + '20' : 'transparent',
            borderColor: isPlaying === type ? color : undefined,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-lg mb-1">{emoji}</div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {isPlaying === type ? 'Tocando...' : name}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RewardsSettingsPanel({ isOpen, onClose }: RewardsSettingsPanelProps) {
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.3);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSoundsEnabled = localStorage.getItem('achievement-sounds-enabled');
      const savedVolume = localStorage.getItem('achievement-sound-volume');
      const savedAnimations = localStorage.getItem('achievement-animations-enabled');
      const savedReducedMotion = localStorage.getItem('achievement-reduced-motion');

      if (savedSoundsEnabled !== null) {
        setSoundsEnabled(savedSoundsEnabled === 'true');
      }
      if (savedVolume) {
        setSoundVolume(parseFloat(savedVolume));
      }
      if (savedAnimations !== null) {
        setAnimationsEnabled(savedAnimations === 'true');
      }
      if (savedReducedMotion !== null) {
        setReducedMotion(savedReducedMotion === 'true');
      }
    }
  }, []);

  const handleSoundsToggle = (enabled: boolean) => {
    setSoundsEnabled(enabled);
    setAchievementSoundsEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('achievement-sounds-enabled', enabled.toString());
    }
  };

  const handleVolumeChange = (volume: number) => {
    setSoundVolume(volume);
    setAchievementSoundVolume(volume);
    if (typeof window !== 'undefined') {
      localStorage.setItem('achievement-sound-volume', volume.toString());
    }
  };

  const handleAnimationsToggle = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('achievement-animations-enabled', enabled.toString());
    }
  };

  const handleReducedMotionToggle = (enabled: boolean) => {
    setReducedMotion(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('achievement-reduced-motion', enabled.toString());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚙️</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Configurações de Recompensas
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Personalize sua experiência sensorial para TDAH
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Configurações de Áudio */}
              <SettingItem
                icon="🔊"
                title="Sistema de Áudio"
                description="Sons gerados dinamicamente para cada tipo de conquista usando Web Audio API"
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={soundsEnabled}
                    onChange={handleSoundsToggle}
                    label="Habilitar Sons de Conquista"
                    description="Sons únicos para cada tipo de medalha"
                  />
                  
                  <div className="pl-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Volume dos Sons
                    </div>
                    <VolumeSlider
                      value={soundVolume}
                      onChange={handleVolumeChange}
                      disabled={!soundsEnabled}
                    />
                  </div>
                </div>
              </SettingItem>

              {/* Teste de Sons */}
              {soundsEnabled && (
                <SettingItem
                  icon="🎵"
                  title="Teste de Sons"
                  description="Experimente os diferentes sons de conquista"
                >
                  <SoundTestButtons />
                </SettingItem>
              )}

              {/* Configurações Visuais */}
              <SettingItem
                icon="✨"
                title="Efeitos Visuais"
                description="Animações e partículas para estimulação visual adequada ao TDAH"
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={animationsEnabled}
                    onChange={handleAnimationsToggle}
                    label="Animações de Medalhas"
                    description="Partículas, rotações e efeitos hover"
                  />
                  
                  <ToggleSwitch
                    enabled={reducedMotion}
                    onChange={handleReducedMotionToggle}
                    label="Movimento Reduzido"
                    description="Para sensibilidade a movimento excessivo"
                  />
                </div>
              </SettingItem>

              {/* Informações sobre TDAH */}
              <SettingItem
                icon="🧠"
                title="Design para TDAH"
                description="Esta experiência foi projetada considerando as necessidades específicas do cérebro TDAH"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <div className="flex items-start gap-2">
                    <span>⚡</span>
                    <span>Gratificação imediata através de efeitos visuais instantâneos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🎵</span>
                    <span>Feedback auditivo para reforço dopaminérgico</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🎨</span>
                    <span>Cores vibrantes e contrastes para manter o interesse visual</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>⏱️</span>
                    <span>Animações com timing otimizado para não sobrecarregar</span>
                  </div>
                </div>
              </SettingItem>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Configurações salvas automaticamente
                </div>
                <button
                  onClick={onClose}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Finalizar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}