import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: CustomError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Erro capturado:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Erro de validação do Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Erros do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Violação de restrição única',
          details: 'Um registro com esses dados já existe'
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Registro não encontrado',
          details: 'O registro solicitado não existe'
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Violação de chave estrangeira',
          details: 'Referência inválida a outro registro'
        });
      default:
        return res.status(500).json({
          error: 'Erro interno do banco de dados',
          details: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
        });
    }
  }

  // Erro personalizado
  if ('statusCode' in error && error.statusCode) {
    return res.status(error.statusCode).json({
      error: error.message || 'Erro interno do servidor'
    });
  }

  // Erro genérico
  return res.status(500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
  });
};