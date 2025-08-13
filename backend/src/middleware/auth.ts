import { Response, NextFunction } from 'express';
import { verifyToken, clearSecureCookie } from '../lib/jwt';
import { prisma } from '../app';
import { AuthenticatedRequest } from '../types/api';
import { ErrorCode, createErrorResponse } from '../lib/errors';
import secureLogger from '../lib/secureLogger';

// ETAPA 2: Middleware de autenticação server-side robusto (P1)
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // SEGURANÇA CRÍTICA: Token APENAS via cookies HTTP-only
    const token = req.cookies?.['auth-token'];
    
    if (!token) {
      // Log de tentativa de acesso não autorizada
      secureLogger.warn('Unauthorized access attempt', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        reason: 'missing_auth_cookie'
      });
      
      // LOOP PREVENTION: Clear any invalid cookies and add no-cache headers
      clearSecureCookie(res);
      
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(401).json(
        createErrorResponse(ErrorCode.AUTH_REQUIRED, 'missing_token', 'authentication_required')
      );
    }

    // Verificar e decodar o token
    const decoded = verifyToken(token);
    
    if (!decoded.userId || !decoded.email) {
      secureLogger.warn('Invalid token payload', {
        ip: req.ip,
        path: req.path,
        reason: 'invalid_payload'
      });
      
      // LOOP PREVENTION: Clear invalid token and set no-cache headers
      clearSecureCookie(res);
      
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      return res.status(401).json(
        createErrorResponse(ErrorCode.AUTH_REQUIRED, 'invalid_token_payload')
      );
    }

    // SEGURANÇA: Validar usuário existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // Futuro: campos de status do usuário (ativo/bloqueado)
      }
    });

    if (!user) {
      secureLogger.warn('Token valid but user not found', {
        userId: decoded.userId,
        ip: req.ip,
        path: req.path
      });
      
      // Limpar cookie inválido
      clearSecureCookie(res);
      
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      return res.status(401).json(
        createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND, 'user_not_found')
      );
    }

    // SEGURANÇA: Verificar consistência email token vs banco
    if (user.email !== decoded.email) {
      secureLogger.error('Token email mismatch - potential security breach', {
        userId: decoded.userId,
        tokenEmail: decoded.email,
        dbEmail: user.email,
        ip: req.ip
      });
      
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      return res.status(401).json(
        createErrorResponse(ErrorCode.AUTH_REQUIRED, 'token_user_mismatch')
      );
    }

    // Adicionar dados do usuário à requisição
    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Log de acesso bem-sucedido (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      secureLogger.info('Successful authentication', {
        userId: user.id,
        path: req.path,
        method: req.method
      });
    }

    return next();
  } catch (error: any) {
    // Log de erro de autenticação
    secureLogger.error('Authentication error', {
      error: error.message,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    // Detectar especificamente se o erro é de token expirado
    if (error.message === 'Token inválido ou expirado' || error.name === 'TokenExpiredError') {
      // Limpar cookie expirado
      clearSecureCookie(res);
      
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      return res.status(401).json(
        createErrorResponse(ErrorCode.AUTH_TOKEN_EXPIRED, 'jwt_verification')
      );
    }

    // Para outros erros de JWT (malformed, invalid signature, etc)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(401).json(
      createErrorResponse(ErrorCode.AUTH_REQUIRED, 'jwt_verification')
    );
  }
};

// Middleware legado mantido para compatibilidade
export const authenticate = requireAuth;

// Middleware para autenticação opcional (mantido para casos específicos)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // SEGURANÇA: Verificar apenas cookies HTTP-only
  const token = req.cookies?.['auth-token'];
  
  if (!token) {
    return next();
  }

  try {
    await requireAuth(req, res, next);
  } catch (error) {
    // Em caso de erro na autenticação opcional, continua sem user
    return next();
  }
};