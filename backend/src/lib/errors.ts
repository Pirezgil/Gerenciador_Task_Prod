/**
 * Sistema Unificado de Gerenciamento de Erros e Respostas Padronizadas
 * 
 * Este arquivo centraliza todo o tratamento de erros da API, fornecendo:
 * - Interfaces padronizadas para respostas
 * - Códigos de erro semânticos
 * - Mapeamento para status HTTP
 * - Factory functions para criação de respostas
 * - Classes de erro personalizadas
 * 
 * Implementado para padronizar todas as respostas da API e facilitar
 * a integração com o sistema de notificações do frontend.
 */

// ===== INTERFACES DE RESPOSTA PADRONIZADAS =====

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  meta?: Record<string, any>;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  context?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ===== CÓDIGOS DE ERRO SEMÂNTICOS =====

export enum ErrorCode {
  // Autenticação e Autorização (AUTH)
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_USER_EXISTS = 'AUTH_USER_EXISTS',
  AUTH_SOCIAL_ACCOUNT = 'AUTH_SOCIAL_ACCOUNT',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validação de Dados (VALIDATION)
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_MISSING_FIELD = 'VALIDATION_MISSING_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_CONSTRAINT_VIOLATION = 'VALIDATION_CONSTRAINT_VIOLATION',

  // Recursos Não Encontrados (NOT_FOUND)
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  HABIT_NOT_FOUND = 'HABIT_NOT_FOUND',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  NOTE_NOT_FOUND = 'NOTE_NOT_FOUND',
  REMINDER_NOT_FOUND = 'REMINDER_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Conflitos e Estados Inválidos (CONFLICT)
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  TASK_ALREADY_COMPLETED = 'TASK_ALREADY_COMPLETED',
  PROJECT_HAS_TASKS = 'PROJECT_HAS_TASKS',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',

  // Erros de Negócio (BUSINESS)
  INSUFFICIENT_ENERGY = 'INSUFFICIENT_ENERGY',
  RECURRING_TASK_REQUIRED = 'RECURRING_TASK_REQUIRED',
  HABIT_FREQUENCY_INVALID = 'HABIT_FREQUENCY_INVALID',
  PROJECT_STATUS_INVALID = 'PROJECT_STATUS_INVALID',

  // Erros de Sistema (SYSTEM)
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',

  // Erros de Notificação (NOTIFICATION)
  PUSH_SUBSCRIPTION_ERROR = 'PUSH_SUBSCRIPTION_ERROR',
  NOTIFICATION_SEND_FAILED = 'NOTIFICATION_SEND_FAILED',
  REMINDER_SCHEDULE_ERROR = 'REMINDER_SCHEDULE_ERROR',

  // Erros de Segurança (SECURITY)
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID'
}

// ===== MAPEAMENTO DE CÓDIGOS PARA MENSAGENS USER-FRIENDLY =====

