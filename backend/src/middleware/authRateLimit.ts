/**
 * Rate Limiting Middleware para Endpoints de Autenticação
 * 
 * Implementa rate limiting específico para prevenir ataques de força bruta
 * e enumeração de usuários em endpoints de autenticação
 */

import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { createErrorResponse, ErrorCode } from '../lib/errors';
import { secureLogger } from '../lib/secureLogger';

interface RateLimitStore {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked?: boolean;
  blockedUntil?: number;
}

class AuthRateLimiter {
  private attempts = new Map<string, RateLimitStore>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;
  private readonly cleanupIntervalMs: number;

  constructor() {
    // Configurações mais restritivas para autenticação
    this.maxAttempts = parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS || '5');
    this.windowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutos
    this.blockDurationMs = parseInt(process.env.AUTH_RATE_LIMIT_BLOCK_DURATION_MS || '3600000'); // 1 hora
    this.cleanupIntervalMs = parseInt(process.env.AUTH_RATE_LIMIT_CLEANUP_INTERVAL_MS || '300000'); // 5 minutos

    // Limpeza automática de entradas antigas
    setInterval(() => this.cleanup(), this.cleanupIntervalMs);
  }

  /**
   * Gera chave única para tracking (combina IP + email para ser mais restritivo)
   */
  private generateKey(req: Request): string {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const email = req.body?.email || 'no-email';
    
    // Hash para não armazenar dados sensíveis diretamente
    const combined = `${ip}:${email}`;
    return createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Remove entradas antigas da memória
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, store] of this.attempts.entries()) {
      // Remove entradas antigas ou não mais bloqueadas
      if (
        (store.blockedUntil && now > store.blockedUntil) ||
        (!store.blocked && (now - store.lastAttempt) > this.windowMs)
      ) {
        this.attempts.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      secureLogger.debug(`Rate limiter cleanup: removed ${cleanedCount} entries`);
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
      store.count = 0; // Reset contador
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
    if (now - store.firstAttempt > this.windowMs) {
      store.count = 0;
      store.firstAttempt = now;
    }

    store.count++;
    store.lastAttempt = now;

    // Bloqueia se excedeu limite
    if (store.count > this.maxAttempts) {
      store.blocked = true;
      store.blockedUntil = now + this.blockDurationMs;

      // Log de evento de segurança
      secureLogger.security('Rate limit exceeded for authentication', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        email: req.body?.email,
        attempts: store.count,
        blockDuration: this.blockDurationMs
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
      const key = this.generateKey(req);

      // Verifica se já está bloqueado
      if (this.shouldBlock(key)) {
        const store = this.attempts.get(key);
        const remainingTime = store?.blockedUntil ? 
          Math.ceil((store.blockedUntil - Date.now()) / 1000) : 
          Math.ceil(this.blockDurationMs / 1000);

        const response = createErrorResponse(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'auth_rate_limit',
          undefined,
          {
            retryAfter: remainingTime,
            message: 'Muitas tentativas de autenticação. Tente novamente mais tarde.'
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
          'auth_rate_limit',
          undefined,
          {
            retryAfter: Math.ceil(this.blockDurationMs / 1000),
            message: 'Limite de tentativas excedido. Conta temporariamente bloqueada.'
          }
        );

        res.status(429).json(response);
        return;
      }

      // Adiciona headers informativos
      const store = this.attempts.get(key);
      if (store) {
        res.set({
          'X-RateLimit-Limit': this.maxAttempts.toString(),
          'X-RateLimit-Remaining': Math.max(0, this.maxAttempts - store.count).toString(),
          'X-RateLimit-Reset': new Date(store.firstAttempt + this.windowMs).toISOString()
        });
      }

      next();
    };
  }

  /**
   * Limpa tentativas para um usuário específico (após login bem-sucedido)
   */
  public clearAttempts(req: Request): void {
    const key = this.generateKey(req);
    this.attempts.delete(key);
  }

  /**
   * Obtém estatísticas de rate limiting (para monitoramento)
   */
  public getStats(): {
    totalKeys: number;
    blockedKeys: number;
    totalAttempts: number;
  } {
    let blockedKeys = 0;
    let totalAttempts = 0;

    for (const store of this.attempts.values()) {
      totalAttempts += store.count;
      if (store.blocked) blockedKeys++;
    }

    return {
      totalKeys: this.attempts.size,
      blockedKeys,
      totalAttempts
    };
  }
}

// Singleton instance
const authRateLimiter = new AuthRateLimiter();

// Middleware exportado
export const authRateLimit = authRateLimiter.middleware();

// Função para limpar tentativas após sucesso
export const clearAuthAttempts = (req: Request): void => {
  authRateLimiter.clearAttempts(req);
};

// Função para obter estatísticas
export const getAuthRateLimitStats = () => {
  return authRateLimiter.getStats();
};

export default authRateLimit;

// ===== EXEMPLO DE USO =====

/*
// Em auth routes:
import { authRateLimit, clearAuthAttempts } from '../middleware/authRateLimit';

router.post('/login', authRateLimit, async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    
    // Limpa tentativas após login bem-sucedido
    clearAuthAttempts(req);
    
    res.json(result);
  } catch (error) {
    // Não limpa tentativas em caso de erro
    next(error);
  }
});

router.post('/register', authRateLimit, registerController);
router.post('/forgot-password', authRateLimit, forgotPasswordController);
*/