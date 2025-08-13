/**
 * Rate Limiting Middleware para Endpoints de Notificações
 * 
 * Implementa rate limiting específico para prevenir abuso dos
 * endpoints de notificações push e lembretes
 */

import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { createErrorResponse, ErrorCode } from '../lib/errors';
import { secureLogger } from '../lib/secureLogger';
import { AuthenticatedRequest } from '../types/api';

interface NotificationRateLimitStore {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked?: boolean;
  blockedUntil?: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

class NotificationRateLimiter {
  private attempts = new Map<string, NotificationRateLimitStore>();
  private readonly config: Required<RateLimitConfig>;
  private cleanupTimer: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      keyGenerator: this.defaultKeyGenerator,
      message: 'Muitas solicitações. Tente novamente mais tarde.',
      ...config
    };

    // Limpeza automática a cada 5 minutos
    this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Gerador de chave padrão (usuário + IP)
   */
  private defaultKeyGenerator(req: Request): string {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    const combined = `${userId}:${ip}`;
    return createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Remove entradas antigas da memória
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, store] of this.attempts.entries()) {
      const shouldRemove = 
        (store.blockedUntil && now > store.blockedUntil) ||
        (!store.blocked && (now - store.lastAttempt) > this.config.windowMs * 2);

      if (shouldRemove) {
        this.attempts.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      secureLogger.debug(`Notification rate limiter cleanup: removed ${cleanedCount} entries`);
    }
  }

  /**
   * Verifica se requisição deve ser bloqueada
   */
  private shouldBlock(key: string): boolean {
    const store = this.attempts.get(key);
    if (!store) return false;

    const now = Date.now();

    // Verifica se ainda está no período de bloqueio
    if (store.blocked && store.blockedUntil && now < store.blockedUntil) {
      return true;
    }

    // Remove bloqueio se expirou
    if (store.blocked && store.blockedUntil && now >= store.blockedUntil) {
      store.blocked = false;
      store.blockedUntil = undefined;
      store.count = 0;
    }

    return false;
  }

  /**
   * Registra tentativa e atualiza contador
   */
  private recordAttempt(key: string, req: Request): boolean {
    const now = Date.now();
    const store = this.attempts.get(key) || {
      count: 0,
      firstAttempt: now,
      lastAttempt: now
    };

    // Reset contador se janela de tempo passou
    if (now - store.firstAttempt > this.config.windowMs) {
      store.count = 0;
      store.firstAttempt = now;
    }

    store.count++;
    store.lastAttempt = now;

    // Bloqueia se excedeu limite
    if (store.count > this.config.maxAttempts) {
      store.blocked = true;
      store.blockedUntil = now + this.config.blockDurationMs;

      // Log de evento de segurança
      const authReq = req as AuthenticatedRequest;
      secureLogger.security('Notification rate limit exceeded', {
        userId: authReq.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        method: req.method,
        attempts: store.count,
        blockDuration: this.config.blockDurationMs
      });

      this.attempts.set(key, store);
      return false; // Bloqueado
    }

    this.attempts.set(key, store);
    return true; // Permitido
  }

  /**
   * Middleware principal para rate limiting
   */
  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.config.keyGenerator(req);

      // Verifica se já está bloqueado
      if (this.shouldBlock(key)) {
        const store = this.attempts.get(key);
        const remainingTime = store?.blockedUntil ? 
          Math.ceil((store.blockedUntil - Date.now()) / 1000) : 
          Math.ceil(this.config.blockDurationMs / 1000);

        const response = createErrorResponse(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'notification_rate_limit',
          undefined,
          {
            retryAfter: remainingTime,
            message: this.config.message
          }
        );

        res.status(429).json(response);
        return;
      }

      // Registra tentativa
      const allowed = this.recordAttempt(key, req);
      
      if (!allowed) {
        const response = createErrorResponse(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'notification_rate_limit',
          undefined,
          {
            retryAfter: Math.ceil(this.config.blockDurationMs / 1000),
            message: this.config.message
          }
        );

        res.status(429).json(response);
        return;
      }

      // Adiciona headers informativos
      const store = this.attempts.get(key);
      if (store) {
        res.set({
          'X-RateLimit-Limit': this.config.maxAttempts.toString(),
          'X-RateLimit-Remaining': Math.max(0, this.config.maxAttempts - store.count).toString(),
          'X-RateLimit-Reset': new Date(store.firstAttempt + this.config.windowMs).toISOString(),
          'X-RateLimit-Window': this.config.windowMs.toString()
        });
      }

      // Se configurado para ignorar requisições bem-sucedidas,
      // intercepta a resposta para limpar contador em caso de sucesso
      if (this.config.skipSuccessfulRequests) {
        const originalSend = res.send;
        res.send = function(body) {
          if (res.statusCode < 400) {
            // Requisição bem-sucedida - não conta para o rate limit
            const currentStore = store;
            if (currentStore && currentStore.count > 0) {
              currentStore.count--;
            }
          }
          return originalSend.call(this, body);
        };
      }

      next();
    };
  }

  /**
   * Limpa tentativas para uma chave específica
   */
  public clearAttempts(req: Request): void {
    const key = this.config.keyGenerator(req);
    this.attempts.delete(key);
  }

  /**
   * Obtém estatísticas de rate limiting
   */
  public getStats() {
    let blockedKeys = 0;
    let totalAttempts = 0;

    for (const store of this.attempts.values()) {
      totalAttempts += store.count;
      if (store.blocked) blockedKeys++;
    }

    return {
      totalKeys: this.attempts.size,
      blockedKeys,
      totalAttempts,
      config: {
        maxAttempts: this.config.maxAttempts,
        windowMs: this.config.windowMs,
        blockDurationMs: this.config.blockDurationMs
      }
    };
  }

  /**
   * Destroy cleanup timer
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// ============================================================================
// CONFIGURAÇÕES PRÉ-DEFINIDAS
// ============================================================================

// Rate limiter para criação de lembretes (mais restritivo)
const createReminderRateLimit = new NotificationRateLimiter({
  maxAttempts: 10, // 10 lembretes por janela
  windowMs: 5 * 60 * 1000, // 5 minutos
  blockDurationMs: 15 * 60 * 1000, // 15 minutos de bloqueio
  message: 'Muitos lembretes criados. Aguarde antes de criar novos lembretes.'
});

// Rate limiter para push subscriptions (moderado)
const pushSubscriptionRateLimit = new NotificationRateLimiter({
  maxAttempts: 5, // 5 assinaturas por janela
  windowMs: 10 * 60 * 1000, // 10 minutos
  blockDurationMs: 30 * 60 * 1000, // 30 minutos de bloqueio
  message: 'Muitas tentativas de configuração de notificações. Tente novamente mais tarde.'
});

// Rate limiter para testes de notificação (muito restritivo)
const testNotificationRateLimit = new NotificationRateLimiter({
  maxAttempts: 3, // 3 testes por janela
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 60 * 60 * 1000, // 1 hora de bloqueio
  message: 'Muitos testes de notificação. Aguarde antes de testar novamente.',
  skipSuccessfulRequests: true // Não conta testes bem-sucedidos
});

// Rate limiter geral para endpoints de notificação (moderado)
const generalNotificationRateLimit = new NotificationRateLimiter({
  maxAttempts: 100, // 100 requisições por janela (aumentado para leitura)
  windowMs: 10 * 60 * 1000, // 10 minutos
  blockDurationMs: 5 * 60 * 1000, // 5 minutos de bloqueio (reduzido)
  message: 'Muitas requisições de notificação. Aguarde antes de continuar.'
});

// Rate limiter específico para leitura de lembretes (mais permissivo)
const readReminderRateLimit = new NotificationRateLimiter({
  maxAttempts: 200, // 200 requisições de leitura por janela
  windowMs: 10 * 60 * 1000, // 10 minutos
  blockDurationMs: 2 * 60 * 1000, // 2 minutos de bloqueio
  message: 'Muitas consultas de lembretes. Aguarde um momento.',
  skipSuccessfulRequests: true // Não conta requisições bem-sucedidas
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
  NotificationRateLimiter,
  createReminderRateLimit,
  pushSubscriptionRateLimit,
  testNotificationRateLimit,
  generalNotificationRateLimit,
  readReminderRateLimit
};

// Middlewares prontos para uso
export const createReminderLimit = createReminderRateLimit.middleware();
export const pushSubscriptionLimit = pushSubscriptionRateLimit.middleware();
export const testNotificationLimit = testNotificationRateLimit.middleware();
export const generalNotificationLimit = generalNotificationRateLimit.middleware();
export const readReminderLimit = readReminderRateLimit.middleware();

// Funções utilitárias
export const clearReminderAttempts = (req: Request) => createReminderRateLimit.clearAttempts(req);
export const clearPushSubscriptionAttempts = (req: Request) => pushSubscriptionRateLimit.clearAttempts(req);

// Estatísticas para monitoramento
export const getNotificationRateLimitStats = () => ({
  createReminder: createReminderRateLimit.getStats(),
  pushSubscription: pushSubscriptionRateLimit.getStats(),
  testNotification: testNotificationRateLimit.getStats(),
  general: generalNotificationRateLimit.getStats()
});

// ===== EXEMPLO DE USO =====

/*
// Em reminder routes:
import { createReminderLimit, generalNotificationLimit } from '../middleware/notificationRateLimit';

router.post('/', createReminderLimit, validate(createReminderSchema), remindersController.createReminder);
router.get('/', generalNotificationLimit, validateQuery(reminderFilterSchema), remindersController.getReminders);

// Em push subscription routes:
import { pushSubscriptionLimit, testNotificationLimit } from '../middleware/notificationRateLimit';

router.post('/', pushSubscriptionLimit, pushSubscriptionController.createPushSubscription);
router.post('/test', testNotificationLimit, pushSubscriptionController.testPushNotification);
*/