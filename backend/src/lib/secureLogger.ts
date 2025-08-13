/**
 * Sistema de Logging Seguro
 * 
 * Implementa logging sanitizado para produção, evitando vazamento de informações sensíveis
 */

import { createHash } from 'crypto';

interface LogContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

interface SanitizedLogContext {
  userId?: string;
  sessionId?: string;
  timestamp: string;
  environment: string;
  [key: string]: any;
}

class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Sanitiza contexto para produção removendo informações sensíveis
   */
  private sanitizeContext(context?: LogContext): SanitizedLogContext {
    if (!context) {
      return {
        timestamp: new Date().toISOString(),
        environment: this.isDevelopment ? 'development' : 'production'
      };
    }

    const sanitized: SanitizedLogContext = {
      timestamp: new Date().toISOString(),
      environment: this.isDevelopment ? 'development' : 'production'
    };

    // Em desenvolvimento, mantém mais informações
    if (this.isDevelopment) {
      sanitized.userId = context.userId || 'anonymous';
      sanitized.sessionId = context.sessionId;
      // Adiciona outras propriedades não sensíveis
      Object.keys(context).forEach(key => {
        if (!['userAgent', 'ip', 'password', 'token', 'authorization'].includes(key.toLowerCase())) {
          sanitized[key] = context[key];
        }
      });
    } else {
      // Em produção, apenas hashes e dados não sensíveis
      sanitized.userId = context.userId ? this.hashData(context.userId) : 'anonymous';
      sanitized.sessionId = context.sessionId ? this.hashData(context.sessionId) : undefined;
      
      // Apenas propriedades explicitamente seguras
      const safeKeys = ['method', 'url', 'statusCode', 'duration'];
      safeKeys.forEach(key => {
        if (context[key] !== undefined) {
          sanitized[key] = context[key];
        }
      });
    }

    return sanitized;
  }

  /**
   * Gera hash seguro de dados sensíveis
   */
  private hashData(data: string): string {
    return createHash('sha256').update(data).digest('hex').substring(0, 12);
  }

  /**
   * Gera ID único para tracking de erros
   */
  private generateTrackingId(): string {
    return createHash('md5').update(`${Date.now()}-${Math.random()}`).digest('hex').substring(0, 12);
  }

  /**
   * Log de erro seguro
   */
  error(message: string, context?: LogContext, error?: Error): void {
    const sanitizedContext = this.sanitizeContext(context);
    const trackingId = this.generateTrackingId();

    if (this.isDevelopment) {
      console.error(`❌ [ERROR-${trackingId}] ${message}`, {
        ...sanitizedContext,
        stack: error?.stack,
        errorDetails: {
          name: error?.name,
          message: error?.message
        }
      });
    } else {
      console.error(`[ERROR-${trackingId}] ${message}`, {
        ...sanitizedContext,
        trackingId
      });

      // Em produção, log detalhado apenas em sistema de logging externo
      if (process.env.EXTERNAL_LOG_SERVICE_URL) {
        this.sendToExternalLogger('error', message, sanitizedContext, trackingId);
      }
    }
  }

  /**
   * Log de warning seguro
   */
  warn(message: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    
    if (this.isDevelopment) {
      console.warn(`⚠️  [WARN] ${message}`, sanitizedContext);
    } else {
      console.warn(`[WARN] ${message}`, sanitizedContext);
    }
  }

  /**
   * Log de informação seguro
   */
  info(message: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    
    if (this.isDevelopment) {
      console.log(`ℹ️  [INFO] ${message}`, sanitizedContext);
    } else {
      console.log(`[INFO] ${message}`, sanitizedContext);
    }
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const sanitizedContext = this.sanitizeContext(context);
      console.debug(`🐛 [DEBUG] ${message}`, sanitizedContext);
    }
    // Em produção, debug logs são ignorados
  }

  /**
   * Log de auditoria de segurança
   */
  security(event: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    const trackingId = this.generateTrackingId();

    console.warn(`🔒 [SECURITY-${trackingId}] ${event}`, {
      ...sanitizedContext,
      trackingId,
      severity: 'security_event'
    });

    // Eventos de segurança sempre vão para sistema externo se configurado
    if (process.env.SECURITY_LOG_SERVICE_URL) {
      this.sendToSecurityLogger(event, sanitizedContext, trackingId);
    }
  }

  /**
   * Envia logs para serviço externo (implementação exemplo)
   */
  private async sendToExternalLogger(
    _level: string, 
    _message: string, 
    _context: SanitizedLogContext, 
    _trackingId: string
  ): Promise<void> {
    try {
      // Implementação exemplo - substituir por serviço real
      if (process.env.EXTERNAL_LOG_SERVICE_URL) {
        // await fetch(process.env.EXTERNAL_LOG_SERVICE_URL, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ level, message, context, trackingId })
        // });
      }
    } catch (error) {
      // Falha no log externo não deve quebrar a aplicação
      console.error('[LOGGER] Falha ao enviar log para serviço externo:', error);
    }
  }

  /**
   * Envia logs de segurança para serviço especializado
   */
  private async sendToSecurityLogger(
    _event: string, 
    _context: SanitizedLogContext, 
    _trackingId: string
  ): Promise<void> {
    try {
      // Implementação exemplo para logs de segurança
      if (process.env.SECURITY_LOG_SERVICE_URL) {
        // await fetch(process.env.SECURITY_LOG_SERVICE_URL, {
        //   method: 'POST',
        //   headers: { 
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${process.env.SECURITY_LOG_TOKEN}`
        //   },
        //   body: JSON.stringify({ 
        //     event, 
        //     context, 
        //     trackingId, 
        //     timestamp: new Date().toISOString(),
        //     severity: 'high'
        //   })
        // });
      }
    } catch (error) {
      // Falha crítica em log de segurança
      console.error('[SECURITY_LOGGER] CRITICAL: Falha ao enviar log de segurança:', error);
    }
  }
}

// Singleton instance
export const secureLogger = new SecureLogger();
export default secureLogger;

// ===== EXEMPLO DE USO =====

/*
// Em controllers:
import secureLogger from '../lib/secureLogger';

export const login = async (req: Request, res: Response) => {
  try {
    // ... lógica de login
    
    secureLogger.info('Login successful', {
      userId: user.id,
      method: req.method,
      url: req.originalUrl
    });
    
  } catch (error) {
    secureLogger.error('Login failed', {
      userId: req.body.email, // Será hashado em produção
      method: req.method,
      url: req.originalUrl
    }, error);
  }
};

// Para eventos de segurança:
secureLogger.security('Multiple failed login attempts detected', {
  userId: hashedUserId,
  ip: hashedIp,
  attempts: attemptCount
});
*/