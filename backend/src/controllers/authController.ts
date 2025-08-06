import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import * as googleAuthService from '../services/googleAuthService';
import { AuthenticatedRequest } from '../types/api';
import { LoginRequest, RegisterRequest } from '../types/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData: RegisterRequest = req.body;
    
    const result = await authService.registerUser(userData);
    
    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Usuário já existe com este email') {
      return res.status(409).json({
        success: false,
        error: 'Usuário já existe',
        message: 'Um usuário com este email já está cadastrado',
        timestamp: new Date().toISOString()
      });
    }
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loginData: LoginRequest = req.body;
    
    const result = await authService.loginUser(loginData);
    
    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Credenciais inválidas') {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.message.includes('login social')) {
      return res.status(409).json({
        success: false,
        error: 'Conta social',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        message: 'Token de acesso necessário',
        timestamp: new Date().toISOString()
      });
    }

    const user = await authService.getUserById(req.userId);
    
    return res.json({
      success: true,
      data: { user },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
        message: 'Usuário não existe no sistema',
        timestamp: new Date().toISOString()
      });
    }
    return next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
    }

    const updateData = req.body;
    const user = await authService.updateUserProfile(req.userId, updateData);
    
    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: { user },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  // Em um sistema com refresh tokens, aqui seria onde invalidaríamos o token
  // Por enquanto, apenas retornamos sucesso pois o logout é feito no client-side
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
    timestamp: new Date().toISOString()
  });
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  // Por enquanto, não implementaremos refresh tokens
  // O frontend pode renovar fazendo login novamente quando o token expirar
  res.status(501).json({
    success: false,
    error: 'Não implementado',
    message: 'Refresh token não implementado nesta versão',
    timestamp: new Date().toISOString()
  });
};

// Google OAuth
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const authUrl = googleAuthService.getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Erro ao iniciar autenticação Google:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=missing_code`);
    }

    // Verificar token do Google e obter dados do usuário
    const googleData = await googleAuthService.verifyGoogleToken(code);
    
    // Criar ou buscar usuário e gerar token JWT
    const { user, token } = await googleAuthService.findOrCreateGoogleUser(googleData);

    // Redirecionar para o frontend com o token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Erro no callback Google:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_callback_failed`);
  }
};