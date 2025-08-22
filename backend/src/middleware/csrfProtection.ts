/**
 * CSRF Protection Middleware
 * 
 * Implementa proteção contra Cross-Site Request Forgery usando tokens CSRF
 */

import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes } from 'crypto';
import { createErrorResponse, ErrorCode } from '../lib/errors';

interface CSRFRequest extends Request {
  csrfToken?: string;
  sessionID?: string;
  userId?: string;
}

class CSRFProtection {
  private readonly tokenSecret: string;

  constructor() {
    this.tokenSecret = process.env.CSRF_SECRET || 'csrf-secret-key';
  }

  /**
   * Gera token CSRF seguro
   */
  private generateToken(sessionId: string = 'anonymous'): string {
    const timestamp = Date.now().toString();
    const nonce = randomBytes(16).toString('hex');
    const data = `${sessionId}:${timestamp}:${nonce}`;
    
    const hash = createHash('sha256')
      .update(data + this.tokenSecret)
      .digest('hex');
    
    return Buffer.from(`${data}:${hash}`).toString('base64');
  }

  /**
   * Valida token CSRF
   */
  private validateToken(token: string, sessionId: string = 'anonymous'): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const parts = decoded.split(':');
      
      if (parts.length !== 4) return false;
      
      const [tokenSessionId, timestamp, nonce, hash] = parts;
      
      // Verificar se é para a mesma sessão
      if (tokenSessionId !== sessionId) return false;
      
      // Verificar se não expirou (30 minutos)
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      if (now - tokenTime > 30 * 60 * 1000) return false;
      
      // Verificar hash
      const data = `${tokenSessionId}:${timestamp}:${nonce}`;
      const expectedHash = createHash('sha256')
        .update(data + this.tokenSecret)
        .digest('hex');
      
      return hash === expectedHash;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Middleware para gerar token CSRF
   */
  public generateTokenMiddleware() {
    return (req: CSRFRequest, res: Response, next: NextFunction): void => {
      // Gerar token baseado no user ID ou session
      const sessionId = (req as any).userId || (req as any).sessionID || 'anonymous';
      const csrfToken = this.generateToken(sessionId);
      
      req.csrfToken = csrfToken;
      res.locals.csrfToken = csrfToken;
      
      // Enviar token no header para SPAs
      res.setHeader('X-CSRF-Token', csrfToken);
      
      next();
    };
  }

  /**
   * Middleware para validar token CSRF
   */
  public validateTokenMiddleware(options: { 
    skipGET?: boolean, 
    headerName?: string,
    bodyField?: string 
  } = {}) {
    const { 
      skipGET = true, 
      headerName = 'X-CSRF-Token',
      bodyField = '_csrf'
    } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
      console.log('🔒 CSRF Validation - INÍCIO:', {
        path: req.path,
        method: req.method,
        userId: (req as any).userId,
        timestamp: new Date().toISOString()
      });

      // Pular validação para métodos seguros se configurado
      if (skipGET && ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        console.log('🔒 CSRF - Pulando validação para método seguro:', req.method);
        return next();
      }

      // Pular validação para endpoints específicos
      if (req.path === '/health' || 
          req.path === '/api/auth/login' ||
          req.path === '/api/auth/register' ||
          req.path === '/api/auth/logout' ||
          req.path === '/api/auth/refresh' ||
          req.path.startsWith('/api/auth/google')) {
        console.log('🔒 CSRF - Pulando validação para endpoint específico:', req.path);
        return next();
      }

      // Obter token do header ou body
      const token = req.get(headerName) || req.body[bodyField];
      console.log('🔒 CSRF - Token obtido:', {
        hasHeader: !!req.get(headerName),
        hasBodyField: !!req.body[bodyField],
        headerName,
        bodyField,
        tokenLength: token ? token.length : 0
      });
      
      if (!token) {
        console.log('❌ CSRF - Token ausente');
        const response = createErrorResponse(
          ErrorCode.CSRF_TOKEN_MISSING,
          'csrf_validation',
          undefined,
          'Token CSRF é obrigatório'
        );
        
        res.status(403).json(response);
        return;
      }

      // Validar token
      const sessionId = (req as any).userId || (req as any).sessionID || 'anonymous';
      console.log('🔒 CSRF - Validando token:', {
        sessionId,
        tokenPreview: token.substring(0, 20) + '...'
      });
      
      const isValid = this.validateToken(token, sessionId);
      
      if (!isValid) {
        console.log('❌ CSRF - Token inválido ou expirado');
        const response = createErrorResponse(
          ErrorCode.CSRF_TOKEN_INVALID,
          'csrf_validation',
          undefined,
          'Token CSRF inválido ou expirado'
        );
        
        res.status(403).json(response);
        return;
      }

      console.log('✅ CSRF - Token válido, prosseguindo');

      next();
    };
  }

  /**
   * Endpoint para obter token CSRF
   */
  public getTokenEndpoint() {
    return (req: CSRFRequest, res: Response): void => {
      const sessionId = (req as any).userId || (req as any).sessionID || 'anonymous';
      const csrfToken = this.generateToken(sessionId);
      
      res.json({
        success: true,
        data: { csrfToken },
        message: 'Token CSRF gerado'
      });
    };
  }
}

// Singleton instance
const csrfProtection = new CSRFProtection();

export const generateCSRFToken = csrfProtection.generateTokenMiddleware();
export const validateCSRF = csrfProtection.validateTokenMiddleware();
export const getCSRFToken = csrfProtection.getTokenEndpoint();

export default csrfProtection;