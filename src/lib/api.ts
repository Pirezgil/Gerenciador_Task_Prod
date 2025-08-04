// ============================================================================
// API CLIENT - Cliente HTTP para comunicação com o backend
// ============================================================================

import axios from 'axios';
import type { 
  Task, 
  Project, 
  Comment, 
  User, 
  UserSettings,
  Habit,
  Note 
} from '@/types';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token JWT nas requisições
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// TYPES PARA API RESPONSES
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return response.data.data;
  },
};

// ============================================================================
// TASKS API
// ============================================================================

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<ApiResponse<Task[]>>('/tasks');
    return response.data.data;
  },

  async createTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt'>): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', taskData);
    return response.data.data;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, updates);
    return response.data.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },

  async completeTask(taskId: string): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/complete`);
    return response.data.data;
  },

  async postponeTask(taskId: string, reason?: string): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/postpone`, { reason });
    return response.data.data;
  },

  async addComment(taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, comment);
    return response.data.data;
  },
};

// ============================================================================
// PROJECTS API
// ============================================================================

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<ApiResponse<Project[]>>('/projects');
    return response.data.data;
  },

  async createProject(projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const response = await api.post<ApiResponse<Project>>('/projects', projectData);
    return response.data.data;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const response = await api.put<ApiResponse<Project>>(`/projects/${projectId}`, updates);
    return response.data.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },

  async addTaskToProject(projectId: string, taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'projectId'>): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, taskData);
    return response.data.data;
  },
};

// ============================================================================
// NOTES API (Sandbox)
// ============================================================================

export const notesApi = {
  async getNotes(): Promise<Note[]> {
    const response = await api.get<ApiResponse<Note[]>>('/notes');
    return response.data.data;
  },

  async createNote(noteData: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    const response = await api.post<ApiResponse<Note>>('/notes', noteData);
    return response.data.data;
  },

  async updateNote(noteId: string, updates: Partial<Note>): Promise<Note> {
    const response = await api.put<ApiResponse<Note>>(`/notes/${noteId}`, updates);
    return response.data.data;
  },

  async deleteNote(noteId: string): Promise<void> {
    await api.delete(`/notes/${noteId}`);
  },
};

// ============================================================================
// HABITS API
// ============================================================================

export const habitsApi = {
  async getHabits(): Promise<Habit[]> {
    const response = await api.get<ApiResponse<Habit[]>>('/habits');
    return response.data.data;
  },

  async createHabit(habitData: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    const response = await api.post<ApiResponse<Habit>>('/habits', habitData);
    return response.data.data;
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    const response = await api.put<ApiResponse<Habit>>(`/habits/${habitId}`, updates);
    return response.data.data;
  },

  async deleteHabit(habitId: string): Promise<void> {
    await api.delete(`/habits/${habitId}`);
  },

  async completeHabit(habitId: string, date: string, notes?: string): Promise<void> {
    await api.post(`/habits/${habitId}/complete`, { date, notes });
  },
};

// ============================================================================
// USER API
// ============================================================================

export const userApi = {
  async updateSettings(settings: Partial<UserSettings>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/users/settings', settings);
    return response.data.data;
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/users/profile', profileData);
    return response.data.data;
  },
};

// ============================================================================
// MIGRATION API (Temporária)
// ============================================================================

export const migrationApi = {
  async migrateFromLocalStorage(localStorageData: any): Promise<{ success: boolean; message: string }> {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>('/migration/from-localstorage', {
      data: localStorageData
    });
    return response.data.data;
  },
};

export default api;