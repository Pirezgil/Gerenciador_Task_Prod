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
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // lax works for localhost
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: undefined, // no domain for localhost compatibility
  path: '/'
};

// CENTRALIZED SECURE COOKIE SETTER
export const setSecureCookie = (res: Response, token: string): void => {
  res.cookie('auth-token', token, COOKIE_OPTIONS);
};

// CENTRALIZED SECURE COOKIE CLEARER  
export const clearSecureCookie = (res: Response): void => {
  res.clearCookie('auth-token', {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
    domain: COOKIE_OPTIONS.domain,
    path: COOKIE_OPTIONS.path
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