export const ErrorMessages: Record<ErrorCode, string> = {
  // Autenticação e Autorização
  [ErrorCode.AUTH_REQUIRED]: 'Acesso negado. Faça login para continuar.',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Email ou senha incorretos.',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'Usuário não encontrado.',
  [ErrorCode.AUTH_USER_EXISTS]: 'Já existe um usuário cadastrado com este email.',
  [ErrorCode.AUTH_SOCIAL_ACCOUNT]: 'Esta conta foi criada com login social.',
  [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: 'Você não tem permissão para esta ação.',

  // Validação de Dados
  [ErrorCode.VALIDATION_FAILED]: 'Os dados fornecidos são inválidos.',
  [ErrorCode.VALIDATION_MISSING_FIELD]: 'Campo obrigatório não informado.',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Formato de dados inválido.',
  [ErrorCode.VALIDATION_CONSTRAINT_VIOLATION]: 'Dados violam restrições do sistema.',

  // Recursos Não Encontrados
  [ErrorCode.TASK_NOT_FOUND]: 'Tarefa não encontrada ou não pertence a você.',
  [ErrorCode.HABIT_NOT_FOUND]: 'Hábito não encontrado ou não pertence a você.',
  [ErrorCode.PROJECT_NOT_FOUND]: 'Projeto não encontrado ou não pertence a você.',
  [ErrorCode.NOTE_NOT_FOUND]: 'Nota não encontrada ou não pertence a você.',
  [ErrorCode.REMINDER_NOT_FOUND]: 'Lembrete não encontrado ou não pertence a você.',
  [ErrorCode.USER_NOT_FOUND]: 'Usuário não encontrado.',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'Recurso solicitado não existe.',

  // Conflitos e Estados Inválidos
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 'Já existe um recurso com esses dados.',
  [ErrorCode.TASK_ALREADY_COMPLETED]: 'Esta tarefa já foi completada anteriormente.',
  [ErrorCode.PROJECT_HAS_TASKS]: 'Não é possível realizar esta ação. O projeto possui tarefas vinculadas.',
  [ErrorCode.INVALID_STATE_TRANSITION]: 'Transição de estado não permitida.',

  // Erros de Negócio
  [ErrorCode.INSUFFICIENT_ENERGY]: 'Energia insuficiente para esta tarefa.',
  [ErrorCode.RECURRING_TASK_REQUIRED]: 'Esta ação requer uma tarefa recorrente.',
  [ErrorCode.HABIT_FREQUENCY_INVALID]: 'Frequência do hábito é inválida.',
  [ErrorCode.PROJECT_STATUS_INVALID]: 'Status do projeto é inválido para esta operação.',

  // Erros de Sistema
  [ErrorCode.DATABASE_ERROR]: 'Erro interno do sistema. Tente novamente.',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'Serviço temporariamente indisponível.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Muitas tentativas. Aguarde antes de tentar novamente.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Erro interno do servidor.',
  [ErrorCode.NOT_IMPLEMENTED]: 'Funcionalidade não implementada nesta versão.',

  // Erros de Notificação
  [ErrorCode.PUSH_SUBSCRIPTION_ERROR]: 'Erro ao configurar notificações push.',
  [ErrorCode.NOTIFICATION_SEND_FAILED]: 'Falha ao enviar notificação.',
  [ErrorCode.REMINDER_SCHEDULE_ERROR]: 'Erro ao agendar lembrete.',

  // Erros de Segurança
  [ErrorCode.CSRF_TOKEN_MISSING]: 'Token CSRF é obrigatório para esta operação.',
  [ErrorCode.CSRF_TOKEN_INVALID]: 'Token CSRF inválido ou expirado.'
};

// ===== MAPEAMENTO DE STATUS HTTP =====

export const HttpStatusMapping: Record<ErrorCode, number> = {
  // 401 Unauthorized
  [ErrorCode.AUTH_REQUIRED]: 401,
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: 403,

  // 404 Not Found
  [ErrorCode.AUTH_USER_NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.TASK_NOT_FOUND]: 404,
  [ErrorCode.HABIT_NOT_FOUND]: 404,
  [ErrorCode.PROJECT_NOT_FOUND]: 404,
  [ErrorCode.NOTE_NOT_FOUND]: 404,
  [ErrorCode.REMINDER_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,

  // 409 Conflict
  [ErrorCode.AUTH_USER_EXISTS]: 409,
  [ErrorCode.AUTH_SOCIAL_ACCOUNT]: 409,
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 409,

  // 400 Bad Request
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.VALIDATION_MISSING_FIELD]: 400,
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 400,
  [ErrorCode.VALIDATION_CONSTRAINT_VIOLATION]: 400,
  [ErrorCode.TASK_ALREADY_COMPLETED]: 400,
  [ErrorCode.PROJECT_HAS_TASKS]: 400,
  [ErrorCode.INVALID_STATE_TRANSITION]: 400,
  [ErrorCode.INSUFFICIENT_ENERGY]: 400,
  [ErrorCode.RECURRING_TASK_REQUIRED]: 400,
  [ErrorCode.HABIT_FREQUENCY_INVALID]: 400,
  [ErrorCode.PROJECT_STATUS_INVALID]: 400,
  [ErrorCode.PUSH_SUBSCRIPTION_ERROR]: 400,
  [ErrorCode.REMINDER_SCHEDULE_ERROR]: 400,

  // 429 Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,

  // 500 Internal Server Error
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 500,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.NOTIFICATION_SEND_FAILED]: 500,

  // 501 Not Implemented
  [ErrorCode.NOT_IMPLEMENTED]: 501,

  // 403 Forbidden (CSRF)
  [ErrorCode.CSRF_TOKEN_MISSING]: 403,
  [ErrorCode.CSRF_TOKEN_INVALID]: 403
};

// ===== FACTORY FUNCTIONS PARA CRIAR RESPOSTAS =====

/**
 * Cria uma resposta de sucesso padronizada
 */
export function createSuccessResponse<T = any>(
  data?: T, 
  message?: string, 
  meta?: Record<string, any>
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString()
  };
}

