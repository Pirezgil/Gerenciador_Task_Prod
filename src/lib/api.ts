// ============================================================================
// API CLIENT - Cliente HTTP para comunicação com o backend
// ============================================================================

// CORREÇÃO: Declaração de tipos globais para controle de redirect
declare global {
  interface Window {
    __authRedirectInProgress?: boolean;
  }
}

import axios from 'axios';
import { notificationSystem } from '@/lib/notifications/NotificationSystem';
import type { 
  Task, 
  Project, 
  Comment, 
  User, 
  UserSettings,
  Habit,
  Note,
  Reminder,
  CreateReminderData,
  UpdateReminderData,
  ReminderFilter
} from '@/types';

import { getApiUrl } from '@/lib/apiUrl';

// Configuração base do axios
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para cookies HTTP-only
});

// Interceptor para atualizar dinamicamente a baseURL a cada requisição
api.interceptors.request.use((config) => {
  // Atualizar baseURL dinamicamente para cada requisição
  config.baseURL = getApiUrl();
  return config;
});

// CSRF Token storage (in memory only for security)
let csrfToken: string | null = null;

// Function to get CSRF token when needed
const ensureCSRFToken = async (): Promise<void> => {
  if (csrfToken) return; // Already have token
  
  try {
    // Use dedicated CSRF token endpoint that doesn't require authentication
    const response = await api.get('/csrf-token');
    // Token will be captured by response interceptor
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Token CSRF obtido via endpoint dedicado');
    }
  } catch (error) {
    // Fallback: try to get token from any authenticated endpoint
    try {
      await api.get('/auth/me');
      // Token will be captured by response interceptor
    } catch (innerError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Não foi possível obter token CSRF');
      }
    }
  }
};

