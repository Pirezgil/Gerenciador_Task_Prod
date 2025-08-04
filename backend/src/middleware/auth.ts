import { Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { prisma } from '../app';
import { AuthenticatedRequest } from '../types/api';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de autorização não fornecido',
        message: 'Acesso negado. Token necessário.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Formato do token incorreto'
      });
    }

    // Verificar e decodar o token
    const decoded = verifyToken(token);
    
    if (!decoded.userId) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token não contém ID do usuário'
      });
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
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Token válido mas usuário não existe'
      });
    }

    // Adicionar dados do usuário à requisição
    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    return next();
  } catch (error: any) {
    console.error('Erro na autenticação:', error);
    
    if (error.message === 'Token inválido ou expirado') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Faça login novamente'
      });
    }

    return res.status(401).json({
      error: 'Falha na autenticação',
      message: 'Token inválido'
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }

  try {
    await authenticate(req, res, next);
  } catch (error) {
    // Em caso de erro na autenticação opcional, continua sem user
    return next();
  }
};