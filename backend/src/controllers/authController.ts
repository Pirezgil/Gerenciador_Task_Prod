import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import * as googleAuthService from '../services/googleAuthService';
import * as passwordResetService from '../services/passwordResetService';
import { AuthenticatedRequest } from '../types/api';
import { LoginRequest, RegisterRequest, AuthResponseClean } from '../types/auth';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode
} from '../lib/errors';
import { setSecureCookie, clearSecureCookie } from '../lib/jwt';
import { throwAppError, assertResourceExists } from '../middleware/errorHandler';
import { clearAuthAttempts } from '../middleware/authRateLimit';
import { clearPasswordResetAttempts } from '../middleware/passwordResetRateLimit';
import secureLogger from '../lib/secureLogger';
import { logAuthEvent } from '../services/securityMonitorService';

// Cookie configuration moved to centralized jwt.ts for consistency

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userData: RegisterRequest = req.body;
    
    const result = await authService.registerUser(userData);
    
    // Limpar tentativas de rate limiting após registro bem-sucedido
    clearAuthAttempts(req);
    
    // CORREÇÃO: Configurar cookie seguro após registro
    setSecureCookie(res, result.token);
    
    // ETAPA 4: Log de segurança estruturado para registro
    await logAuthEvent('login_success', result.user.id, {
      email: userData.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    secureLogger.info('User registration successful', {
      userId: result.user.id,
      email: userData.email,
      method: req.method,
      url: req.originalUrl
    });
    
    // Resposta limpa - token apenas via cookie
    const response = createSuccessResponse(
      { user: result.user } as AuthResponseClean,
      'Usuário criado com sucesso'
    );
    
    res.status(201).json(response);
  } catch (error: any) {
    // Log de falha na autenticação (será sanitizado em produção)
    secureLogger.warn('User registration failed', {
      email: req.body.email,
      method: req.method,
      url: req.originalUrl,
      error: error.message
    });
    
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loginData: LoginRequest = req.body;
    
    const result = await authService.loginUser(loginData);
    
    // Limpar tentativas de rate limiting após login bem-sucedido
    clearAuthAttempts(req);
    
    // CORREÇÃO: Configurar cookie seguro após login
    setSecureCookie(res, result.token);
    
    // ETAPA 4: Log de segurança estruturado
    await logAuthEvent('login_success', result.user.id, {
      email: loginData.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    secureLogger.info('User login successful', {
      userId: result.user.id,
      email: loginData.email,
      method: req.method,
      url: req.originalUrl
    });
    
    // Resposta limpa - token apenas via cookie
    const response = createSuccessResponse(
      { user: result.user } as AuthResponseClean,
      'Login realizado com sucesso'
    );
    
    res.json(response);
  } catch (error: any) {
    // ETAPA 4: Log estruturado de falha de autenticação
    await logAuthEvent('login_failed', undefined, {
      email: req.body.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      reason: error.message
    });
    
    secureLogger.warn('User login failed', {
      email: req.body.email,
      method: req.method,
      url: req.originalUrl,
      error: error.message
    });
    
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      throwAppError(ErrorCode.AUTH_REQUIRED, 'Token de acesso necessário');
    }

    const user = await authService.getUserById(req.userId!);
    assertResourceExists(user, ErrorCode.AUTH_USER_NOT_FOUND, 'user_profile');
    
    const response = createSuccessResponse({ user });
    res.json(response);
  } catch (error: any) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      throwAppError(ErrorCode.AUTH_REQUIRED);
    }

    const updateData = req.body;
    const user = await authService.updateUserProfile(req.userId!, updateData);
    
    const response = createSuccessResponse(
      { user },
      'Perfil atualizado com sucesso'
    );
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // CONSISTENCY FIX: Use centralized cookie clearing function
  clearSecureCookie(res);
  
  // LOOP PREVENTION: Add cache control headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const response = createSuccessResponse(
    undefined,
    'Logout realizado com sucesso'
  );
  
  res.json(response);
};

export const refreshToken = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  // Por enquanto, não implementaremos refresh tokens
  // O frontend pode renovar fazendo login novamente quando o token expirar
  const response = createErrorResponse(
    ErrorCode.NOT_IMPLEMENTED,
    'refresh_token',
    undefined,
    'Refresh token não implementado nesta versão'
  );
  
  res.status(501).json(response);
};

// Google OAuth
export const googleAuth = async (_req: Request, res: Response): Promise<void> => {
  try {
    const authUrl = googleAuthService.getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Erro ao iniciar autenticação Google:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
  }
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      res.redirect(`${process.env.FRONTEND_URL}/auth?error=missing_code`);
      return;
    }

    // Verificar token do Google e obter dados do usuário
    const googleData = await googleAuthService.verifyGoogleToken(code);
    
    // Criar ou buscar usuário e gerar token JWT
    const { user, token } = await googleAuthService.findOrCreateGoogleUser(googleData);

    // SECURITY FIX: Set HTTP-only cookie instead of exposing token in URL
    setSecureCookie(res, token);
    
    // SECURITY FIX: Log successful OAuth login
    await logAuthEvent('oauth_login_success', user.id, {
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    secureLogger.info('Google OAuth login successful', {
      userId: user.id,
      email: user.email,
      method: 'oauth_google',
      ip: req.ip
    });

    // Redirect to frontend without sensitive data in URL
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?success=true`);
    
  } catch (error) {
    console.error('Erro no callback Google:', error);
    
    // Log failed OAuth attempt
    secureLogger.warn('Google OAuth callback failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_callback_failed`);
  }
};

// Password Reset Endpoints
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throwAppError(ErrorCode.VALIDATION_MISSING_FIELD, 'Email é obrigatório');
    }

    await passwordResetService.requestPasswordReset({ email });

    // Clear rate limiting attempts on successful request
    clearPasswordResetAttempts(req);

    // Log security event
    secureLogger.info('Password reset requested', {
      email,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    const response = createSuccessResponse(
      undefined,
      'Se este email estiver cadastrado, você receberá um link para redefinir sua senha'
    );

    res.json(response);
  } catch (error: any) {
    // Log security event for failed attempts
    secureLogger.warn('Password reset request failed', {
      email: req.body.email,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      error: error.message
    });

    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      throwAppError(ErrorCode.VALIDATION_MISSING_FIELD, 'Token, senha e confirmação são obrigatórios');
    }

    await passwordResetService.resetPassword({ token, password, confirmPassword });

    // Log security event
    secureLogger.info('Password reset successful', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    const response = createSuccessResponse(
      undefined,
      'Senha redefinida com sucesso. Você pode fazer login com a nova senha'
    );

    res.json(response);
  } catch (error: any) {
    // Log security event for failed attempts
    secureLogger.warn('Password reset failed', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      error: error.message
    });

    next(error);
  }
};

export const validateResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throwAppError(ErrorCode.VALIDATION_MISSING_FIELD, 'Token é obrigatório');
    }

    const isValid = await passwordResetService.validateResetToken(token);

    const response = createSuccessResponse(
      { valid: isValid },
      isValid ? 'Token válido' : 'Token inválido ou expirado'
    );

    res.json(response);
  } catch (error: any) {
    next(error);
  }
};