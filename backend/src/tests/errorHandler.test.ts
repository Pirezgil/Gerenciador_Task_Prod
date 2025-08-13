/**
 * Testes Unitários para o Sistema de Erro Padronizado
 * 
 * Este arquivo demonstra como testar o novo sistema de gerenciamento
 * de erros e validar se as respostas estão sendo padronizadas corretamente.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import {
  AppError,
  ErrorCode,
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  mapLegacyErrorMessage,
  isErrorType,
  HttpStatusMapping
} from '../lib/errors';
import { errorHandler, notFoundHandler, throwAppError, assertResourceExists } from '../middleware/errorHandler';

// ===== MOCKS =====

const mockRequest = (overrides = {}): Partial<Request> => ({
  originalUrl: '/api/test',
  method: 'GET',
  get: jest.fn().mockReturnValue('test-user-agent'),
  ...overrides
});

const mockResponse = (): Partial<Response> => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = (): NextFunction => jest.fn();

// ===== TESTES DAS FACTORY FUNCTIONS =====

describe('Factory Functions', () => {
  describe('createSuccessResponse', () => {
    it('deve criar resposta de sucesso com dados', () => {
      const data = { id: '123', name: 'test' };
      const message = 'Operação realizada com sucesso';
      const meta = { total: 1 };

      const response = createSuccessResponse(data, message, meta);

      expect(response).toMatchObject({
        success: true,
        message,
        data,
        meta,
        timestamp: expect.any(String)
      });
    });

    it('deve criar resposta de sucesso sem dados opcionais', () => {
      const response = createSuccessResponse();

      expect(response).toMatchObject({
        success: true,
        timestamp: expect.any(String)
      });
      expect(response.message).toBeUndefined();
      expect(response.data).toBeUndefined();
      expect(response.meta).toBeUndefined();
    });
  });

  describe('createErrorResponse', () => {
    it('deve criar resposta de erro com todos os campos', () => {
      const errorCode = ErrorCode.TASK_NOT_FOUND;
      const context = 'test_context';
      const field = 'taskId';
      const details = { additional: 'info' };

      const response = createErrorResponse(errorCode, context, field, details);

      expect(response).toMatchObject({
        success: false,
        error: {
          code: errorCode,
          message: expect.any(String),
          field,
          context,
          details
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('createValidationErrorResponse', () => {
    it('deve criar resposta de erro de validação', () => {
      const errors = [
        { field: 'email', message: 'Email é obrigatório', code: 'required' },
        { field: 'password', message: 'Senha muito curta', code: 'min_length' }
      ];
      const message = 'Dados inválidos';

      const response = createValidationErrorResponse(errors, message);

      expect(response).toMatchObject({
        success: false,
        message,
        error: {
          code: ErrorCode.VALIDATION_FAILED,
          message: expect.any(String),
          details: errors
        },
        timestamp: expect.any(String)
      });
    });
  });
});

// ===== TESTES DA CLASSE APPERROR =====

describe('AppError Class', () => {
  it('deve criar AppError com código específico', () => {
    const error = new AppError(ErrorCode.TASK_NOT_FOUND, 'Custom message', 'taskId', 'test_context', { extra: 'data' });

    expect(error.code).toBe(ErrorCode.TASK_NOT_FOUND);
    expect(error.statusCode).toBe(HttpStatusMapping[ErrorCode.TASK_NOT_FOUND]);
    expect(error.field).toBe('taskId');
    expect(error.context).toBe('test_context');
    expect(error.details).toEqual({ extra: 'data' });
    expect(error.message).toBe('Custom message');
  });

  it('deve usar mensagem padrão se não fornecida', () => {
    const error = new AppError(ErrorCode.AUTH_REQUIRED);

    expect(error.message).toBe('Acesso negado. Faça login para continuar.');
  });

  it('deve converter para ApiResponse', () => {
    const error = new AppError(ErrorCode.VALIDATION_FAILED, 'Test message', 'field', 'context');
    const response = error.toApiResponse();

    expect(response).toMatchObject({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Test message',
        field: 'field',
        context: 'context'
      }
    });
  });
});

// ===== TESTES DO ERROR HANDLER =====

describe('Error Handler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    
    // Limpar mocks
    jest.clearAllMocks();
    
    // Mock do console.error para evitar logs nos testes
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve tratar AppError corretamente', () => {
    const appError = new AppError(ErrorCode.TASK_NOT_FOUND, 'Test message');
    
    errorHandler(appError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.TASK_NOT_FOUND,
          message: 'Test message'
        })
      })
    );
  });

  it('deve tratar ZodError corretamente', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['email'],
        message: 'Expected string, received number'
      }
    ]);
    
    errorHandler(zodError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.VALIDATION_FAILED,
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'Expected string, received number'
            })
          ])
        })
      })
    );
  });

  it('deve tratar Prisma P2002 (unique constraint)', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`)',
      {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] }
      }
    );
    
    errorHandler(prismaError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.RESOURCE_ALREADY_EXISTS
        })
      })
    );
  });

  it('deve tratar Prisma P2025 (record not found)', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Record to update not found.',
      {
        code: 'P2025',
        clientVersion: '5.0.0'
      }
    );
    
    errorHandler(prismaError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.RESOURCE_NOT_FOUND
        })
      })
    );
  });

  it('deve mapear erros legacy', () => {
    const legacyError = new Error('Usuário não encontrado');
    
    errorHandler(legacyError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.AUTH_USER_NOT_FOUND
        })
      })
    );
  });

  it('deve tratar erros genéricos', () => {
    const genericError = new Error('Unexpected error');
    
    errorHandler(genericError, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.INTERNAL_SERVER_ERROR
        })
      })
    );
  });
});

// ===== TESTES DOS HELPERS =====

describe('Helper Functions', () => {
  describe('mapLegacyErrorMessage', () => {
    it('deve mapear mensagens conhecidas', () => {
      expect(mapLegacyErrorMessage('Usuário já existe com este email')).toBe(ErrorCode.AUTH_USER_EXISTS);
      expect(mapLegacyErrorMessage('Credenciais inválidas')).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      expect(mapLegacyErrorMessage('Tarefa não encontrada')).toBe(ErrorCode.TASK_NOT_FOUND);
    });

    it('deve retornar INTERNAL_SERVER_ERROR para mensagens desconhecidas', () => {
      expect(mapLegacyErrorMessage('Mensagem desconhecida')).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });
  });

  describe('throwAppError', () => {
    it('deve lançar AppError', () => {
      expect(() => {
        throwAppError(ErrorCode.TASK_NOT_FOUND, 'Test message');
      }).toThrow(AppError);

      try {
        throwAppError(ErrorCode.TASK_NOT_FOUND, 'Test message');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.TASK_NOT_FOUND);
      }
    });
  });

  describe('assertResourceExists', () => {
    it('não deve lançar erro se resource existe', () => {
      expect(() => {
        assertResourceExists({ id: '123' }, ErrorCode.TASK_NOT_FOUND);
      }).not.toThrow();
    });

    it('deve lançar erro se resource é null/undefined', () => {
      expect(() => {
        assertResourceExists(null, ErrorCode.TASK_NOT_FOUND);
      }).toThrow(AppError);

      expect(() => {
        assertResourceExists(undefined, ErrorCode.TASK_NOT_FOUND);
      }).toThrow(AppError);
    });
  });

  describe('isErrorType', () => {
    it('deve identificar tipo de erro corretamente', () => {
      const error = new AppError(ErrorCode.TASK_NOT_FOUND);
      
      expect(isErrorType(error, ErrorCode.TASK_NOT_FOUND)).toBe(true);
      expect(isErrorType(error, ErrorCode.AUTH_REQUIRED)).toBe(false);
      expect(isErrorType(new Error('regular error'), ErrorCode.TASK_NOT_FOUND)).toBe(false);
    });
  });
});

// ===== TESTES DO NOT FOUND HANDLER =====

describe('Not Found Handler', () => {
  it('deve retornar 404 para rotas não encontradas', () => {
    const req = mockRequest({ originalUrl: '/api/nonexistent', method: 'POST' });
    const res = mockResponse();
    
    notFoundHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.RESOURCE_NOT_FOUND,
          details: expect.objectContaining({
            requestedUrl: '/api/nonexistent',
            method: 'POST'
          })
        })
      })
    );
  });
});

// ===== TESTES DE INTEGRAÇÃO =====

describe('Integration Tests', () => {
  it('deve manter consistência entre ErrorCode e HttpStatusMapping', () => {
    // Verificar se todos os códigos de erro têm mapping de status HTTP
    Object.values(ErrorCode).forEach(code => {
      expect(HttpStatusMapping[code]).toBeDefined();
      expect(typeof HttpStatusMapping[code]).toBe('number');
      expect(HttpStatusMapping[code]).toBeGreaterThanOrEqual(400);
      expect(HttpStatusMapping[code]).toBeLessThan(600);
    });
  });

  it('deve criar respostas consistentes entre factory functions e AppError', () => {
    const errorCode = ErrorCode.TASK_NOT_FOUND;
    const context = 'test';
    const field = 'taskId';
    
    const appError = new AppError(errorCode, undefined, field, context);
    const factoryResponse = createErrorResponse(errorCode, context, field);
    const appErrorResponse = appError.toApiResponse();
    
    // As respostas devem ter a mesma estrutura
    expect(appErrorResponse.success).toBe(factoryResponse.success);
    expect(appErrorResponse.error?.code).toBe(factoryResponse.error?.code);
    expect(appErrorResponse.error?.field).toBe(factoryResponse.error?.field);
    expect(appErrorResponse.error?.context).toBe(factoryResponse.error?.context);
  });
});