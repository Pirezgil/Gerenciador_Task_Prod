import { z } from 'zod';

// ===== AUTH SCHEMAS =====

export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa')
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .toLowerCase(),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa')
});

// ===== TASK SCHEMAS =====

export const createTaskSchema = z.object({
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(1000, 'Descrição muito longa')
    .trim(),
  energyPoints: z.number()
    .int('Pontos de energia devem ser um número inteiro')
    .refine(val => [1, 3, 5].includes(val), 'Pontos de energia devem ser 1, 3 ou 5'),
  type: z.enum(['task', 'brick']).optional().default('task'),
  projectId: z.string().min(1, 'ID do projeto inválido').optional(),
  dueDate: z.string().optional(),
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
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  energyPoints: z.number()
    .int('Pontos de energia devem ser um número inteiro')
    .refine(val => [1, 3, 5].includes(val), 'Pontos de energia devem ser 1, 3 ou 5')
    .optional(),
  type: z.enum(['task', 'brick']).optional(),
  projectId: z.string().min(1, 'ID do projeto inválido').nullable().optional(),
  dueDate: z.string().nullable().optional(),
  rescheduleDate: z.string().nullable().optional(),
  isRecurring: z.boolean().optional(),
  isAppointment: z.boolean().optional(),
  plannedForToday: z.boolean().optional(),
  externalLinks: z.array(z.string().url('URL inválida')).optional()
});

export const postponeTaskSchema = z.object({
  reason: z.string().max(500, 'Motivo muito longo').optional(),
  newDate: z.string().optional()
});

export const completeTaskSchema = z.object({
  completedAt: z.string().optional()
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
  dailyEnergyBudget: z.number().int().min(1).optional()
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
  status: z.enum(['pending', 'completed', 'postponed']).optional(),
  type: z.enum(['task', 'brick']).optional(),
  projectId: z.string().min(1, 'ID do projeto inválido').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().max(100, 'Termo de busca muito longo').optional()
});

export const habitFilterSchema = z.object({
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().max(100, 'Termo de busca muito longo').optional()
});

// ===== MIDDLEWARE DE VALIDAÇÃO =====

export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.parse(req.query);
      req.query = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Parâmetros de consulta inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};