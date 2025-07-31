// =====================================================================
// THEME STORE - Sistema completo de personalização de temas OTIMIZADO
// =====================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import type { ThemeConfig, ThemePreset, ColorPalette, ThemeStore } from '@/types';

// =====================================================================
// CONFIGURAÇÕES PADRÃO E PRESETS OTIMIZADOS
// =====================================================================
import { syncedUpdate } from '../lib/syncManager';

const defaultTheme: ThemeConfig = {
  id: 'sentinela-system',
  name: 'Sistema Sentinela',
  description: 'Tema padrão do Sistema Sentinela - minimalismo acolhedor',
  primaryColor: '#5B86E5',      // Azul Sereno
  secondaryColor: '#FFB36B',    // Laranja Suave
  surfaceColor: '#FFFFFF',      // Branco
  backgroundColor: '#F7F7F7',   // Branco Neve
  textColor: '#333740',         // Cinza Nanquim
  textSecondaryColor: '#64748B', // Cinza Médio
  borderColor: '#EAEAEA',       // Cinza Suave
  shadowColor: 'rgba(91, 134, 229, 0.1)', // Azul Sereno transparente
  mode: 'light',
  borderRadius: 'large',        // Cantos mais arredondados
  iconSize: 'medium',
  spacing: 'comfortable',       // Espaçamento generoso
  fontFamily: 'inter',          // Inter para legibilidade
  fontSize: 'medium',
  animations: true,
  glassmorphism: false,         // Desabilitado para simplicidade
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultPresets: ThemePreset[] = [
  {
    id: 'cerebro-light-optimized',
    name: 'Cérebro Light Pro',
    description: 'Tema padrão otimizado para máxima legibilidade',
    preview: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'cerebro-light-optimized',
      name: 'Cérebro Light Pro',
      description: 'Tema padrão otimizado para máxima legibilidade',
      primaryColor: '#5B86E5',
      secondaryColor: '#FFB36B',
      surfaceColor: '#ffffff',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      textSecondaryColor: '#475569',
      borderColor: '#e2e8f0',
      shadowColor: 'rgba(59, 130, 246, 0.1)',
      mode: 'light',
    },
  },
  {
    id: 'ocean-breeze-pro',
    name: 'Ocean Breeze Pro',
    description: 'Azul oceânico com contraste otimizado',
    preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'ocean-breeze-pro',
      name: 'Ocean Breeze Pro',
      description: 'Azul oceânico com contraste otimizado',
      primaryColor: '#5B86E5',
      secondaryColor: '#06b6d4',
      surfaceColor: '#ffffff',
      backgroundColor: '#f0f9ff',
      textColor: '#0c4a6e',
      textSecondaryColor: '#0369a1',
      textColor: '#0c4a6e',
      textSecondaryColor: '#0369a1',
      borderColor: '#bae6fd',
      shadowColor: 'rgba(14, 165, 233, 0.15)',
      mode: 'light',
    },
  },
  {
    id: 'sunset-glow-pro',
    name: 'Sunset Glow Pro',
    description: 'Laranja vibrante com excelente legibilidade',
    preview: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'sunset-glow-pro',
      name: 'Sunset Glow Pro',
      description: 'Laranja vibrante com excelente legibilidade',
      primaryColor: '#FFD76B',
      secondaryColor: '#FFB36B',
      surfaceColor: '#ffffff',
      backgroundColor: '#fffbeb',
      textColor: '#92400e',
      textSecondaryColor: '#b45309',
      textColor: '#92400e',
      textSecondaryColor: '#b45309',
      borderColor: '#fed7aa',
      shadowColor: 'rgba(245, 158, 11, 0.2)',
      mode: 'light',
    },
  },
  {
    id: 'forest-zen-pro',
    name: 'Forest Zen Pro',
    description: 'Verde natural com contraste aperfeiçoado',
    preview: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'forest-zen-pro',
      name: 'Forest Zen Pro',
      description: 'Verde natural com contraste aperfeiçoado',
      primaryColor: '#059669',
      secondaryColor: '#6DD58C',
      surfaceColor: '#ffffff',
      backgroundColor: '#f0fdf4',
      textColor: '#064e3b',
      textSecondaryColor: '#047857',
      textColor: '#064e3b',
      textSecondaryColor: '#047857',
      borderColor: '#bbf7d0',
      shadowColor: 'rgba(5, 150, 105, 0.15)',
      mode: 'light',
    },
  },
  {
    id: 'purple-dreams-pro',
    name: 'Purple Dreams Pro',
    description: 'Violeta elegante com alta legibilidade',
    preview: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'purple-dreams-pro',
      name: 'Purple Dreams Pro',
      description: 'Violeta elegante com alta legibilidade',
      primaryColor: '#FFB36B',
      secondaryColor: '#a855f7',
      surfaceColor: '#ffffff',
      backgroundColor: '#faf5ff',
      textColor: '#581c87',
      textSecondaryColor: '#7c3aed',
      textColor: '#581c87',
      textSecondaryColor: '#7c3aed',
      borderColor: '#e9d5ff',
      shadowColor: 'rgba(139, 92, 246, 0.15)',
      mode: 'light',
    },
  },
  {
    id: 'rose-gold-pro',
    name: 'Rose Gold Pro',
    description: 'Rosa dourado sofisticado e legível',
    preview: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'rose-gold-pro',
      name: 'Rose Gold Pro',
      description: 'Rosa dourado sofisticado e legível',
      primaryColor: '#ec4899',
      secondaryColor: '#f43f5e',
      surfaceColor: '#ffffff',
      backgroundColor: '#fdf2f8',
      textColor: '#9d174d',
      textSecondaryColor: '#be185d',
      textColor: '#9d174d',
      textSecondaryColor: '#be185d',
      borderColor: '#fbcfe8',
      shadowColor: 'rgba(236, 72, 153, 0.15)',
      mode: 'light',
    },
  },
  {
    id: 'midnight-focus-pro',
    name: 'Midnight Focus Pro',
    description: 'Tema escuro premium para concentração',
    preview: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    category: 'dark',
    config: {
      ...defaultTheme,
      id: 'midnight-focus-pro',
      name: 'Midnight Focus Pro',
      description: 'Tema escuro premium para concentração',
      primaryColor: '#5B86E5',
      secondaryColor: '#FFB36B',
      surfaceColor: '#1e293b',
      backgroundColor: '#0f172a',
      textColor: '#f1f5f9',
      textSecondaryColor: '#cbd5e1',
      borderColor: '#334155',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      mode: 'dark',
    },
  },
  {
    id: 'dark-ocean',
    name: 'Dark Ocean',
    description: 'Oceano noturno com tons azuis escuros',
    preview: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)',
    category: 'dark',
    config: {
      ...defaultTheme,
      id: 'dark-ocean',
      name: 'Dark Ocean',
      description: 'Oceano noturno com tons azuis escuros',
      primaryColor: '#5B86E5',
      secondaryColor: '#06b6d4',
      surfaceColor: '#164e63',
      backgroundColor: '#0c4a6e',
      textColor: '#f0f9ff',
      textSecondaryColor: '#bae6fd',
      textColor: '#f0f9ff',
      textSecondaryColor: '#bae6fd',
      borderColor: '#0369a1',
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      mode: 'dark',
    },
  },
  {
    id: 'dark-forest',
    name: 'Dark Forest',
    description: 'Floresta noturna com tons verdes escuros',
    preview: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    category: 'dark',
    config: {
      ...defaultTheme,
      id: 'dark-forest',
      name: 'Dark Forest',
      description: 'Floresta noturna com tons verdes escuros',
      primaryColor: '#6DD58C',
      secondaryColor: '#059669',
      surfaceColor: '#065f46',
      backgroundColor: '#064e3b',
      textColor: '#f0fdf4',
      textSecondaryColor: '#bbf7d0',
      textColor: '#f0fdf4',
      textSecondaryColor: '#bbf7d0',
      borderColor: '#047857',
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      mode: 'dark',
    },
  },
  {
    id: 'ember-night',
    name: 'Ember Night',
    description: 'Brasas noturnas com tons quentes escuros',
    preview: 'linear-gradient(135deg, #92400e 0%, #dc2626 100%)',
    category: 'dark',
    config: {
      ...defaultTheme,
      id: 'ember-night',
      name: 'Ember Night',
      description: 'Brasas noturnas com tons quentes escuros',
      primaryColor: '#FFD76B',
      secondaryColor: '#FFB36B',
      surfaceColor: '#b45309',
      backgroundColor: '#92400e',
      textColor: '#fffbeb',
      textSecondaryColor: '#fed7aa',
      textColor: '#fffbeb',
      textSecondaryColor: '#fed7aa',
      borderColor: '#d97706',
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      mode: 'dark',
    },
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Purple',
    description: 'Violeta cósmico para longas sessões',
    preview: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
    category: 'dark',
    config: {
      ...defaultTheme,
      id: 'cosmic-purple',
      name: 'Cosmic Purple',
      description: 'Violeta cósmico para longas sessões',
      primaryColor: '#FFB36B',
      secondaryColor: '#a855f7',
      surfaceColor: '#7c3aed',
      backgroundColor: '#581c87',
      textColor: '#faf5ff',
      textSecondaryColor: '#e9d5ff',
      textColor: '#faf5ff',
      textSecondaryColor: '#e9d5ff',
      borderColor: '#9333ea',
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      mode: 'dark',
    },
  },
  {
    id: 'minimal-contrast',
    name: 'Minimal Contrast',
    description: 'Minimalista com contraste perfeito',
    preview: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'minimal-contrast',
      name: 'Minimal Contrast',
      description: 'Minimalista com contraste perfeito',
      primaryColor: '#6b7280',
      secondaryColor: '#4b5563',
      surfaceColor: '#ffffff',
      backgroundColor: '#f9fafb',
      textColor: '#111827',
      textSecondaryColor: '#374151',
      textColor: '#111827',
      textSecondaryColor: '#374151',
      borderColor: '#d1d5db',
      shadowColor: 'rgba(107, 114, 128, 0.1)',
      mode: 'light',
      borderRadius: 'small',
      glassmorphism: false,
    },
  },
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    description: 'Máximo contraste para acessibilidade',
    preview: 'linear-gradient(135deg, #000000 0%, #374151 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'high-contrast-light',
      name: 'High Contrast Light',
      description: 'Máximo contraste para acessibilidade',
      primaryColor: '#1f2937',
      secondaryColor: '#374151',
      surfaceColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      textSecondaryColor: '#1f2937',
      textColor: '#000000',
      textSecondaryColor: '#1f2937',
      borderColor: '#6b7280',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      mode: 'light',
    },
  },
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    description: 'Máximo contraste escuro para acessibilidade',
    preview: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
    category: 'dark',
    config: {
      ...defaultTheme,
      id: 'high-contrast-dark',
      name: 'High Contrast Dark',
      description: 'Máximo contraste escuro para acessibilidade',
      primaryColor: '#ffffff',
      secondaryColor: '#f3f4f6',
      surfaceColor: '#000000',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      textSecondaryColor: '#e5e7eb',
      textColor: '#ffffff',
      textSecondaryColor: '#e5e7eb',
      borderColor: '#9ca3af',
      shadowColor: 'rgba(255, 255, 255, 0.1)',
      mode: 'dark',
    },
  },
  {
    id: 'warm-sepia',
    name: 'Warm Sepia',
    description: 'Tons sépia quentes para leitura confortável',
    preview: 'linear-gradient(135deg, #d2b48c 0%, #deb887 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'warm-sepia',
      name: 'Warm Sepia',
      description: 'Tons sépia quentes para leitura confortável',
      primaryColor: '#a0522d',
      secondaryColor: '#cd853f',
      surfaceColor: '#faf0e6',
      backgroundColor: '#fdf5e6',
      textColor: '#8b4513',
      textSecondaryColor: '#a0522d',
      textColor: '#8b4513',
      textSecondaryColor: '#a0522d',
      borderColor: '#deb887',
      shadowColor: 'rgba(160, 82, 45, 0.15)',
      mode: 'light',
    },
  },
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    description: 'Azul ártico limpo e refrescante',
    preview: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    category: 'light',
    config: {
      ...defaultTheme,
      id: 'arctic-blue',
      name: 'Arctic Blue',
      description: 'Azul ártico limpo e refrescante',
      primaryColor: '#2563eb',
      secondaryColor: '#5B86E5',
      surfaceColor: '#ffffff',
      backgroundColor: '#eff6ff',
      textColor: '#1e3a8a',
      textSecondaryColor: '#1d4ed8',
      textColor: '#1e3a8a',
      textSecondaryColor: '#1d4ed8',
      borderColor: '#bfdbfe',
      shadowColor: 'rgba(37, 99, 235, 0.1)',
      mode: 'light',
    },
  },
];