/**
 * Cria uma resposta de erro padronizada
 */
export function createErrorResponse(
  errorCode: ErrorCode,
  context?: string,
  field?: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      code: errorCode,
      message: ErrorMessages[errorCode],
      field,
      context,
      details
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Cria uma resposta de erro de validação
 */
export function createValidationErrorResponse(
  errors: ValidationError[],
  message?: string
): ApiResponse {
  return {
    success: false,
    message: message || 'Dados inválidos fornecidos',
    error: {
      code: ErrorCode.VALIDATION_FAILED,
      message: ErrorMessages[ErrorCode.VALIDATION_FAILED],
      details: errors
    },
    timestamp: new Date().toISOString()
  };
}

// ===== CUSTOM ERROR CLASS PRINCIPAL =====

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly field?: string;
  public readonly context?: string;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    message?: string,
    field?: string,
    context?: string,
    details?: any
  ) {
    super(message || ErrorMessages[code]);
    this.code = code;
    this.statusCode = HttpStatusMapping[code];
    this.field = field;
    this.context = context;
    this.details = details;
    
    // Mantém o stack trace
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converte o erro em uma resposta da API
   */
  public toApiResponse(): ApiResponse {
    return createErrorResponse(this.code, this.context, this.field, this.details);
  }
}

// ===== HELPER FUNCTIONS PARA CASOS ESPECÍFICOS =====

/**
 * Mapeia erros de string para códigos semânticos (compatibilidade)
 */
export function mapLegacyErrorMessage(errorMessage: string): ErrorCode {
  const errorMappings: Record<string, ErrorCode> = {
    'Usuário já existe com este email': ErrorCode.AUTH_USER_EXISTS,
    'Usuário já existe': ErrorCode.AUTH_USER_EXISTS,
    'Credenciais inválidas': ErrorCode.AUTH_INVALID_CREDENTIALS,
    'Usuário não encontrado': ErrorCode.AUTH_USER_NOT_FOUND,
    'Não autenticado': ErrorCode.AUTH_REQUIRED,
    'Tarefa não encontrada': ErrorCode.TASK_NOT_FOUND,
    'Hábito não encontrado': ErrorCode.HABIT_NOT_FOUND,
    'Projeto não encontrado': ErrorCode.PROJECT_NOT_FOUND,
    'Nota não encontrada': ErrorCode.NOTE_NOT_FOUND,
    'Tarefa já está completa': ErrorCode.TASK_ALREADY_COMPLETED,
    'Tarefa já completa': ErrorCode.TASK_ALREADY_COMPLETED,
    'Projeto inválido': ErrorCode.PROJECT_NOT_FOUND,
    'Projeto contém tarefas': ErrorCode.PROJECT_HAS_TASKS,
    'Não é possível deletar projeto com tarefas vinculadas': ErrorCode.PROJECT_HAS_TASKS,
    'Dados duplicados': ErrorCode.RESOURCE_ALREADY_EXISTS,
    'Erro de validação': ErrorCode.VALIDATION_FAILED
  };

  return errorMappings[errorMessage] || ErrorCode.INTERNAL_SERVER_ERROR;
}

/**
 * Verifica se um erro é de um tipo específico
 */
export function isErrorType(error: any, type: ErrorCode): boolean {
  return error instanceof AppError && error.code === type;
}

/**
 * Extrai informações de debug de um erro (apenas em desenvolvimento)
 */
export function getErrorDebugInfo(error: any): Record<string, any> | undefined {
  if (process.env.NODE_ENV !== 'development') {
    return undefined;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code || 'UNKNOWN',
    cause: error.cause
  };
}

// ============================================================================
// CLASSES DE ERRO ESPECÍFICAS PARA LEMBRETES (MANTENDO COMPATIBILIDADE)
// ============================================================================

export class ReminderValidationError extends Error {
  public readonly field?: string;
  public readonly code: string = 'REMINDER_VALIDATION_ERROR';

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ReminderValidationError';
    this.field = field;
    
    // Mantém o stack trace adequado
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReminderValidationError);
    }
  }
}

export class ReminderLimitError extends Error {
  public readonly limit: number;
  public readonly entityId: string;
  public readonly code: string = 'REMINDER_LIMIT_ERROR';

  constructor(limit: number, entityId: string) {
    super(`Limite de ${limit} lembretes atingido para entidade ${entityId}`);
    this.name = 'ReminderLimitError';
    this.limit = limit;
    this.entityId = entityId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReminderLimitError);
    }
  }
}

