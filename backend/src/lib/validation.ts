import { z } from 'zod';

// ETAPA 3: Validação rigorosa de entrada (P2)
// Proteção contra ataques de injeção e dados maliciosos

// SECURITY: Sanitização adicional de inputs
export const sanitizeInput = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres perigosos
    .substring(0, 1000);   // Limita tamanho
};

// SECURITY: Validação de UUID
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ===== AUTH SCHEMAS =====

export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .max(254, 'Email muito longo') // RFC 5321 limit
    .toLowerCase()
    .trim()
    // Proteção contra injeção
    .refine(val => !val.includes('<') && !val.includes('>') && !val.includes('"'), {
      message: 'Email contém caracteres inválidos'
    }),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(128, 'Senha muito longa') // Limite de segurança
    // Proteção contra caracteres maliciosos
    .refine(val => !/[<>"'`]/.test(val), {
      message: 'Senha contém caracteres inválidos'
    })
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim()
    // Apenas letras, números, espaços e alguns caracteres especiais
    .regex(/^[a-zA-Z0-9À-ſ\s.'-]+$/, 'Nome contém caracteres não permitidos')
    // Proteção contra XSS e injeção
    .refine(val => !/[<>"'`{}\[\]\\]/.test(val), {
      message: 'Nome contém caracteres inválidos'
    }),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .max(254, 'Email muito longo')
    .toLowerCase()
    .trim()
    .refine(val => !val.includes('<') && !val.includes('>') && !val.includes('"'), {
      message: 'Email contém caracteres inválidos'
    }),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres') // Fortalecido
    .max(128, 'Senha muito longa')
    // Senha forte obrigatória
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 
           'Senha deve conter: letra minúscula, maiúscula, número e símbolo')
    // Proteção contra caracteres perigosos
    .refine(val => !/[<>"'`]/.test(val), {
      message: 'Senha contém caracteres inválidos'
    })
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .max(254, 'Email muito longo')
    .toLowerCase()
    .trim()
    // Proteção adicional
    .refine(val => !val.includes('<') && !val.includes('>') && !val.includes('"'), {
      message: 'Email contém caracteres inválidos'
    })
});

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Token é obrigatório'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

// ===== TASK SCHEMAS =====

export const createTaskSchema = z.object({
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(1000, 'Descrição muito longa')
    .trim()
    // SECURITY: Proteção contra XSS e injeção
    .refine(val => !/[<>"'`{}\[\]\\]/.test(val), {
      message: 'Descrição contém caracteres inválidos'
    }),
  energyPoints: z.number()
    .int('Pontos de energia devem ser um número inteiro')
    .min(1, 'Mínimo 1 ponto')
    .max(5, 'Máximo 5 pontos')
    .refine(val => [1, 3, 5].includes(val), 'Pontos de energia devem ser 1, 3 ou 5'),
  type: z.string().min(1, 'Tipo é obrigatório').max(50, 'Tipo muito longo').optional().default('task'),
  projectId: z.string()
    .min(1, 'ID de projeto inválido')
    .regex(/^[a-zA-Z0-9]+$/, 'ID de projeto deve conter apenas caracteres alfanuméricos')
    .optional(),
  dueDate: z.string()
    .datetime('Data inválida')
    .optional()
    .transform(val => val ? new Date(val) : undefined),
  isRecurring: z.boolean().optional().default(false),
  isAppointment: z.boolean().optional().default(false),
  externalLinks: z.array(z.string()).optional().default([]),
  comments: z.array(z.object({
    author: z.string().min(1, 'Autor é obrigatório').max(100, 'Nome do autor muito longo'),
    content: z.string().min(1, 'Conteúdo é obrigatório').max(1000, 'Comentário muito longo')
  })).optional().default([]),
  attachments: z.array(z.object({
    name: z.string().min(1, 'Nome do arquivo é obrigatório').max(255, 'Nome muito longo'),
    url: z.string().min(1, 'URL é obrigatória'),
    type: z.string().min(1, 'Tipo é obrigatório'),
    size: z.string().min(1, 'Tamanho é obrigatório')
  })).optional().default([]),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'custom']),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional()
  }).optional(),
  appointment: z.object({
    scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (HH:MM)'),
    preparationTime: z.number().min(0).optional().default(0),
    location: z.string().max(200, 'Localização muito longa').optional(),
    notes: z.string().max(500, 'Notas muito longas').optional(),
    reminderTime: z.number().min(0).optional()
  }).optional()
});

