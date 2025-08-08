// ============================================================================
// TIPOS DE CONQUISTAS - Sistema de Recompensas para TDAH
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
  relatedId?: string // ID da tarefa/projeto relacionado
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

// Request para criar uma conquista
export interface CreateAchievementRequest {
  userId: string
  type: AchievementType
  subtype?: TaskAchievementSubtype
  relatedId?: string
  metadata?: AchievementMetadata
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

// Request para atualizar progresso diário
export interface UpdateDailyProgressRequest {
  userId: string
  date: string
  plannedTasks?: number
  completedTasks?: number
  plannedEnergyPoints?: number
  completedEnergyPoints?: number
  achievedMastery?: boolean
}

// Response do progresso semanal
export interface WeeklyProgressResponse {
  weekStartDate: string
  weekEndDate: string
  dailyProgress: DailyProgress[]
  totalPlannedTasks: number
  totalCompletedTasks: number
  daysWithMastery: number
  achievedWeeklyLegend: boolean
}

// Filtros para buscar conquistas
export interface AchievementFilters {
  type?: AchievementType
  subtype?: TaskAchievementSubtype
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
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