// SEGURANÇA: Interceptador para cookies HTTP-only seguros + CSRF
api.interceptors.request.use(
  (config) => {
    // SEGURANÇA CRÍTICA: Usar apenas cookies HTTP-only
    // VULNERABILIDADE CORRIGIDA: Não expor tokens ao JavaScript
    config.withCredentials = true;
    
    // CSRF PROTECTION: Adicionar token CSRF para requisições de modificação
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para tratar respostas e erros - OTIMIZADO
api.interceptors.response.use(
  (response) => {
    // CSRF PROTECTION: Capturar token CSRF das respostas
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken && newCsrfToken !== csrfToken) {
      csrfToken = newCsrfToken;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 CSRF Token atualizado:', csrfToken);
      }
    }
    
    return response;
  },
  (error) => {
    // CSRF PROTECTION: Capturar token CSRF mesmo em erros
    const newCsrfToken = error.response?.headers['x-csrf-token'];
    if (newCsrfToken && newCsrfToken !== csrfToken) {
      csrfToken = newCsrfToken;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 CSRF Token atualizado (erro):', csrfToken);
      }
    }

    // Tratamento automático de erros com notificações baseado nas respostas padronizadas
    if (error.response?.status === 401) {
      const errorData = error.response.data;
      
      // Verificar se é especificamente token expirado baseado na resposta padronizada
      const isTokenExpired = errorData?.error?.code === 'AUTH_TOKEN_EXPIRED';
      
      if (typeof window !== 'undefined') {
        // CORREÇÃO: Evitar múltiplos redirects simultâneos
        const currentPath = window.location.pathname;
        
        // Se já está na página de auth, não redirecionar
        if (currentPath === '/auth' || currentPath === '/auth/callback') {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Já está na página de autenticação, ignorando 401');
          }
          return Promise.reject(error);
        }
        
        if (!window.__authRedirectInProgress) {
          window.__authRedirectInProgress = true;
          
          // SEGURANÇA: Cookie HTTP-only limpo automaticamente pelo backend
          
          // Notificação específica para token expirado vs outras falhas de autenticação
          if (isTokenExpired) {
            notificationSystem.warning('Sessão expirada', {
              description: 'Sua sessão expirou. Faça login novamente para continuar',
              context: 'authentication',
              important: true,
              action: {
                label: 'Fazer login',
                onClick: () => {
                  window.__authRedirectInProgress = false;
                  window.location.href = '/auth';
                }
              }
            });
            
            // Para token expirado, aguardar mais tempo para que usuário leia a mensagem
            setTimeout(() => {
              window.__authRedirectInProgress = false;
              window.location.href = '/auth';
            }, 2000);
          } else {
            // Para outros tipos de erro 401, redirecionar mais rapidamente
            notificationSystem.error('Acesso negado', {
              description: errorData?.error?.message || 'Credenciais inválidas',
              context: 'authentication',
              important: true
            });
            
            setTimeout(() => {
              window.__authRedirectInProgress = false;
              window.location.href = '/auth';
            }, 800);
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Redirect de autenticação já em progresso, ignorando');
          }
        }
      }
    } else if (error.response?.status === 403) {
      // Acesso negado
      notificationSystem.error('Acesso negado', {
        description: 'Você não tem permissão para realizar esta ação',
        context: 'authentication'
      });
    } else if (error.response?.status >= 500) {
      // Erro do servidor
      notificationSystem.error('Erro do servidor', {
        description: 'Tente novamente em alguns momentos',
        context: 'system'
      });
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // Timeout
      notificationSystem.warning('Operação demorou muito', {
        description: 'Verifique sua conexão e tente novamente',
        context: 'connectivity'
      });
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      // Erro de rede
      notificationSystem.error('Erro de conexão', {
        description: 'Verifique sua internet e tente novamente',
        context: 'connectivity'
      });
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

// SEGURANÇA: Resposta de autenticação sem exposição de token
interface AuthResponse {
  user: User;
  // token removido - gerenciado via cookies HTTP-only no servidor
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

  // SEGURANÇA: RefreshToken removido - cookies HTTP-only são mais seguros
  // Não há necessidade de refresh com tokens de 7 dias em cookies seguros
};

// ============================================================================
// TASKS API
// ============================================================================

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<ApiResponse<Task[]>>('/tasks');
    return response.data.data;
  },

  async getTask(taskId: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return response.data.data;
  },

  async createTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt'>): Promise<Task> {
    // CSRF PROTECTION: Garantir que temos o token antes de fazer a requisição
    await ensureCSRFToken();
    
    const response = await api.post<ApiResponse<Task>>('/tasks', taskData);
    return response.data.data;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, updates);
    return response.data.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await ensureCSRFToken();
    await api.delete(`/tasks/${taskId}`);
  },

  async completeTask(taskId: string): Promise<Task> {
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/complete`);
    return response.data.data;
  },

  async postponeTask(taskId: string, reason?: string): Promise<Task> {
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/postpone`, { reason });
    return response.data.data;
  },

  async addComment(taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, comment);
    return response.data.data;
  },

  async getEnergyBudget(): Promise<{ used: number; remaining: number; total: number; completedTasks: number }> {
    const response = await api.get<ApiResponse<{ used: number; remaining: number; total: number; completedTasks: number }>>('/tasks/energy/budget');
    return response.data.data;
  },

  async getBombeiroTasks(): Promise<{ todayTasks: Task[]; missedTasks: Task[]; completedTasks: Task[] }> {
    const response = await api.get<ApiResponse<{ todayTasks: Task[]; missedTasks: Task[]; completedTasks: Task[] }>>('/tasks/bombeiro');
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
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Project>>('/projects', projectData);
    return response.data.data;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<Project>>(`/projects/${projectId}`, updates);
    return response.data.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    await ensureCSRFToken();
    await api.delete(`/projects/${projectId}`);
  },

  async addTaskToProject(projectId: string, taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'projectId'>): Promise<Task> {
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, taskData);
    return response.data.data;
  },

  async updateProjectTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`, updates);
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
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Note>>('/notes', noteData);
    return response.data.data;
  },

  async updateNote(noteId: string, updates: Partial<Note>): Promise<Note> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<Note>>(`/notes/${noteId}`, updates);
    return response.data.data;
  },

  async deleteNote(noteId: string): Promise<void> {
    await ensureCSRFToken();
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

  async getHabit(habitId: string): Promise<Habit> {
    const response = await api.get<ApiResponse<Habit>>(`/habits/${habitId}`);
    return response.data.data;
  },

  async createHabit(habitData: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Habit>>('/habits', habitData);
    return response.data.data;
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<Habit>>(`/habits/${habitId}`, updates);
    return response.data.data;
  },

  async deleteHabit(habitId: string): Promise<void> {
    await ensureCSRFToken();
    await api.delete(`/habits/${habitId}`);
  },

  async getHabitComments(habitId: string): Promise<Comment[]> {
    const response = await api.get<ApiResponse<Comment[]>>(`/habits/${habitId}/comments`);
    return response.data.data;
  },

  async addHabitComment(habitId: string, content: string, author?: string): Promise<Comment> {
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Comment>>(`/habits/${habitId}/comments`, { content, author });
    return response.data.data;
  },

  async completeHabit(habitId: string, date: string, notes?: string): Promise<void> {
    await ensureCSRFToken();
    await api.post(`/habits/${habitId}/complete`, { date, notes });
  },
};

// ============================================================================
// USER API
// ============================================================================

export const userApi = {
  async updateSettings(settings: Partial<UserSettings>): Promise<User> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<User>>('/users/settings', settings);
    return response.data.data;
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<User>>('/users/profile', profileData);
    return response.data.data;
  },

  async uploadAvatar(avatarBase64: string): Promise<User> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<User>>('/users/profile', { 
      avatarUrl: avatarBase64 
    });
    return response.data.data;
  },
};

// ============================================================================
// MIGRATION API (Temporária)
// ============================================================================

export const migrationApi = {
  async migrateFromLocalStorage(localStorageData: any): Promise<{ success: boolean; message: string }> {
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>('/migration/from-localstorage', {
      data: localStorageData
    });
    return response.data.data;
  },
};

// ============================================================================
// REMINDERS API
// ============================================================================

export const remindersApi = {
  async getReminders(filters?: ReminderFilter): Promise<Reminder[]> {
    const params = new URLSearchParams();
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.entityId) params.append('entityId', filters.entityId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    
    const response = await api.get<ApiResponse<Reminder[]>>(`/reminders?${params.toString()}`);
    return response.data.data;
  },

  async getReminder(reminderId: string): Promise<Reminder> {
    const response = await api.get<ApiResponse<Reminder>>(`/reminders/${reminderId}`);
    return response.data.data;
  },

  async createReminder(reminderData: CreateReminderData): Promise<Reminder> {
    await ensureCSRFToken();
    const response = await api.post<ApiResponse<Reminder>>('/reminders', reminderData);
    return response.data.data;
  },

  async updateReminder(reminderId: string, updates: UpdateReminderData): Promise<Reminder> {
    await ensureCSRFToken();
    const response = await api.put<ApiResponse<Reminder>>(`/reminders/${reminderId}`, updates);
    return response.data.data;
  },

  async deleteReminder(reminderId: string): Promise<void> {
    await ensureCSRFToken();
    await api.delete(`/reminders/${reminderId}`);
  },

  async markReminderSent(reminderId: string): Promise<void> {
    await ensureCSRFToken();
    await api.post(`/reminders/${reminderId}/mark-sent`);
  }
};

export default api;