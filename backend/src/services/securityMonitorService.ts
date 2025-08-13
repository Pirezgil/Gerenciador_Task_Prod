/**
 * ETAPA 4: Serviço de Monitoramento de Segurança (P3)
 * 
 * Responsável por registrar eventos de segurança críticos e fornecer
 * visibilidade sobre atividades suspeitas no sistema.
 * 
 * NOTA: Funcionalidades completas serão habilitadas após migration da tabela security_logs
 */

import secureLogger from '../lib/secureLogger';
import { SecurityEventType } from '../types/auth';

export interface SecurityEvent {
  event: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

class SecurityMonitorService {
  /**
   * Registra um evento de segurança (temporariamente apenas via secureLogger)
   */
  async logSecurityEvent(securityEvent: SecurityEvent): Promise<void> {
    try {
      // Gerar tracking ID único
      const trackingId = this.generateTrackingId();

      // TEMPORÁRIO: Registrar apenas via secureLogger até migration ser aplicada
      secureLogger.security(`Security event: ${securityEvent.event}`, {
        trackingId,
        severity: securityEvent.severity,
        userId: securityEvent.userId,
        description: securityEvent.description,
        ipAddress: this.sanitizeIpAddress(securityEvent.ipAddress),
        userAgent: this.sanitizeUserAgent(securityEvent.userAgent) || undefined,
        metadata: securityEvent.metadata
      });

      // Se evento crítico, alertar imediatamente
      if (securityEvent.severity === 'critical') {
        await this.handleCriticalEvent(securityEvent, trackingId);
      }

    } catch (error) {
      // Falha no logging de segurança não deve quebrar a aplicação
      secureLogger.error('Failed to log security event', {
        event: securityEvent.event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Eventos específicos de autenticação
   */
  async logAuthEvent(
    type: SecurityEventType,
    userId?: string,
    details?: {
      email?: string;
      ipAddress?: string;
      userAgent?: string;
      failedAttempts?: number;
      reason?: string;
    }
  ): Promise<void> {
    const severityMap = {
      login_success: 'info' as const,
      login_failed: 'warning' as const,
      logout: 'info' as const,
      password_reset: 'warning' as const,
      account_locked: 'critical' as const,
      oauth_login_success: 'info' as const,
      oauth_login_failed: 'warning' as const,
    };

    const descriptions = {
      login_success: 'User successfully authenticated',
      login_failed: 'Failed authentication attempt',
      logout: 'User logged out',
      password_reset: 'Password reset requested/completed',
      account_locked: 'Account locked due to security policy',
      oauth_login_success: 'OAuth user successfully authenticated',
      oauth_login_failed: 'Failed OAuth authentication attempt',
    };

    await this.logSecurityEvent({
      event: type,
      description: descriptions[type],
      severity: severityMap[type],
      userId,
      ipAddress: details?.ipAddress,
      userAgent: details?.userAgent,
      metadata: {
        email: details?.email ? this.hashSensitiveData(details.email) : undefined,
        failedAttempts: details?.failedAttempts,
        reason: details?.reason,
      },
    });
  }

  /**
   * Eventos de acesso suspeito
   */
  async logSuspiciousActivity(
    description: string,
    userId?: string,
    details?: {
      ipAddress?: string;
      userAgent?: string;
      endpoint?: string;
      payload?: any;
    }
  ): Promise<void> {
    await this.logSecurityEvent({
      event: 'suspicious_activity',
      description,
      severity: 'critical',
      userId,
      ipAddress: details?.ipAddress,
      userAgent: details?.userAgent,
      metadata: {
        endpoint: details?.endpoint,
        payloadHash: details?.payload ? this.hashSensitiveData(JSON.stringify(details.payload)) : undefined,
      },
    });
  }

  /**
   * PRIVATE METHODS
   */

  private generateTrackingId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private sanitizeIpAddress(ip?: string): string | null {
    if (!ip) return null;
    
    // Em produção, hashar IP para LGPD/GDPR
    if (process.env.NODE_ENV === 'production') {
      return this.hashSensitiveData(ip);
    }
    
    return ip;
  }

  private sanitizeUserAgent(userAgent?: string): string | null {
    if (!userAgent) return null;
    
    // Manter apenas informações não identificáveis
    const sanitized = userAgent
      .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP_REMOVED]')
      .substring(0, 200); // Limitar tamanho
    
    return sanitized;
  }

  private hashSensitiveData(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private async handleCriticalEvent(event: SecurityEvent, trackingId: string): Promise<void> {
    // Log crítico imediato
    secureLogger.error(`CRITICAL SECURITY EVENT: ${event.event}`, {
      trackingId,
      description: event.description,
      userId: event.userId,
    });

    // Em produção, aqui poderia:
    // - Enviar notificação para equipe de segurança
    // - Bloquear automaticamente IPs suspeitos
    // - Disparar webhook para SIEM
    
    if (process.env.SECURITY_WEBHOOK_URL) {
      try {
        // Implementação de webhook para eventos críticos
        // await this.sendSecurityWebhook(event, trackingId);
      } catch (error) {
        secureLogger.error('Failed to send security webhook', { error });
      }
    }
  }
}

// Singleton
export const securityMonitor = new SecurityMonitorService();
export default securityMonitor;

// Helper para middlewares
export const logSecurityEvent = (event: SecurityEvent) => {
  return securityMonitor.logSecurityEvent(event);
};

export const logAuthEvent = (
  type: SecurityEventType,
  userId?: string,
  details?: {
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    failedAttempts?: number;
    reason?: string;
  }
) => {
  return securityMonitor.logAuthEvent(type, userId, details);
};