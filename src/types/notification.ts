// ============================================================================
// NOTIFICATION TYPES - Sistema tipado de notificações
// ============================================================================

/**
 * Configurações para notificações individuais
 */
export interface NotificationOptions {
  /** Duração em milissegundos (0 = permanente) */
  duration?: number;
  /** Descrição adicional/subtítulo da notificação */
  description?: string;
  /** Ação interativa disponível na notificação */
  action?: NotificationAction;
  /** Se pode ser dispensada pelo usuário */
  dismissible?: boolean;
  /** Se é uma notificação importante que deve se destacar */
  important?: boolean;
  /** Se não deve tocar som ou vibração */
  silent?: boolean;
  /** Contexto da aplicação onde foi gerada */
  context?: NotificationContext;
  /** ID único para evitar duplicatas */
  id?: string;
  /** Se deve ser lembrada no histórico */
  persistent?: boolean;
}

/**
 * Ação interativa em uma notificação
 */
export interface NotificationAction {
  label: string;
  onClick: () => void | Promise<void>;
  style?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

/**
 * Contextos funcionais da aplicação
 */
export type NotificationContext = 
  | 'authentication'      // Login, registro, sessão
  | 'task_crud'          // CRUD de tarefas
  | 'habit_crud'         // CRUD de hábitos
  | 'project_crud'       // CRUD de projetos
  | 'reminder'           // Sistema de lembretes
  | 'energy_system'      // Sistema de energia/orçamento
  | 'connectivity'       // Problemas de rede
  | 'validation'         // Validação de formulários
  | 'celebration'        // Celebrações e conquistas
  | 'system'            // Notificações do sistema
  | 'migration'         // Migração de dados
  | 'sync'              // Sincronização
  | 'sandbox';          // Caixa de areia

/**
 * Tipos de notificação baseados em severidade e propósito
 */
export type NotificationType = 
  | 'success'            // Operação bem-sucedida
  | 'error'              // Erro que precisa atenção
  | 'warning'            // Aviso importante
  | 'info'               // Informação neutra
  | 'loading'            // Estado de carregamento
  | 'celebration';       // Celebração especial

/**
 * Códigos de erro padronizados do backend
 */
export type ErrorCode = 
  // Validação
  | 'REMINDER_VALIDATION_ERROR'
  | 'TASK_VALIDATION_ERROR' 
  | 'HABIT_VALIDATION_ERROR'
  | 'PROJECT_VALIDATION_ERROR'
  | 'USER_VALIDATION_ERROR'
  
  // Limites
  | 'REMINDER_LIMIT_ERROR'
  | 'TASK_LIMIT_ERROR'
  | 'ENERGY_LIMIT_EXCEEDED'
  
  // Não encontrado
  | 'REMINDER_NOT_FOUND'
  | 'TASK_NOT_FOUND'
  | 'HABIT_NOT_FOUND'
  | 'PROJECT_NOT_FOUND'
  | 'USER_NOT_FOUND'
  
  // Sistema
  | 'REMINDER_SCHEDULER_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  
  // Rede
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CONNECTION_LOST'
  
  // Autenticação
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN'
  | 'INVALID_CREDENTIALS'
  
  // Genéricos
  | 'UNKNOWN_ERROR'
  | 'OPERATION_FAILED';

/**
 * Configurações específicas para celebrações
 */
export interface CelebrationOptions extends Omit<NotificationOptions, 'context'> {
  context: 'celebration';
  /** Tipo de celebração para animações personalizadas */
  celebrationType?: 'task_completion' | 'habit_streak' | 'project_completion' | 'energy_goal' | 'achievement';
  /** Intensidade da celebração */
  intensity?: 'subtle' | 'normal' | 'intense' | 'epic';
  /** Sons específicos para celebrações */
  sound?: boolean;
  /** Confetes ou outras animações visuais */
  visualEffects?: boolean;
}

/**
 * Configurações de loading com feedback específico
 */
export interface LoadingOptions extends Omit<NotificationOptions, 'context' | 'duration'> {
  context?: NotificationContext;
  /** Mensagem de carregamento personalizada */
  loadingMessage?: string;
  /** Se deve mostrar progresso estimado */
  showProgress?: boolean;
  /** Callback quando operação completar */
  onComplete?: () => void;
  /** Callback quando operação falhar */
  onError?: (error: any) => void;
}

/**
 * Preferências do usuário para notificações
 */
export interface NotificationPreferences {
  /** Se notificações estão habilitadas globalmente */
  enabled: boolean;
  /** Posição das notificações na tela */
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  /** Som habilitado */
  soundEnabled: boolean;
  /** Duração padrão (0 = permanente) */
  defaultDuration: number;
  /** Máximo de notificações simultâneas */
  maxConcurrent: number;
  /** Contextos desabilitados */
  disabledContexts: NotificationContext[];
  /** Se celebrações são habilitadas */
  celebrationsEnabled: boolean;
  /** Se animações são habilitadas */
  animationsEnabled: boolean;
  /** Tema das notificações */
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Entrada no histórico de notificações
 */
export interface NotificationHistoryEntry {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  context: NotificationContext;
  timestamp: string;
  read: boolean;
  persistent: boolean;
}

/**
 * Estado interno do sistema de notificações
 */
export interface NotificationState {
  /** Notificações ativas atualmente */
  active: Map<string, {
    id: string;
    type: NotificationType;
    title: string;
    options: NotificationOptions;
    timestamp: string;
  }>;
  /** Histórico de notificações persistentes */
  history: NotificationHistoryEntry[];
  /** Preferências do usuário */
  preferences: NotificationPreferences;
  /** Se o sistema está pausado */
  paused: boolean;
  /** Contextos temporariamente silenciados */
  mutedContexts: Set<NotificationContext>;
}

/**
 * Interface principal do hook useNotification
 */
export interface UseNotificationReturn {
  // Métodos principais
  success: (title: string, options?: NotificationOptions) => string;
  error: (title: string, options?: NotificationOptions) => string;
  warning: (title: string, options?: NotificationOptions) => string;
  info: (title: string, options?: NotificationOptions) => string;
  loading: (title: string, options?: LoadingOptions) => string;
  celebrate: (title: string, options?: CelebrationOptions) => string;
  
  // Controle avançado
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, updates: Partial<NotificationOptions & { title?: string }>) => void;
  
  // Estado e configuração
  preferences: NotificationPreferences;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  
  // Histórico
  history: NotificationHistoryEntry[];
  markAsRead: (id: string) => void;
  clearHistory: () => void;
  
  // Controle de contexto
  muteContext: (context: NotificationContext, duration?: number) => void;
  unmuteContext: (context: NotificationContext) => void;
  
  // Utilitários
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

/**
 * Configuração para mapeamento automático de erro
 */
export interface ErrorMapping {
  code: ErrorCode;
  getMessage: (error?: any) => string;
  getDescription?: (error?: any) => string;
  type: 'error' | 'warning';
  context: NotificationContext;
  retryable?: boolean;
}

/**
 * Evento customizado para notificações
 */
export interface NotificationEvent {
  type: 'notification_created' | 'notification_dismissed' | 'notification_clicked' | 'preferences_updated';
  payload: {
    notificationId?: string;
    notificationType?: NotificationType;
    context?: NotificationContext;
    preferences?: Partial<NotificationPreferences>;
  };
  timestamp: string;
}

export default NotificationOptions;