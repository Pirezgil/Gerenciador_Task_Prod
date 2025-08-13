import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../app';
import { generateToken } from '../lib/jwt';
import { User } from '@prisma/client';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export const getGoogleAuthUrl = (): string => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  return url;
};

export const verifyGoogleToken = async (code: string): Promise<GoogleUserData> => {
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Token payload inválido');
    }

    return {
      id: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
      email_verified: payload.email_verified || false
    };
  } catch (error) {
    console.error('Erro ao verificar token Google:', error);
    throw new Error('Token Google inválido');
  }
};

export const findOrCreateGoogleUser = async (googleData: GoogleUserData): Promise<{ user: User; token: string }> => {
  try {
    // Verificar se o usuário já existe
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: googleData.email },
          { googleId: googleData.id }
        ]
      }
    });

    // Se não existe, criar novo usuário
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleData.email,
          name: googleData.name,
          googleId: googleData.id,
          avatarUrl: googleData.picture,
          emailVerified: googleData.email_verified,
          // Não definir senha para usuários do Google OAuth
          password: null,
          settings: {
            create: {
              dailyEnergyBudget: 15,
              theme: 'light',
              timezone: 'America/Sao_Paulo',
              notifications: true,
              sandboxEnabled: false
            }
          }
        }
      });
    } else {
      // SESSION FIXATION PROTECTION: Update timestamp for existing users
      // Se existe, atualizar dados do Google (preservando senha existente)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleData.id,
          avatarUrl: googleData.picture || user.avatarUrl,
          emailVerified: googleData.email_verified,
          name: googleData.name || user.name,
          updatedAt: new Date() // Forces session regeneration
          // Não alteramos o password - usuário híbrido pode usar ambos os métodos
        }
      });
    }

    // SESSION FIXATION PROTECTION: Generate fresh token for OAuth login
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return { user, token };
  } catch (error) {
    console.error('Erro ao criar/buscar usuário Google:', error);
    throw new Error('Erro interno do servidor');
  }
};