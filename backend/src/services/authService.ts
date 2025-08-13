import bcrypt from 'bcrypt';
import { prisma } from '../app';
import { generateToken } from '../lib/jwt';
import { LoginRequest, RegisterRequest, AuthUser } from '../types/auth';
import { AppError, ErrorCode } from '../lib/errors';

// Interface interna para retornar dados completos (incluindo token)
export interface AuthServiceResponse {
  user: AuthUser;
  token: string;
  expiresIn: string;
}

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export const registerUser = async (data: RegisterRequest): Promise<AuthServiceResponse> => {
  const { name, email, password } = data;
  const startTime = Date.now();

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    // Fazer hash dummy para manter timing consistente
    await bcrypt.hash('dummy-password-for-timing', BCRYPT_ROUNDS);
    
    // Tempo mínimo para prevenir timing attacks
    const elapsedTime = Date.now() - startTime;
    const minimumTime = 150;
    if (elapsedTime < minimumTime) {
      await new Promise(resolve => setTimeout(resolve, minimumTime - elapsedTime));
    }
    
    // Usar código de erro apropriado para usuário existente
    throw new AppError(ErrorCode.AUTH_USER_EXISTS, undefined, 'email', 'user_registration');
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Criar usuário e configurações padrão
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      settings: {
        create: {
          dailyEnergyBudget: 12,
          theme: 'light',
          timezone: 'America/Sao_Paulo',
          notifications: true,
          sandboxEnabled: false
        }
      },
      sandboxAuth: {
        create: {
          isUnlocked: false,
          failedAttempts: 0
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      settings: {
        select: {
          dailyEnergyBudget: true,
          theme: true,
          timezone: true,
          notifications: true,
          sandboxEnabled: true,
          sandboxPassword: true
        }
      }
    }
  });

  // Gerar token
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl,
      settings: user.settings || {
        dailyEnergyBudget: 12,
        theme: 'light',
        timezone: 'America/Sao_Paulo',
        notifications: true,
        sandboxEnabled: false
      },
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    } as AuthUser,
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };
};

export const loginUser = async (data: LoginRequest): Promise<AuthServiceResponse> => {
  const { email, password } = data;
  const startTime = Date.now();

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      googleId: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      settings: {
        select: {
          dailyEnergyBudget: true,
          theme: true,
          timezone: true,
          notifications: true,
          sandboxEnabled: true,
          sandboxPassword: true
        }
      }
    }
  });

  // SEMPRE fazer hash check para manter timing consistente
  const dummyHash = '$2b$12$dummyHashForTimingConsistencyWithProperLength..';
  const isValidPassword = user?.password ? 
    await bcrypt.compare(password, user.password) : 
    await bcrypt.compare(password, dummyHash);

  // Tempo mínimo para prevenir timing attacks
  const elapsedTime = Date.now() - startTime;
  const minimumTime = 150; // 150ms mínimo
  if (elapsedTime < minimumTime) {
    await new Promise(resolve => setTimeout(resolve, minimumTime - elapsedTime));
  }

  // Verificações unificadas com mensagem genérica
  if (!user || !user.password || !isValidPassword) {
    throw new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, undefined, undefined, 'user_login');
  }

  // Verificar se é conta social (apenas para usuários válidos)
  if (!user.password && user.googleId) {
    throw new AppError(ErrorCode.AUTH_SOCIAL_ACCOUNT, undefined, undefined, 'user_login');
  }

  // SESSION FIXATION PROTECTION: Update user's last login to invalidate any existing sessions
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      updatedAt: new Date() // Forces session regeneration by updating timestamp
    }
  });

  // SESSION FIXATION PROTECTION: Generate fresh token with current timestamp
  // This ensures any old tokens become invalid due to timing checks
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl,
      settings: user.settings || {
        dailyEnergyBudget: 15,
        theme: 'light',
        timezone: 'America/Sao_Paulo',
        notifications: true,
        sandboxEnabled: false
      },
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    } as AuthUser,
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };
};

export const getUserById = async (userId: string): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      settings: {
        select: {
          dailyEnergyBudget: true,
          theme: true,
          timezone: true,
          notifications: true,
          sandboxEnabled: true,
          sandboxPassword: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError(ErrorCode.AUTH_USER_NOT_FOUND, undefined, undefined, 'user_profile');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatarUrl,
    settings: user.settings || {
      dailyEnergyBudget: 15,
      theme: 'light',
      timezone: 'America/Sao_Paulo',
      notifications: true,
      sandboxEnabled: false
    },
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  } as AuthUser;
};

export const updateUserProfile = async (userId: string, data: { name?: string; avatarUrl?: string }): Promise<AuthUser> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      settings: {
        select: {
          dailyEnergyBudget: true,
          theme: true,
          timezone: true,
          notifications: true,
          sandboxEnabled: true,
          sandboxPassword: true
        }
      }
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatarUrl,
    settings: user.settings || {
      dailyEnergyBudget: 15,
      theme: 'light',
      timezone: 'America/Sao_Paulo',
      notifications: true,
      sandboxEnabled: false
    },
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  } as AuthUser;
};