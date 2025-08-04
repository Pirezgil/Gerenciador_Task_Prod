export * from './task';
export * from './habit';
import type { Attachment } from './task';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  dailyEnergyBudget: number;
  theme: 'light' | 'dark' | 'bege';
  timezone: string;
  notifications: boolean;
  sandboxPassword?: string;
  sandboxEnabled: boolean;
}

// ============================================================================
// CAIXA DE AREIA TYPES - Sistema de notas seguras movíveis
// ============================================================================

export interface SandboxAuth {
  isUnlocked: boolean;
  lastUnlockTime?: string;
  failedAttempts: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
  attachments?: Attachment[];
}

export interface MovableNote extends Note {
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  zIndex: number;
  isExpanded: boolean;
  color: string;
}

export interface SandboxLayoutState {
  notes: MovableNote[];
  selectedNoteId: string | null;
  draggedNoteId: string | null;
  gridSize: number;
  snapToGrid: boolean;
}

// ============================================================================
// DOPAMINE ANIMATION TYPES - Animação de Árvore de Conquistas
// ============================================================================

export interface DopamineAnimation {
  isActive: boolean;
  treeState: TreeGrowthState;
  lastCompletedTask?: string;
  animationQueue: DopamineEffect[];
}

export interface TreeGrowthState {
  totalLeaves: number;
  currentLeaves: number;
  treeAge: number; // 0-100 (0 = galhos secos, 100 = árvore cheia)
  lastGrowth: string; // timestamp
}

export interface DopamineEffect {
  id: string;
  type: 'leaf_growth' | 'particle_burst' | 'tree_glow' | 'celebration';
  intensity: 'subtle' | 'normal' | 'intense' | 'epic';
  duration: number; // milliseconds
  triggeredAt: string;
}

export interface LeafPosition {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  growthDelay: number;
}

// ============================================================================
// THEME TYPES - Sistema de personalização de temas
// ============================================================================

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  surfaceColor: string;
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  shadowColor: string;
  mode: 'light' | 'dark' | 'auto';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  iconSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'comfortable';
  fontFamily: 'system' | 'inter' | 'lora';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  glassmorphism: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'light' | 'dark' | 'custom';
  config: ThemeConfig;
}

export interface ColorPalette {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export interface ThemeStore {
  currentTheme: ThemeConfig;
  presets: ThemePreset[];
  colorPalettes: ColorPalette[];
  customThemes: ThemeConfig[];
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  applyPreset: (presetId: string) => void;
  resetToDefault: () => void;
  exportTheme: () => string;
  importTheme: (themeJson: string) => boolean;
  saveAsPreset: (name: string, description: string) => void;
  deleteCustomTheme: (themeId: string) => void;
  updatePrimaryColor: (color: string) => void;
  updateSecondaryColor: (color: string) => void;
  updateBorderRadius: (radius: ThemeConfig['borderRadius']) => void;
  updateIconSize: (size: ThemeConfig['iconSize']) => void;
  updateSpacing: (spacing: ThemeConfig['spacing']) => void;
  updateFontFamily: (family: ThemeConfig['fontFamily']) => void;
  updateFontSize: (size: ThemeConfig['fontSize']) => void;
  toggleAnimations: () => void;
  toggleGlassmorphism: () => void;
  generateThemeId: () => string;
  applyThemeToDocument: (theme: ThemeConfig) => void;
}

// ============================================================================
// CAPTURE SYSTEM TYPES - Sistema de captura de ideias
// ============================================================================

export interface CaptureState {
  step: 'capture' | 'triage' | 'classify' | 'schedule';
  content: string;
  selectedDate: string;
  type?: 'task' | 'project' | 'sandbox';
  classification?: 'task' | 'project';
}

export interface SandboxLayout {
  notes: MovableNote[];
  selectedNoteId: string | null;
  gridSize: number;
  showGrid: boolean;
  layoutMode: 'free' | 'grid' | 'list' | 'masonry';
  snapToGrid: boolean;
  density: 'compact' | 'normal' | 'comfortable';
}

// ============================================================================
// MODAL TYPES - Tipos para componentes de modal
// ============================================================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

// ============================================================================
// ENERGY TYPES - Tipos para sistema de energia
// ============================================================================

export type EnergyLevel = 1 | 3 | 5;

export interface EnergyBudget {
  total: number;
  used: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isComplete: boolean;
}

// ============================================================================
// TASK EDIT MODAL TYPES - Tipos para modal de edição de tarefa
// ============================================================================

export interface TaskEditModalState {
  isOpen: boolean;
  task: any | null; // Task type will be available via export * from './task'
  editData: {
    description: string;
    energyPoints: EnergyLevel;
    projectId?: string;
    comment: string;
  };
}