export const updateTaskSchema = z.object({
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(1000, 'Descrição muito longa')
    .trim()
    .optional(),
  status: z.string()
    .transform(val => val?.toLowerCase()) // Normalizar para minúsculo
    .refine(val => !val || ['pending', 'in_progress', 'completed', 'postponed'].includes(val), 
      'Status deve ser: pending, in_progress, completed ou postponed')
    .optional(),
  energyPoints: z.number()
    .int('Pontos de energia devem ser um número inteiro')
    .refine(val => [1, 3, 5].includes(val), 'Pontos de energia devem ser 1, 3 ou 5')
    .optional(),
  type: z.string().min(1, 'Tipo é obrigatório').max(50, 'Tipo muito longo').optional(),
  projectId: z.string().min(1, 'ID do projeto inválido').nullable().optional(),
  dueDate: z.string().nullable().optional(),
  rescheduleDate: z.string().nullable().optional(),
  isRecurring: z.boolean().optional(),
  isAppointment: z.boolean().optional(),
  plannedForToday: z.boolean().optional(),
  externalLinks: z.array(z.string().url('URL inválida')).optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'custom']),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional()
  }).nullable().optional(),
  appointment: z.object({
    scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (HH:MM)'),
    preparationTime: z.number().min(0).optional().default(0),
    location: z.string().max(200, 'Localização muito longa').optional(),
    notes: z.string().max(500, 'Notas muito longas').optional(),
    reminderTime: z.number().min(0).optional()
  }).nullable().optional(),
  attachments: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Nome do arquivo é obrigatório').max(255, 'Nome muito longo'),
    url: z.string().min(1, 'URL é obrigatória'),
    type: z.string().min(1, 'Tipo é obrigatório'),
    size: z.string().min(1, 'Tamanho é obrigatório')
  })).optional()
});

export const postponeTaskSchema = z.object({
  reason: z.string().max(500, 'Motivo muito longo').optional(),
  newDate: z.string().optional()
});

export const completeTaskSchema = z.object({
  completedAt: z.string().optional()
});

// ============================================================================
// ATTACHMENT SCHEMAS
// ============================================================================

export const createAttachmentSchema = z.object({
  name: z.string().min(1, 'Nome do arquivo é obrigatório').max(255, 'Nome muito longo'),
  url: z.string().min(1, 'URL é obrigatória'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  size: z.string().min(1, 'Tamanho é obrigatório')
});

export const deleteAttachmentSchema = z.object({
  // Validation será feita nos params da URL
});

export const createTaskCommentSchema = z.object({
  author: z.string()
    .min(1, 'Autor é obrigatório')
    .max(100, 'Nome do autor muito longo')
    .trim(),
  content: z.string()
    .min(1, 'Conteúdo é obrigatório')
    .max(1000, 'Comentário muito longo')
    .trim()
});

// ===== PROJECT SCHEMAS =====

export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim(),
  icon: z.string().max(50, 'Ícone inválido').optional().default('📁'),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional()
    .default('#3B82F6'),
  status: z.enum(['active', 'completed', 'archived', 'planning']).optional().default('active'),
  deadline: z.string().optional(),
  sandboxNotes: z.string().max(2000, 'Notas muito longas').optional()
});

export const updateProjectSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim()
    .optional(),
  icon: z.string().max(50, 'Ícone inválido').optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional(),
  status: z.enum(['active', 'completed', 'archived', 'planning']).optional(),
  deadline: z.string().nullable().optional(),
  sandboxNotes: z.string().max(2000, 'Notas muito longas').nullable().optional()
});

// ===== NOTE SCHEMAS =====

export const createNoteSchema = z.object({
  content: z.string()
    .min(1, 'Conteúdo é obrigatório')
    .max(5000, 'Conteúdo muito longo')
    .trim(),
  status: z.enum(['active', 'archived']).optional().default('active')
});

export const updateNoteSchema = z.object({
  content: z.string()
    .min(1, 'Conteúdo é obrigatório')
    .max(5000, 'Conteúdo muito longo')
    .trim()
    .optional(),
  status: z.enum(['active', 'archived']).optional()
});

export const createSandboxLayoutSchema = z.object({
  noteId: z.string().min(1, 'ID da nota inválido'),
  positionX: z.number().int().optional().default(0),
  positionY: z.number().int().optional().default(0),
  width: z.number().int().min(200).max(1000).optional().default(300),
  height: z.number().int().min(150).max(800).optional().default(200),
  zIndex: z.number().int().min(1).max(1000).optional().default(1),
  isExpanded: z.boolean().optional().default(false),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional()
    .default('#FEF3C7')
});

export const updateSandboxLayoutSchema = z.object({
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
  width: z.number().int().min(200).max(1000).optional(),
  height: z.number().int().min(150).max(800).optional(),
  zIndex: z.number().int().min(1).max(1000).optional(),
  isExpanded: z.boolean().optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional()
});

