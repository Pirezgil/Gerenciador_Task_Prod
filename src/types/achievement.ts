// ============================================================================
// TIPOS DE CONQUISTAS - Frontend (Sistema de Recompensas para TDAH)
// ============================================================================

// Tipos de conquistas disponíveis
export type AchievementType = 
  | 'task_completion'    // Faísca de Conquista ⚡
  | 'project_completion' // Arquiteto de Sonhos 🏗️  
  | 'daily_master'       // Imperador da Jornada 👑
  | 'weekly_legend'      // Guardião do Tempo ⏳

// Subtipos baseados na energia das tarefas
export type TaskAchievementSubtype = 'bronze' | 'silver' | 'gold'

// Interface principal de conquista
export interface Achievement {
  id: string
  userId: string
  type: AchievementType
  subtype?: TaskAchievementSubtype
  relatedId?: string
  earnedAt: string
  metadata?: AchievementMetadata
  createdAt: string
}

// Metadados específicos para cada tipo de conquista
export interface AchievementMetadata {
  // Para task_completion
  energyPoints?: 1 | 3 | 5
  taskDescription?: string
  
  // Para project_completion  
  projectName?: string
  tasksInProject?: number
  
  // Para daily_master
  tasksCompletedToday?: number
  dateCompleted?: string
  
  // Para weekly_legend
  weekStartDate?: string
  weekEndDate?: string
  totalTasksWeek?: number
  consecutiveDays?: number
}

// Progresso diário do usuário
export interface DailyProgress {
  id: string
  userId: string
  date: string
  plannedTasks: number
  completedTasks: number
  plannedEnergyPoints: number
  completedEnergyPoints: number
  achievedMastery: boolean
  createdAt: string
  updatedAt: string
}

// Configurações visuais das medalhas
export interface MedalConfig {
  name: string
  emoji: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Mapeamento das medalhas - Design da Dra. Elara Vance
export const MEDAL_CONFIGS: Record<string, MedalConfig> = {
  // Faíscas de Conquista por nível de energia - Gradientes amarelo-ouro ao laranja vibrante
  'task_completion_bronze': {
    name: 'Faísca de Conquista Bronze',
    emoji: '⚡',
    colors: {
      primary: '#B8860B', // Ouro escuro/terroso
      secondary: '#A0522D', // Marrom saddle
      accent: '#FFD700'     // Ouro brilhante
    },
    description: 'Tarefas conquistadas com energia - Nível Bronze',
    rarity: 'common'
  },
  'task_completion_silver': {
    name: 'Faísca de Conquista Prata',
    emoji: '⚡',
    colors: {
      primary: '#C0C0C0', // Prata clássico
      secondary: '#708090', // Slate gray
      accent: '#F5F5F5'    // White smoke
    },
    description: 'Tarefas conquistadas com energia - Nível Prata',
    rarity: 'rare'
  },
  'task_completion_gold': {
    name: 'Faísca de Conquista Ouro',
    emoji: '⚡',
    colors: {
      primary: '#FFD700', // Ouro clássico
      secondary: '#FF8C00', // Dark orange
      accent: '#FFFF00'   // Amarelo puro
    },
    description: 'Tarefas conquistadas com energia - Nível Ouro',
    rarity: 'epic'
  },
  
  // Arquiteto de Sonhos - Gradiente azul-safira ao violeta profundo
  'project_completion': {
    name: 'Arquiteto de Sonhos',
    emoji: '🏗️',
    colors: {
      primary: '#4169E1', // Royal blue
      secondary: '#8A2BE2', // Blue violet
      accent: '#FFD700'   // Linhas de circuito dourado
    },
    description: 'Finalizou um projeto completo - Estrutura cristalina construída',
    rarity: 'epic'
  },
  
  // Imperador da Jornada - Gradiente dourado imperial ao vermelho rubi
  'daily_master': {
    name: 'Imperador da Jornada',
    emoji: '👑',
    colors: {
      primary: '#DAA520', // Goldenrod
      secondary: '#DC143C', // Crimson
      accent: '#FFD700'   // Ouro radiante
    },
    description: 'Completou todas as tarefas planejadas do dia - 24 horas dominadas',
    rarity: 'epic'
  },
  
  // Guardião do Tempo - Gradiente violeta cósmico ao dourado celestial
  'weekly_legend': {
    name: 'Guardião do Tempo',
    emoji: '⏳',
    colors: {
      primary: '#9370DB', // Medium purple (cósmico)
      secondary: '#B8860B', // Dark goldenrod (celestial)
      accent: '#F0F8FF'   // Alice blue (partículas estelares)
    },
    description: 'Dominou uma semana inteira - 7 estrelas da constelação temporal',
    rarity: 'legendary'
  }
}

// Response das conquistas do usuário
export interface UserAchievementsResponse {
  achievements: Achievement[]
  stats: {
    totalAchievements: number
    taskCompletions: number
    projectCompletions: number
    dailyMasteries: number
    weeklyLegends: number
  }
  recentAchievements: Achievement[]
}

// Dados para a página de recompensas
export interface RewardsPageData {
  user: {
    name: string
    totalAchievements: number
  }
  achievements: Achievement[]
  dailyProgress: DailyProgress[]
  stats: {
    taskCount: number
    projectCount: number
    dailyMasterCount: number
    weeklyLegendCount: number
    currentStreak: number
    bestStreak: number
  }
}

// Props para componentes de medalha
export interface MedalProps {
  achievement: Achievement
  size?: 'small' | 'medium' | 'large'
  showAnimation?: boolean
  onClick?: () => void
}

// Estado do sistema de conquistas no store
export interface AchievementStore {
  achievements: Achievement[]
  recentAchievements: Achievement[]
  dailyProgress: DailyProgress | null
  isLoading: boolean
  
  // Actions
  fetchAchievements: () => Promise<void>
  addAchievement: (achievement: Achievement) => void
  updateDailyProgress: (progress: Partial<DailyProgress>) => void
  clearAchievements: () => void
}

// Filtros para a página de recompensas
export interface AchievementFilters {
  type?: AchievementType | 'all'
  timeRange?: 'today' | 'week' | 'month' | 'all'
  sortBy?: 'date' | 'type' | 'rarity'
  sortOrder?: 'asc' | 'desc'
}