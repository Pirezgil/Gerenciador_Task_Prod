// =====================================================================// THEME STORE - Sistema completo de personalização de temas
// =====================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeConfig, ThemePreset, ColorPalette, ThemeStore } from '@/types';

// =====================================================================// CONFIGURAÇÕES PADRÃO E PRESETS
// =====================================================================
import { syncedUpdate } from '../lib/syncManager';

const defaultTheme: ThemeConfig = {
  id: 'default-light',
  name: 'Cérebro Light',
  description: 'Tema padrão claro e limpo',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  surfaceColor: '#ffffff',
  backgroundColor: '#f8fafc',
  textColor: '#1e293b',
  textSecondaryColor: '#64748b',
  borderColor: '#e2e8f0',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  mode: 'light',
  borderRadius: 'medium',
  iconSize: 'medium',
  spacing: 'normal',
  fontFamily: 'system',
  fontSize: 'medium',
  animations: true,
  glassmorphism: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultPresets: ThemePreset[] = [
  {
    id: 'default-light',
    name: 'Cérebro Light',
    description: 'Tema padrão claro e produtivo',
    preview: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    category: 'default',
    config: defaultTheme,
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Inspirado no oceano, tranquilo e refrescante',
    preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    category: 'default',
    config: {
      ...defaultTheme,
      id: 'ocean-breeze',
      name: 'Ocean Breeze',
      primaryColor: '#0ea5e9',
      secondaryColor: '#06b6d4',
      surfaceColor: '#f0f9ff',
      backgroundColor: '#e0f2fe',
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Cores quentes do pôr do sol',
    preview: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    category: 'default',
    config: {
      ...defaultTheme,
      id: 'sunset-glow',
      name: 'Sunset Glow',
      primaryColor: '#f59e0b',
      secondaryColor: '#ef4444',
      surfaceColor: '#fffbeb',
      backgroundColor: '#fef3c7',
    },
  },
  {
    id: 'forest-zen',
    name: 'Forest Zen',
    description: 'Verde natureza para concentração',
    preview: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    category: 'default',
    config: {
      ...defaultTheme,
      id: 'forest-zen',
      name: 'Forest Zen',
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      surfaceColor: '#f0fdf4',
      backgroundColor: '#dcfce7',
    },
  },
  {
    id: 'midnight-focus',
    name: 'Midnight Focus',
    description: 'Tema escuro para concentração noturna',
    preview: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    category: 'default',
    config: {
      ...defaultTheme,
      id: 'midnight-focus',
      name: 'Midnight Focus',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      surfaceColor: '#1e293b',
      backgroundColor: '#0f172a',
      textColor: '#f1f5f9',
      textSecondaryColor: '#94a3b8',
      borderColor: '#334155',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      mode: 'dark',
    },
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'Minimalista em tons de cinza',
    preview: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    category: 'default',
    config: {
      ...defaultTheme,
      id: 'minimal-mono',
      name: 'Minimal Mono',
      primaryColor: '#6b7280',
      secondaryColor: '#4b5563',
      surfaceColor: '#f9fafb',
      backgroundColor: '#f3f4f6',
      borderRadius: 'small',
      glassmorphism: false,
    },
  },
];

const colorPalettes: ColorPalette[] = [
  {
    name: 'Blue Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#0284c7',
      background: '#e0f2fe',
      surface: '#f0f9ff',
      text: '#0c4a6e',
    },
  },
  {
    name: 'Sunset Vibes',
    colors: {
      primary: '#f59e0b',
      secondary: '#ef4444',
      accent: '#dc2626',
      background: '#fef3c7',
      surface: '#fffbeb',
      text: '#92400e',
    },
  },
  {
    name: 'Nature Fresh',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#047857',
      background: '#dcfce7',
      surface: '#f0fdf4',
      text: '#064e3b',
    },
  },
  {
    name: 'Purple Dreams',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#7c3aed',
      background: '#f3e8ff',
      surface: '#faf5ff',
      text: '#581c87',
    },
  },
  {
    name: 'Rose Gold',
    colors: {
      primary: '#ec4899',
      secondary: '#f43f5e',
      accent: '#e11d48',
      background: '#fce7f3',
      surface: '#fdf2f8',
      text: '#9d174d',
    },
  },
  {
    name: 'Monochrome',
    colors: {
      primary: '#6b7280',
      secondary: '#4b5563',
      accent: '#374151',
      background: '#f3f4f6',
      surface: '#f9fafb',
      text: '#111827',
    },
  },
];