export const sandboxAuthSchema = z.object({
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .max(100, 'Senha muito longa')
});

// ===== HABIT SCHEMAS =====

export const createHabitSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  icon: z.string().max(50, 'Ícone inválido').optional().default('✅'),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional()
    .default('#10B981'),
  targetCount: z.number().int().min(1).max(10).optional().default(1),
  frequency: z.object({
    type: z.enum(['daily', 'weekly', 'custom']),
    intervalDays: z.number().int().min(1).max(365).optional().default(1),
    daysOfWeek: z.array(z.number().min(0).max(6)).max(7).optional()
  })
});

export const updateHabitSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim()
    .optional(),
  description: z.string().max(500, 'Descrição muito longa').nullable().optional(),
  icon: z.string().max(50, 'Ícone inválido').optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional(),
  targetCount: z.number().int().min(1).max(10).optional(),
  isActive: z.boolean().optional()
});

export const completeHabitSchema = z.object({
  count: z.number().int().min(1).max(10).optional().default(1),
  notes: z.string().max(500, 'Notas muito longas').optional(),
  date: z.string().optional()
});

// ===== USER SCHEMAS =====

export const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim()
    .optional(),
  avatarUrl: z.string().url('URL do avatar inválida').nullable().optional()
});

export const updateUserProfileSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim()
    .optional(),
  email: z.string().email('Email inválido').optional(),
  timezone: z.string().max(100, 'Timezone inválido').optional(),
  dailyEnergyBudget: z.number().int().min(1).optional(),
  avatarUrl: z.string()
    .max(2000000, 'Imagem muito grande') // ~2MB em base64
    .refine(val => val.startsWith('data:image/'), 'Deve ser uma imagem em formato base64')
    .nullable()
    .optional()
});

export const updateUserSettingsSchema = z.object({
  dailyEnergyBudget: z.number().int().min(1).max(50).optional(),
  theme: z.enum(['light', 'dark', 'bege']).optional(),
  timezone: z.string().max(100, 'Timezone inválido').optional(),
  notifications: z.boolean().optional(),
  sandboxPassword: z.string().max(100, 'Senha muito longa').nullable().optional(),
  sandboxEnabled: z.boolean().optional()
});

// ===== QUERY SCHEMAS =====

export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default('10'),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc')
});

export const taskFilterSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'postponed']).optional(),
  type: z.string().max(50, 'Tipo muito longo').optional(),
  projectId: z.string().min(1, 'ID do projeto inválido').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().max(100, 'Termo de busca muito longo').optional()
});

export const habitFilterSchema = z.object({
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().max(100, 'Termo de busca muito longo').optional()
});

// ===== REMINDER SCHEMAS =====

export const createReminderSchema = z.object({
  entityId: z.string().min(1, 'ID da entidade inválido').optional(),
  entityType: z.enum(['task', 'habit', 'standalone'], {
    errorMap: () => ({ message: 'Tipo de entidade deve ser: task, habit ou standalone' })
  }),
  type: z.enum(['before_due', 'scheduled', 'recurring'], {
    errorMap: () => ({ message: 'Tipo de lembrete deve ser: before_due, scheduled ou recurring' })
  }),
  scheduledTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    .optional(),
  minutesBefore: z.number()
    .int('Minutos devem ser um número inteiro')
    .min(1, 'Mínimo 1 minuto')
    .max(1440, 'Máximo 24 horas (1440 minutos)')
    .optional(),
  daysOfWeek: z.array(z.number().min(0).max(6))
    .max(7, 'Máximo 7 dias da semana')
    .optional()
    .default([]),
  notificationTypes: z.array(z.enum(['push', 'email', 'sms']))
    .min(1, 'Pelo menos um tipo de notificação é obrigatório')
    .max(3, 'Máximo 3 tipos de notificação'),
  message: z.string()
    .max(500, 'Mensagem muito longa')
    .optional(),
  isActive: z.boolean().optional().default(true),
  // Campos para lembretes intervalados
  intervalEnabled: z.boolean().optional().default(false),
  intervalMinutes: z.number()
    .int('Intervalos devem ser um número inteiro')
    .min(1, 'Mínimo 1 minuto de intervalo')
    .max(1440, 'Máximo 24 horas de intervalo')
    .optional(),
  intervalStartTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de início deve estar no formato HH:MM')
    .optional(),
  intervalEndTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de fim deve estar no formato HH:MM')
    .optional(),
  subType: z.enum(['main', 'interval', 'prepare', 'urgent']).optional(),
  parentReminderId: z.string().min(1, 'ID do lembrete pai inválido').optional()
}).refine(data => {
  // Validações condicionais
  if (data.type === 'before_due' && !data.minutesBefore) {
    return false;
  }
  if ((data.type === 'scheduled' || data.type === 'recurring') && !data.scheduledTime) {
    return false;
  }
  if (data.type === 'recurring' && data.daysOfWeek.length === 0) {
    return false;
  }
  // Validações para lembretes intervalados
  if (data.intervalEnabled && (!data.intervalMinutes || !data.intervalStartTime || !data.intervalEndTime)) {
    return false;
  }
  return true;
}, {
  message: 'Dados de lembrete inconsistentes: before_due precisa de minutesBefore, scheduled/recurring precisam de scheduledTime, recurring precisa de daysOfWeek, intervalEnabled precisa de intervalMinutes, intervalStartTime e intervalEndTime'
});

