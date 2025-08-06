export type HabitFrequencyType = 'daily' | 'weekly' | 'custom';

export interface CreateHabitRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  targetCount?: number;
  frequency: CreateHabitFrequencyRequest;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  targetCount?: number;
  isActive?: boolean;
  frequency?: UpdateHabitFrequencyRequest;
}

export interface CreateHabitFrequencyRequest {
  type: HabitFrequencyType;
  intervalDays?: number;
  daysOfWeek?: number[];
}

export interface UpdateHabitFrequencyRequest {
  type?: HabitFrequencyType;
  intervalDays?: number;
  daysOfWeek?: number[];
}

export interface HabitResponse {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  targetCount: number;
  streak: number;
  bestStreak: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  frequency?: HabitFrequencyResponse;
  completions?: HabitCompletionResponse[];
  todayCompletion?: HabitCompletionResponse;
  completionRate?: number;
}

export interface HabitFrequencyResponse {
  id: string;
  type: HabitFrequencyType;
  intervalDays: number;
  daysOfWeek: number[];
}

export interface CompleteHabitRequest {
  count?: number;
  notes?: string;
  date?: string;
}

export interface HabitCompletionResponse {
  id: string;
  date: string;
  completedAt: string;
  count: number;
  notes?: string;
}

export interface HabitStatsResponse {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  averageStreak: number;
  bestStreak: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
}