// Paletas de cores otimizadas para melhor contraste
const colorPalettes: ColorPalette[] = [
  {
    name: 'Blue Ocean Pro',
    colors: {
      primary: '#5B86E5',
      secondary: '#06b6d4',
      accent: '#0284c7',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
    },
  },
  {
    name: 'Sunset Vibes Pro',
    colors: {
      primary: '#FFD76B',
      secondary: '#FFB36B',
      accent: '#dc2626',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#92400e',
    },
  },
  {
    name: 'Nature Fresh Pro',
    colors: {
      primary: '#059669',
      secondary: '#6DD58C',
      accent: '#047857',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
    },
  },
  {
    name: 'Purple Dreams Pro',
    colors: {
      primary: '#FFB36B',
      secondary: '#a855f7',
      accent: '#7c3aed',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#581c87',
    },
  },
  {
    name: 'Rose Gold Pro',
    colors: {
      primary: '#ec4899',
      secondary: '#f43f5e',
      accent: '#e11d48',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#9d174d',
    },
  },
  {
    name: 'Monochrome Pro',
    colors: {
      primary: '#6b7280',
      secondary: '#4b5563',
      accent: '#374151',
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
    },
  },
  {
    name: 'Dark Ocean',
    colors: {
      primary: '#5B86E5',
      secondary: '#06b6d4',
      accent: '#0284c7',
      background: '#0c4a6e',
      surface: '#164e63',
      text: '#f0f9ff',
    },
  },
  {
    name: 'Dark Forest',
    colors: {
      primary: '#6DD58C',
      secondary: '#059669',
      accent: '#047857',
      background: '#064e3b',
      surface: '#065f46',
      text: '#f0fdf4',
    },
  },
];