export const updateReminderSchema = z.object({
  type: z.enum(['before_due', 'scheduled', 'recurring']).optional(),
  scheduledTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    .optional(),
  minutesBefore: z.number()
    .int('Minutos devem ser um número inteiro')
    .min(1, 'Mínimo 1 minuto')
    .max(1440, 'Máximo 24 horas (1440 minutos)')
    .optional(),
  daysOfWeek: z.array(z.number().min(0).max(6))
    .max(7, 'Máximo 7 dias da semana')
    .optional(),
  notificationTypes: z.array(z.enum(['push', 'email', 'sms']))
    .min(1, 'Pelo menos um tipo de notificação é obrigatório')
    .max(3, 'Máximo 3 tipos de notificação')
    .optional(),
  message: z.string()
    .max(500, 'Mensagem muito longa')
    .optional(),
  isActive: z.boolean().optional(),
  // Campos para lembretes intervalados
  intervalEnabled: z.boolean().optional(),
  intervalMinutes: z.number()
    .int('Intervalos devem ser um número inteiro')
    .min(1, 'Mínimo 1 minuto de intervalo')
    .max(1440, 'Máximo 24 horas de intervalo')
    .optional(),
  intervalStartTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de início deve estar no formato HH:MM')
    .optional(),
  intervalEndTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de fim deve estar no formato HH:MM')
    .optional(),
  subType: z.enum(['main', 'interval', 'prepare', 'urgent']).optional(),
  parentReminderId: z.string().min(1, 'ID do lembrete pai inválido').optional()
});

export const reminderFilterSchema = z.object({
  entityType: z.enum(['task', 'habit', 'standalone']).optional(),
  entityId: z.string().min(1, 'ID da entidade inválido').optional(),
  type: z.enum(['before_due', 'scheduled', 'recurring']).optional(),
  isActive: z.enum(['true', 'false']).optional()
});

// ===== MIDDLEWARE DE VALIDAÇÃO PADRONIZADO =====

import { Request, Response, NextFunction } from 'express';
import { createValidationErrorResponse } from './errors';

/**
 * Middleware para validação de body com sistema padronizado
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 [VALIDATION] Validando body:', {
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    try {
      const result = schema.parse(req.body);
      req.body = result;
      console.log('✅ [VALIDATION] Validação passou');
      next();
    } catch (error) {
      console.error('❌ [VALIDATION] Erro de validação:', {
        url: req.originalUrl,
        body: req.body,
        error: error
      });

      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        console.error('❌ [VALIDATION] Detalhes do erro Zod:', validationErrors);

        const response = createValidationErrorResponse(
          validationErrors,
          'Dados do corpo da requisição são inválidos'
        );
        
        res.status(400).json(response);
        return;
      }
      next(error);
    }
  };
};

/**
 * Middleware para validação de query parameters com sistema padronizado
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        const response = createValidationErrorResponse(
          validationErrors,
          'Parâmetros de consulta são inválidos'
        );
        
        res.status(400).json(response);
        return;
      }
      next(error);
    }
  };
};

/**
 * Middleware para validação de params com sistema padronizado
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      req.params = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        const response = createValidationErrorResponse(
          validationErrors,
          'Parâmetros da URL são inválidos'
        );
        
        res.status(400).json(response);
        return;
      }
      next(error);
    }
  };
};

// ===== SCHEMAS PARA VALIDAÇÃO DE PARAMS =====

export const idParamSchema = z.object({
  id: z.string()
    .min(1, 'ID é obrigatório')
    .regex(/^[a-zA-Z0-9]+$/, 'ID deve conter apenas caracteres alfanuméricos')
});

export const paginationParamsSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Página deve ser um número').optional(),
  limit: z.string().regex(/^\d+$/, 'Limite deve ser um número').optional()
});