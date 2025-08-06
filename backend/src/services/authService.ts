import bcrypt from 'bcrypt';
import { prisma } from '../app';
import { generateToken } from '../lib/jwt';
import { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from '../types/auth';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const { name, email, password } = data;

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Usuário já existe com este email');
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

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const { email, password } = data;

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

  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  // Verificar se o usuário tem senha
  if (!user.password) {
    throw new Error('Esta conta foi criada com login social. Use a opção de login com Google.');
  }

  // Verificar senha
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Credenciais inválidas');
  }

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
    throw new Error('Usuário não encontrado');
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