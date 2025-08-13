// ============================================================================
// ERROR HANDLING - Sistema avançado de tratamento de erros
// ============================================================================

import { toast } from 'sonner';

// ============================================================================
// TIPOS DE ERRO
// ============================================================================

interface ErrorResponse {
  success: false;
  message: string;
  timestamp: string;
  error?: {
    type: 'validation' | 'limit' | 'not_found' | 'scheduler' | 'internal' | 'network' | 'timeout';
    code: string;
    field?: string;
    limit?: number;
    entityId?: string;
    reminderId?: string;
    operation?: string;
  };
}

interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoff?: boolean;
}

// ============================================================================
// MAPEAMENTO DE MENSAGENS AMIGÁVEIS
// ============================================================================

const ERROR_MESSAGES = {
  // Erros de Validação
  'REMINDER_VALIDATION_ERROR': {
    scheduledTime: 'Por favor, informe um horário válido para o lembrete.',
    daysOfWeek: 'Selecione pelo menos um dia da semana para lembretes recorrentes.',
    minutesBefore: 'Informe quantos minutos antes você quer ser lembrado.',
    notificationTypes: 'Escolha pelo menos um tipo de notificação.',
    entityId: 'Erro interno: ID da tarefa/hábito inválido.',
    type: 'Tipo de lembrete inválido.',
    default: 'Os dados do lembrete estão incompletos ou inválidos.'
  },
  
  // Erros de Limite
  'REMINDER_LIMIT_ERROR': 'Você atingiu o limite máximo de lembretes. Exclua alguns lembretes antigos antes de criar novos.',
  
  // Erros de Não Encontrado
  'REMINDER_NOT_FOUND': 'O lembrete que você está tentando acessar não foi encontrado ou foi excluído.',
  
  // Erros do Scheduler
  'REMINDER_SCHEDULER_ERROR': 'Erro no sistema de lembretes. Tente novamente em alguns minutos.',
  
  // Erros de Rede
  'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'TIMEOUT_ERROR': 'A solicitação demorou muito para responder. Tente novamente.',
  
  // Erros Genéricos
  'INTERNAL_SERVER_ERROR': 'Erro interno do servidor. Nossa equipe foi notificada.',
  'UNKNOWN_ERROR': 'Algo deu errado. Tente novamente.',
  
  // Erros de Autenticação
  'UNAUTHORIZED': 'Sua sessão expirou. Faça login novamente.',
  'FORBIDDEN': 'Você não tem permissão para realizar esta ação.'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extrai informações de erro de diferentes tipos de resposta
 */
function parseError(error: any): ErrorResponse {
  // Erro de rede/timeout do axios
  if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
    return {
      success: false,
      message: 'Erro de conexão',
      timestamp: new Date().toISOString(),
      error: {
        type: 'network',
        code: 'NETWORK_ERROR'
      }
    };
  }
  
  // Erro de timeout
  if (error.code === 'ECONNABORTED') {
    return {
      success: false,
      message: 'Timeout na requisição',
      timestamp: new Date().toISOString(),
      error: {
        type: 'timeout',
        code: 'TIMEOUT_ERROR'
      }
    };
  }
  
  // Resposta HTTP com error estruturado (nosso backend)
  if (error.response?.data?.error) {
    return error.response.data as ErrorResponse;
  }
  
  // Resposta HTTP simples
  if (error.response?.data?.message) {
    return {
      success: false,
      message: error.response.data.message,
      timestamp: new Date().toISOString(),
      error: {
        type: 'internal',
        code: 'INTERNAL_SERVER_ERROR'
      }
    };
  }
  
  // Erro do axios/network
  if (error.response?.status) {
    const status = error.response.status;
    if (status === 401) {
      return {
        success: false,
        message: 'Não autorizado',
        timestamp: new Date().toISOString(),
        error: {
          type: 'internal',
          code: 'UNAUTHORIZED'
        }
      };
    }
    if (status === 403) {
      return {
        success: false,
        message: 'Acesso negado',
        timestamp: new Date().toISOString(),
        error: {
          type: 'internal',
          code: 'FORBIDDEN'
        }
      };
    }
  }
  
  // Fallback para erro genérico
  return {
    success: false,
    message: error.message || 'Erro desconhecido',
    timestamp: new Date().toISOString(),
    error: {
      type: 'internal',
      code: 'UNKNOWN_ERROR'
    }
  };
}