export class ReminderNotFoundError extends Error {
  public readonly reminderId: string;
  public readonly code: string = 'REMINDER_NOT_FOUND';

  constructor(reminderId: string) {
    super(`Lembrete ${reminderId} não encontrado`);
    this.name = 'ReminderNotFoundError';
    this.reminderId = reminderId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReminderNotFoundError);
    }
  }
}

export class ReminderSchedulerError extends Error {
  public readonly operation: string;
  public readonly code: string = 'REMINDER_SCHEDULER_ERROR';

  constructor(message: string, operation: string) {
    super(message);
    this.name = 'ReminderSchedulerError';
    this.operation = operation;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReminderSchedulerError);
    }
  }
}

// ============================================================================
// PUSH SUBSCRIPTION ERRORS
// ============================================================================

export class PushSubscriptionValidationError extends Error {
  public readonly field: string;
  public readonly code: string = 'PUSH_SUBSCRIPTION_VALIDATION_ERROR';

  constructor(field: string, message: string) {
    super(message);
    this.name = 'PushSubscriptionValidationError';
    this.field = field;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PushSubscriptionValidationError);
    }
  }
}

export class PushSubscriptionNotFoundError extends Error {
  public readonly subscriptionId: string;
  public readonly code: string = 'PUSH_SUBSCRIPTION_NOT_FOUND';

  constructor(subscriptionId: string) {
    super(`Push subscription ${subscriptionId} não encontrada`);
    this.name = 'PushSubscriptionNotFoundError';
    this.subscriptionId = subscriptionId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PushSubscriptionNotFoundError);
    }
  }
}

/**
 * Verifica se um erro é de validação de lembretes
 */
export function isReminderValidationError(error: any): error is ReminderValidationError {
  return error instanceof ReminderValidationError;
}

/**
 * Verifica se um erro é de limite de lembretes
 */
export function isReminderLimitError(error: any): error is ReminderLimitError {
  return error instanceof ReminderLimitError;
}

/**
 * Verifica se um erro é de lembrete não encontrado
 */
export function isReminderNotFoundError(error: any): error is ReminderNotFoundError {
  return error instanceof ReminderNotFoundError;
}

/**
 * Verifica se um erro é do scheduler de lembretes
 */
export function isReminderSchedulerError(error: any): error is ReminderSchedulerError {
  return error instanceof ReminderSchedulerError;
}

/**
 * Verifica se um erro é de validação de push subscription
 */
export function isPushSubscriptionValidationError(error: any): error is PushSubscriptionValidationError {
  return error instanceof PushSubscriptionValidationError;
}

/**
 * Verifica se um erro é de push subscription não encontrada
 */
export function isPushSubscriptionNotFoundError(error: any): error is PushSubscriptionNotFoundError {
  return error instanceof PushSubscriptionNotFoundError;
}

/**
 * Mapeia erros personalizados para códigos HTTP apropriados
 */
export function getHttpStatusForReminderError(error: Error): number {
  if (isReminderValidationError(error)) {
    return 400; // Bad Request
  }
  
  if (isReminderLimitError(error)) {
    return 409; // Conflict
  }
  
  if (isReminderNotFoundError(error)) {
    return 404; // Not Found
  }
  
  if (isReminderSchedulerError(error)) {
    return 503; // Service Unavailable
  }
  
  return 500; // Internal Server Error
}

/**
 * Cria resposta de erro estruturada para o frontend
 */
export function createReminderErrorResponse(error: Error) {
  const baseResponse = {
    success: false,
    message: error.message,
    timestamp: new Date().toISOString()
  };

  if (isReminderValidationError(error)) {
    return {
      ...baseResponse,
      error: {
        type: 'validation',
        code: error.code,
        field: error.field
      }
    };
  }

  if (isReminderLimitError(error)) {
    return {
      ...baseResponse,
      error: {
        type: 'limit',
        code: error.code,
        limit: error.limit,
        entityId: error.entityId
      }
    };
  }

  if (isReminderNotFoundError(error)) {
    return {
      ...baseResponse,
      error: {
        type: 'not_found',
        code: error.code,
        reminderId: error.reminderId
      }
    };
  }

  if (isReminderSchedulerError(error)) {
    return {
      ...baseResponse,
      error: {
        type: 'scheduler',
        code: error.code,
        operation: error.operation
      }
    };
  }

  return {
    ...baseResponse,
    error: {
      type: 'internal',
      code: 'INTERNAL_SERVER_ERROR'
    }
  };
}