// =====================================================================
// THEME STORE IMPLEMENTATION - OTIMIZADO
// =====================================================================
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentTheme: defaultTheme,
      presets: defaultPresets,
      colorPalettes,
      customThemes: [],

      // =====================================================================
      // CORE ACTIONS - OTIMIZADOS
      // =====================================================================
      updateTheme: (updates: Partial<ThemeConfig>) => {
        set((state) => {
          const updatedTheme = {
            ...state.currentTheme,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          // Aplicar tema ao documento IMEDIATAMENTE com melhor performance
          requestAnimationFrame(() => {
            get().applyThemeToDocument(updatedTheme);
          });
          
          return { currentTheme: updatedTheme };
        });
      },

      applyPreset: (presetId: string) => {
        const preset = get().presets.find(p => p.id === presetId);
        if (preset) {
          const newTheme = {
            ...preset.config,
            updatedAt: new Date().toISOString(),
          };
          
          set({ currentTheme: newTheme });
          
          // Aplicação mais suave do tema
          requestAnimationFrame(() => {
            get().applyThemeToDocument(newTheme);
          });
        }
      },

      resetToDefault: () => {
        const newTheme = {
          ...defaultTheme,
          updatedAt: new Date().toISOString(),
        };
        
        set({ currentTheme: newTheme });
        requestAnimationFrame(() => {
          get().applyThemeToDocument(newTheme);
        });
      },

      exportTheme: () => {
        const { currentTheme } = get();
        return JSON.stringify(currentTheme, null, 2);
      },

      importTheme: (themeJson: string) => {
        try {
          const importedTheme = JSON.parse(themeJson) as ThemeConfig;
          
          // Validar propriedades essenciais
          const requiredProps = ['name', 'primaryColor', 'secondaryColor', 'mode'];
          const hasRequiredProps = requiredProps.every(prop => prop in importedTheme);
          
          if (!hasRequiredProps) {
            return false;
          }
          
          const newTheme = {
            ...defaultTheme,
            ...importedTheme,
            id: get().generateThemeId(),
            updatedAt: new Date().toISOString(),
          };
          
          set({ currentTheme: newTheme });
          requestAnimationFrame(() => {
            get().applyThemeToDocument(newTheme);
          });
          
          return true;
        } catch (error) {
          console.error('Erro ao importar tema:', error);
          return false;
        }
      },

      saveAsPreset: (name: string, description: string) => {
        const { currentTheme, customThemes, presets } = get();
        
        const newTheme: ThemeConfig = {
          ...currentTheme,
          id: get().generateThemeId(),
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const newPreset: ThemePreset = {
          id: newTheme.id,
          name,
          description,
          preview: `linear-gradient(135deg, ${newTheme.primaryColor} 0%, ${newTheme.secondaryColor} 100%)`,
          category: 'custom',
          config: newTheme,
        };
        
        set({
          customThemes: [...customThemes, newTheme],
          presets: [...presets, newPreset],
        });
      },

      deleteCustomTheme: (themeId: string) => {
        set((state) => ({
          customThemes: state.customThemes.filter(theme => theme.id !== themeId),
          presets: state.presets.filter(preset => preset.id !== themeId),
        }));
      },

      // =====================================================================
      // COLOR ACTIONS
      // =====================================================================
      updatePrimaryColor: (color: string) => {
        get().updateTheme({ primaryColor: color });
      },

      updateSecondaryColor: (color: string) => {
        get().updateTheme({ secondaryColor: color });
      },

      // =====================================================================
      // LAYOUT ACTIONS
      // =====================================================================
      updateBorderRadius: (radius: ThemeConfig['borderRadius']) => {
        get().updateTheme({ borderRadius: radius });
      },

      updateIconSize: (size: ThemeConfig['iconSize']) => {
        get().updateTheme({ iconSize: size });
      },

      updateSpacing: (spacing: ThemeConfig['spacing']) => {
        get().updateTheme({ spacing: spacing });
      },

      // =====================================================================
      // TYPOGRAPHY ACTIONS
      // =====================================================================
      updateFontFamily: (family: ThemeConfig['fontFamily']) => {
        get().updateTheme({ fontFamily: family });
      },

      updateFontSize: (size: ThemeConfig['fontSize']) => {
        get().updateTheme({ fontSize: size });
      },

      // =====================================================================
      // EFFECTS ACTIONS
      // =====================================================================
      toggleAnimations: () => {
        const { currentTheme } = get();
        get().updateTheme({ animations: !currentTheme.animations });
      },

      toggleGlassmorphism: () => {
        const { currentTheme } = get();
        get().updateTheme({ glassmorphism: !currentTheme.glassmorphism });
      },

      // =====================================================================
      // UTILITIES - OTIMIZADOS
      // =====================================================================
      generateThemeId: () => {
        return `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      },

      applyThemeToDocument: (theme: ThemeConfig) => {
        if (typeof document === 'undefined' || typeof window === 'undefined') return;
        
        // ✅ PROTEÇÃO OTIMIZADA: Verificar se o DOM está pronto
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            get().applyThemeToDocument(theme);
          });
          return;
        }
        
        const root = document.documentElement;
        
        try {
          // Aplicar variáveis CSS com melhor performance
          const cssVars = [
            ['--theme-primary', theme.primaryColor],
            ['--theme-secondary', theme.secondaryColor],
            ['--theme-surface', theme.surfaceColor],
            ['--theme-background', theme.backgroundColor],
            ['--theme-text', theme.textColor],
            ['--theme-text-secondary', theme.textSecondaryColor],
            ['--theme-border', theme.borderColor],
            ['--theme-shadow', theme.shadowColor],
          ];
          
          // Aplicar todas as variáveis de uma vez
          cssVars.forEach(([property, value]) => {
            root.style.setProperty(property, value);
          });
          
          // Aplicar mapeamentos otimizados
          const radiusMap = { none: '0px', small: '4px', medium: '8px', large: '16px' };
          const spacingMap = { compact: '0.75rem', normal: '1rem', comfortable: '1.5rem' };
          const fontMap = {
            system: 'system-ui, -apple-system, sans-serif',
            inter: 'Inter, system-ui, sans-serif',
            lora: 'Lora, Georgia, serif',
          };
          const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
          
          root.style.setProperty('--theme-radius', radiusMap[theme.borderRadius]);
          root.style.setProperty('--theme-spacing', spacingMap[theme.spacing]);
          root.style.setProperty('--theme-font', fontMap[theme.fontFamily]);
          root.style.setProperty('--theme-font-size', fontSizeMap[theme.fontSize]);
          
          // Aplicar classes de modo de forma otimizada
          root.classList.remove('theme-light', 'theme-dark');
          root.classList.add(`theme-${theme.mode}`);
          
          // Aplicar classes de efeitos
          root.classList.toggle('theme-animations', theme.animations);
          root.classList.toggle('theme-glassmorphism', theme.glassmorphism);
          
          // Adicionar indicador visual de mudança suave
          root.style.transition = 'all 0.3s ease-in-out';
          
        } catch (error) {
          console.error('Erro ao aplicar tema:', error);
        }
      },
    }),
    {
      name: 'cerebro-theme-store',
      version: 2, // Incrementado para forçar migração
      // Aplicar tema quando carregar do storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Aguardar um ciclo para garantir que o DOM está pronto
          setTimeout(() => {
            state.applyThemeToDocument(state.currentTheme);
          }, 100);
        }
      },
    }
  )
);

// =====================================================================
// AUTO-INITIALIZATION OTIMIZADA
// =====================================================================
// Garantir que o tema seja aplicado quando a página carregar
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const state = useThemeStore.getState();
    state.applyThemeToDocument(state.currentTheme);
  });
}