/**
 * Gera mensagem amigável baseada no erro
 */
function getFriendlyMessage(errorData: ErrorResponse): string {
  const error = errorData.error;
  
  if (!error) {
    return errorData.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  // Erros de validação com campo específico
  if (error.type === 'validation' && error.code === 'REMINDER_VALIDATION_ERROR' && error.field) {
    const fieldMessage = ERROR_MESSAGES.REMINDER_VALIDATION_ERROR[error.field as keyof typeof ERROR_MESSAGES.REMINDER_VALIDATION_ERROR];
    return fieldMessage || ERROR_MESSAGES.REMINDER_VALIDATION_ERROR.default;
  }
  
  // Outros tipos de erro
  const message = ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES];
  return typeof message === 'string' ? message : ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Verifica se um erro deve ter retry automático
 */
function shouldRetry(errorData: ErrorResponse): boolean {
  const error = errorData.error;
  
  if (!error) return false;
  
  // Retry para erros temporários
  return [
    'network',
    'timeout', 
    'scheduler'
  ].includes(error.type);
}

/**
 * Calcula delay para retry com backoff exponencial
 */
function getRetryDelay(attempt: number, baseDelayMs: number, useBackoff: boolean): number {
  if (!useBackoff) return baseDelayMs;
  return baseDelayMs * Math.pow(2, attempt - 1);
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

/**
 * Manipula erros de forma consistente em toda a aplicação
 */
export async function handleError(
  error: any, 
  context?: string,
  showToast: boolean = true
): Promise<ErrorResponse> {
  const errorData = parseError(error);
  const friendlyMessage = getFriendlyMessage(errorData);
  
  // Log estruturado para debugging
  console.error('🚨 Error handled:', {
    context,
    original: error,
    parsed: errorData,
    friendlyMessage,
    timestamp: new Date().toISOString()
  });
  
  // Mostrar toast apenas se solicitado
  if (showToast) {
    toast.error(friendlyMessage, {
      description: context ? `Contexto: ${context}` : undefined,
      duration: 5000,
    });
  }
  
  return errorData;
}

/**
 * Executa uma função com retry automático para erros temporários
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delayMs: 1000, backoff: true },
  context?: string
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorData = parseError(error);
      
      // Só faz retry se for erro temporário e não for a última tentativa
      if (shouldRetry(errorData) && attempt < options.maxRetries) {
        const delay = getRetryDelay(attempt, options.delayMs, options.backoff || false);
        
        console.warn(`🔄 Retry ${attempt}/${options.maxRetries} em ${delay}ms para: ${context || 'operação'}`);
        
        // Toast informativo no último retry antes do final
        if (attempt === options.maxRetries - 1) {
          toast.info('Tentando novamente...', {
            description: 'Última tentativa automática',
            duration: 2000
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Se chegou aqui, não deve fazer retry ou é a última tentativa
      break;
    }
  }
  
  // Tratamento do erro final
  await handleError(lastError, context);
  throw lastError;
}

// ============================================================================
// HOOKS ESPECÍFICOS PARA LEMBRETES
// ============================================================================

/**
 * Hook específico para erros de lembretes com contextos apropriados
 */
export const reminderErrorHandler = {
  create: (error: any) => handleError(error, 'Criação de lembrete'),
  update: (error: any) => handleError(error, 'Atualização de lembrete'),
  delete: (error: any) => handleError(error, 'Exclusão de lembrete'),
  fetch: (error: any) => handleError(error, 'Carregamento de lembretes'),
  markSent: (error: any) => handleError(error, 'Marcação de lembrete enviado')
};

/**
 * Wrapper para operações de lembrete com retry
 */
export const withReminderRetry = <T>(
  fn: () => Promise<T>,
  operation: string
): Promise<T> => {
  return withRetry(fn, { maxRetries: 3, delayMs: 1500, backoff: true }, `Lembrete: ${operation}`);
};