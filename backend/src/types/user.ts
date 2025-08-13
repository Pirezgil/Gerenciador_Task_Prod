export interface UpdateUserRequest {
  name?: string;
  avatarUrl?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  timezone?: string;
  dailyEnergyBudget?: number;
  avatarUrl?: string | null;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  settings?: UserSettingsResponse;
}

export interface UpdateUserSettingsRequest {
  dailyEnergyBudget?: number;
  theme?: 'light' | 'dark' | 'bege';
  timezone?: string;
  notifications?: boolean;
  sandboxPassword?: string;
  sandboxEnabled?: boolean;
}

export interface UserSettingsResponse {
  id: string;
  dailyEnergyBudget: number;
  theme: string;
  timezone: string;
  notifications: boolean;
  sandboxEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyEnergyLogResponse {
  id: string;
  date: string;
  budgetTotal: number;
  energyUsed: number;
  energyRemaining: number;
  tasksCompleted: number;
  createdAt: string;
}

export interface UserStatsResponse {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  postponedTasks: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalHabits: number;
  activeHabits: number;
  totalNotes: number;
  currentStreak: number;
  bestStreak: number;
  totalEnergyUsed: number;
  averageDailyEnergy: number;
  productivityScore: number;
}