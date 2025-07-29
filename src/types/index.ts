// ============================================================================
// TYPES - Definições de tipos para o Sistema Cérebro-Compatível
// ============================================================================

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
