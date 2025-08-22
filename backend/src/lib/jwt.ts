import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { JWTPayload } from '../types/auth';

// Validação robusta do JWT Secret
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET é obrigatório. Defina nas variáveis de ambiente.');
  }
  
  if (secret === 'your-secret-key' || secret.length < 32) {
    throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres e não ser o valor padrão.');
  }
  
  return secret;
})();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// CENTRALIZED COOKIE CONFIGURATION for consistency across all auth endpoints
export const COOKIE_OPTIONS = {
  httpOnly: true, // Cookie HTTP-only para segurança - apenas acessível via servidor
  secure: false, // HTTP para desenvolvimento (deve ser true em produção)
  sameSite: 'lax' as const, // lax é mais compatível para desenvolvimento (funciona com localhost)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: undefined, // Sem domínio específico - funciona para localhost e IP da rede
  path: '/'
};

// DYNAMIC COOKIE CONFIGURATION - adapts to request context
export const getDynamicCookieOptions = (req?: any) => {
  // Para desenvolvimento, usar configurações mais permissivas
  if (process.env.NODE_ENV === 'development') {
    const origin = req?.get('origin') || req?.get('referer');
    const host = req?.get('host') || req?.headers.host;
    
    // Configuração específica para cada tipo de acesso
    let cookieConfig;
    
    if (origin?.includes('ngrok') || host?.includes('ngrok') || origin?.includes('ngrok-free.app') || host?.includes('ngrok-free.app')) {
      // Acesso via ngrok - configuração para HTTPS cross-site
      cookieConfig = {
        httpOnly: true,
        secure: true, // Necessário para HTTPS
        sameSite: 'none' as const, // Necessário para cross-site com HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: undefined,
        path: '/'
      };
    } else if (origin?.includes('localhost') || host?.includes('localhost')) {
      // Acesso via localhost - usar sameSite: 'lax'
      cookieConfig = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: undefined,
        path: '/'
      };
    } else if (origin?.includes('192.168.0.252') || host?.includes('192.168.0.252')) {
      // Acesso via IP da rede - usar sameSite: 'lax' (funciona sem HTTPS)
      cookieConfig = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: undefined,
        path: '/'
      };
    } else {
      // Fallback seguro
      cookieConfig = {
        httpOnly: true,
        secure: true, // Seguro por padrão
        sameSite: 'none' as const, // Para compatibilidade cross-site
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: undefined,
        path: '/'
      };
    }
    
    // Log para debug
    console.log('🍪 Cookie config for origin:', origin, 'host:', host, {
      domain: cookieConfig.domain,
      sameSite: cookieConfig.sameSite,
      secure: cookieConfig.secure
    });
    
    return cookieConfig;
  }
  
  return { ...COOKIE_OPTIONS };
};

// CENTRALIZED SECURE COOKIE SETTER - now supports dynamic configuration
export const setSecureCookie = (res: Response, token: string, req?: any): void => {
  const cookieOptions = getDynamicCookieOptions(req);
  res.cookie('auth-token', token, cookieOptions);
};

// CENTRALIZED SECURE COOKIE CLEARER - now supports dynamic configuration
export const clearSecureCookie = (res: Response, req?: any): void => {
  const cookieOptions = getDynamicCookieOptions(req);
  res.clearCookie('auth-token', {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    domain: cookieOptions.domain,
    path: cookieOptions.path
  });
};

export const generateToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error: any) {
    // Preservar o tipo específico do erro JWT para melhor tratamento
    if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Token inválido ou expirado');
      expiredError.name = 'TokenExpiredError';
      throw expiredError;
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token malformado');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token ainda não está ativo');
    }
    
    throw new Error('Token inválido ou expirado');
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }
  return null;
};

export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return expiration < new Date();
};