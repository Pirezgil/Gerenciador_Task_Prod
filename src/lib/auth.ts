import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido');
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Token inválido');
    }

    // Verificar e decodar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
    
    if (!decoded.userId) {
      throw new Error('Token não contém ID do usuário');
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  } catch (error: any) {
    console.error('Erro na autenticação:', error);
    throw error;
  }
}