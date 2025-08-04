// ============================================================================
// TIPOS DE HÁBITO - Definições para sistema de hábitos
// ============================================================================

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  daysOfWeek?: number[]; // 0-6 (domingo a sábado) - para frequência weekly/custom
  targetCount?: number; // Para hábitos que precisam ser feitos X vezes por dia
  streak: number; // Dias seguidos
  bestStreak: number; // Melhor sequência já alcançada
  completions: HabitCompletion[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
  count: number; // Quantas vezes foi feito no dia (para hábitos com targetCount)
  notes?: string;
}

export interface HabitFrequency {
  type: 'daily' | 'weekly' | 'custom';
  interval: number; // A cada X dias/semanas
  daysOfWeek?: number[]; // Para weekly/custom
}

export interface HabitStats {
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number; // Porcentagem dos últimos 30 dias
  weeklyCompletions: number;
  monthlyCompletions: number;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'health' | 'productivity' | 'mindfulness' | 'learning' | 'social' | 'custom';
  suggestedFrequency: HabitFrequency;
  targetCount?: number;
}