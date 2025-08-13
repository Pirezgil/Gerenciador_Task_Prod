import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { 
  AppError, 
  ErrorCode, 
  createErrorResponse, 
  createValidationErrorResponse,
  mapLegacyErrorMessage,
  getErrorDebugInfo,
  ApiResponse
} from '../lib/errors';

// ===== FUNÇÕES AUXILIARES DE SEGURANÇA =====

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Error Handler Unificado e Robusto
 * 
 * Processa todos os tipos de erro de forma padronizada:
 * - Erros customizados (AppError)
 * - Erros de validação (Zod)
 * - Erros do Prisma
 * - Erros genéricos
 * 
 * Retorna sempre uma resposta no formato ApiResponse
 */
export const errorHandler = (
  error: CustomError | ZodError | Prisma.PrismaClientKnownRequestError | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log estruturado para debugging
  const logContext = {
    message: error.message,
    name: error.name,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    userId: (req as any).userId || 'anonymous',
    userAgent: req.get('User-Agent') || 'unknown',
    debugInfo: getErrorDebugInfo(error)
  };

  console.error('❌ [ERROR_HANDLER] Erro capturado:', logContext);

  // 1. Erro customizado do sistema (AppError)
  if (error instanceof AppError) {
    const response = error.toApiResponse();
    res.status(error.statusCode).json(response);
    return;
  }

  // 2. Erro de validação do Zod
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    const response = createValidationErrorResponse(
      validationErrors,
      'Dados fornecidos são inválidos'
    );
    
    res.status(400).json(response);
    return;
  }

  // 3. Erros específicos do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let response: ApiResponse;
    
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        response = createErrorResponse(
          ErrorCode.RESOURCE_ALREADY_EXISTS,
          'Prisma unique constraint',
          error.meta?.target as string,
          { prismaCode: error.code, meta: error.meta }
        );
        res.status(409).json(response);
        return;

      case 'P2025': // Record not found
        response = createErrorResponse(
          ErrorCode.RESOURCE_NOT_FOUND,
          'Prisma record not found',
          undefined,
          { prismaCode: error.code, meta: error.meta }
        );
        res.status(404).json(response);
        return;

      case 'P2003': // Foreign key constraint violation
        response = createErrorResponse(
          ErrorCode.VALIDATION_CONSTRAINT_VIOLATION,
          'Prisma foreign key violation',
          error.meta?.field_name as string,
          { prismaCode: error.code, meta: error.meta }
        );
        res.status(400).json(response);
        return;

      case 'P2014': // Invalid ID
        response = createErrorResponse(
          ErrorCode.VALIDATION_INVALID_FORMAT,
          'Prisma invalid ID',
          'id',
          { prismaCode: error.code }
        );
        res.status(400).json(response);
        return;

      case 'P1008': // Operations timed out
        response = createErrorResponse(
          ErrorCode.DATABASE_ERROR,
          'Prisma timeout',
          undefined,
          { prismaCode: error.code }
        );
        res.status(500).json(response);
        return;

      default:
        console.warn(`⚠️ [ERROR_HANDLER] Prisma error não mapeado: ${error.code}`);
        response = createErrorResponse(
          ErrorCode.DATABASE_ERROR,
          'Prisma unknown error',
          undefined,
          { 
            prismaCode: error.code, 
            meta: error.meta,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          }
        );
        res.status(500).json(response);
        return;
    }
  }

  // 4. Erros de Rate Limiting (se implementado)
  if (error.name === 'TooManyRequestsError' || error.message.includes('rate limit')) {
    const response = createErrorResponse(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limiting',
      undefined,
      { retryAfter: (error as any).retryAfter }
    );
    res.status(429).json(response);
    return;
  }

  // 5. Tentativa de mapear erros legacy (compatibilidade)
  if (error.message) {
    const mappedCode = mapLegacyErrorMessage(error.message);
    if (mappedCode !== ErrorCode.INTERNAL_SERVER_ERROR) {
      const response = createErrorResponse(
        mappedCode,
        'Legacy error mapping',
        undefined,
        { originalMessage: error.message }
      );
      // Use status code from mapping
      const statusCode = require('../lib/errors').HttpStatusMapping[mappedCode];
      res.status(statusCode).json(response);
      return;
    }
  }

  // 6. Erro com statusCode personalizado (legacy)
  if ('statusCode' in error && error.statusCode && typeof error.statusCode === 'number') {
    const response = createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Internal server error',
      undefined,
      { 
        // REMOVIDO: originalStatusCode - pode vazar informações
        // REMOVIDO: details - pode vazar mensagem técnica
        timestamp: Date.now()
      }
    );
    res.status(error.statusCode).json(response);
    return;
  }

  // 7. Erro genérico/não tratado
  console.error('🚨 [ERROR_HANDLER] Erro não tratado:', {
    type: error.constructor.name,
    message: error.message,
    stack: error.stack
  });

  const response = createErrorResponse(
    ErrorCode.INTERNAL_SERVER_ERROR,
    'Unhandled error',
    undefined,
    {
      type: error.constructor.name,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  );

  res.status(500).json(response);
};

// ===== MIDDLEWARE PARA TRATAMENTO DE 404 =====

/**
 * Handler para rotas não encontradas
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const response = createErrorResponse(
    ErrorCode.RESOURCE_NOT_FOUND,
    'Route not found',
    'route',
    { 
      requestedUrl: req.originalUrl,
      method: req.method
    }
  );
  
  res.status(404).json(response);
};

// ===== HELPER FUNCTIONS PARA CONTROLLERS =====

/**
 * Helper para lançar erros padronizados nos controllers
 */
export function throwAppError(
  code: ErrorCode,
  message?: string,
  field?: string,
  context?: string,
  details?: any
): never {
  throw new AppError(code, message, field, context, details);
}

/**
 * Helper para verificar e lançar erro de recurso não encontrado
 */
export function assertResourceExists(
  resource: any,
  errorCode: ErrorCode,
  context?: string
): void {
  if (!resource) {
    throw new AppError(errorCode, undefined, undefined, context);
  }
}

/**
 * Helper para verificar autorização do usuário
 */
export function assertUserOwnership(
  resourceUserId: string,
  requestUserId: string,
  errorCode: ErrorCode = ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS
): void {
  if (resourceUserId !== requestUserId) {
    throw new AppError(errorCode, undefined, undefined, 'ownership_check');
  }
}