// =====================================================================// THEME STORE IMPLEMENTATION
// =====================================================================
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentTheme: defaultTheme,
      presets: defaultPresets,
      colorPalettes,
      customThemes: [],

      // =====================================================================      // CORE ACTIONS
      // =====================================================================
      updateTheme: (updates: Partial<ThemeConfig>) => {
        set((state) => {
          const updatedTheme = {
            ...state.currentTheme,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          // Aplicar tema ao documento IMEDIATAMENTE
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
          get().applyThemeToDocument(newTheme);
        }
      },

      resetToDefault: () => {
        const newTheme = {
          ...defaultTheme,
          updatedAt: new Date().toISOString(),
        };
        
        set({ currentTheme: newTheme });
        get().applyThemeToDocument(newTheme);
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
          get().applyThemeToDocument(newTheme);
          
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
          preview: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
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

      // =====================================================================      // COLOR ACTIONS
      // =====================================================================
      updatePrimaryColor: (color: string) => {
        get().updateTheme({ primaryColor: color });
      },

      updateSecondaryColor: (color: string) => {
        get().updateTheme({ secondaryColor: color });
      },

      // =====================================================================      // LAYOUT ACTIONS
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

      // =====================================================================      // TYPOGRAPHY ACTIONS
      // =====================================================================
      updateFontFamily: (family: ThemeConfig['fontFamily']) => {
        get().updateTheme({ fontFamily: family });
      },

      updateFontSize: (size: ThemeConfig['fontSize']) => {
        get().updateTheme({ fontSize: size });
      },

      // =====================================================================      // EFFECTS ACTIONS
      // =====================================================================
      toggleAnimations: () => {
        const { currentTheme } = get();
        get().updateTheme({ animations: !currentTheme.animations });
      },

      toggleGlassmorphism: () => {
        const { currentTheme } = get();
        get().updateTheme({ glassmorphism: !currentTheme.glassmorphism });
      },

      // =====================================================================      // UTILITIES
      // =====================================================================
      generateThemeId: () => {
        return `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      },

      applyThemeToDocument: (theme: ThemeConfig) => {
        if (typeof document === 'undefined' || typeof window === 'undefined') return;
        
        // ✅ PROTEÇÃO: Verificar se o DOM está pronto
        if (document.readyState === 'loading') {
          console.warn('DOM ainda carregando, adiando aplicação do tema');
          return;
        }
        
        const root = document.documentElement;
        
        // Aplicar variáveis CSS
        root.style.setProperty('--theme-primary', theme.primaryColor);
        root.style.setProperty('--theme-secondary', theme.secondaryColor);
        root.style.setProperty('--theme-surface', theme.surfaceColor);
        root.style.setProperty('--theme-background', theme.backgroundColor);
        root.style.setProperty('--theme-text', theme.textColor);
        root.style.setProperty('--theme-text-secondary', theme.textSecondaryColor);
        root.style.setProperty('--theme-border', theme.borderColor);
        root.style.setProperty('--theme-shadow', theme.shadowColor);
        
        // Aplicar radius
        const radiusMap = {
          none: '0px',
          small: '4px',
          medium: '8px',
          large: '16px',
        };
        root.style.setProperty('--theme-radius', radiusMap[theme.borderRadius]);
        
        // Aplicar espaçamento
        const spacingMap = {
          compact: '0.75rem',
          normal: '1rem',
          comfortable: '1.5rem',
        };
        root.style.setProperty('--theme-spacing', spacingMap[theme.spacing]);
        
        // Aplicar fonte
        const fontMap = {
          system: 'system-ui, -apple-system, sans-serif',
          inter: 'Inter, system-ui, sans-serif',
          lora: 'Lora, Georgia, serif',
        };
        root.style.setProperty('--theme-font', fontMap[theme.fontFamily]);
        
        // Aplicar tamanho da fonte
        const fontSizeMap = {
          small: '14px',
          medium: '16px',
          large: '18px',
        };
        root.style.setProperty('--theme-font-size', fontSizeMap[theme.fontSize]);
        
        // Aplicar classes de modo
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add('theme-' + theme.mode);
        
        // Aplicar classes de efeitos
        root.classList.toggle('theme-animations', theme.animations);
        root.classList.toggle('theme-glassmorphism', theme.glassmorphism);
      },
    }),
    {
      name: 'cerebro-theme-store',
      version: 1,
      // Aplicar tema quando carregar do storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.applyThemeToDocument(state.currentTheme);
        }
      },
    }
  )
);

// =====================================================================
// AUTO-INITIALIZATION REMOVIDA
// =====================================================================
// Tema será aplicado apenas pelo ThemeProvider após hidratação completa


