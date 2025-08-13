import { Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import DailyTaskTracker from '../services/dailyTaskTracker';
import { AuthenticatedRequest } from '../types/api';
import { CreateTaskRequest, UpdateTaskRequest, PostponeTaskRequest, CreateTaskCommentRequest } from '../types/task';
import { 
  createSingleReminder, 
  createRecurringReminders, 
  getEntityReminders,
  deleteReminderAndChildren
} from '../services/reminderService';
import { TaskReminderConfig, RecurringTaskReminderConfig } from '../types/reminder';

export const getTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const filters = req.query;
    
    // CORREÇÃO: Permitir incluir dados para visualização expandida via query parameter
    // ?includeExpandData=true para incluir comments, attachments, history
    const includeExpandData = req.query.includeExpandData === 'true';
    
    const includeOptions = {
      project: true, // Always include project for display
      comments: includeExpandData,
      attachments: includeExpandData, 
      history: includeExpandData,
      recurrence: true, // Always include for badges
      appointment: true // Always include for badges
    };
    
    const tasks = await taskService.getUserTasks(req.userId, filters, includeOptions);
    
    res.json({
      success: true,
      data: tasks,
      meta: {
        total: tasks.length,
        filtered: true,
        includeExpandData: includeExpandData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    const task = await taskService.getTaskById(id, req.userId);
    
    // Log seguro removido - informações de tarefa não devem ser logadas em produção
    
    res.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        message: 'A tarefa solicitada não existe ou não pertence ao usuário',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Logs de debugging removidos para segurança - dados do usuário não devem ser logados

    // Filtrar apenas campos válidos para CreateTaskRequest
    const {
      description,
      energyPoints,
      type,
      projectId,
      dueDate,
      isRecurring,
      isAppointment,
      externalLinks,
      comments,
      attachments,
      recurrence,
      appointment
    } = req.body;

    const taskData: CreateTaskRequest = {
      description,
      energyPoints,
      type,
      projectId,
      dueDate,
      isRecurring,
      isAppointment,
      externalLinks: externalLinks || [],
      comments: comments || [],
      attachments: attachments || [],
      recurrence,
      appointment
    };

    const task = await taskService.createTask(req.userId, taskData);
    
    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    
    if (error.message === 'Projeto não encontrado') {
      res.status(400).json({
        success: false,
        error: 'Projeto inválido',
        message: 'O projeto especificado não existe ou não pertence ao usuário',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Log do erro para debug
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        error: 'Dados duplicados',
        message: 'Já existe um registro com esses dados',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (error.code) {
      res.status(400).json({
        success: false,
        error: 'Erro de validação',
        message: error.message || 'Dados inválidos fornecidos',
        details: error,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    next(error);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    
    // SECURITY: Mass Assignment Protection - Only allow safe fields
    const {
      description,
      status,
      energyPoints,
      type,
      projectId,
      dueDate,
      rescheduleDate,
      isRecurring,
      isAppointment,
      plannedForToday,
      plannedDate,
      missedDaysCount,
      externalLinks,
      attachments,
      recurrence,
      appointment,
      reminders
    } = req.body;

    const updateData: UpdateTaskRequest = {
      description,
      status,
      energyPoints,
      type,
      projectId,
      dueDate,
      rescheduleDate,
      isRecurring,
      isAppointment,
      plannedForToday,
      plannedDate,
      missedDaysCount,
      externalLinks,
      attachments,
      recurrence,
      appointment,
      reminders
    };
    
    const task = await taskService.updateTask(id, req.userId, updateData);
    
    res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (error.message === 'Projeto não encontrado') {
      res.status(400).json({
        success: false,
        error: 'Projeto inválido',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    await taskService.deleteTask(id, req.userId);
    
    res.json({
      success: true,
      message: 'Tarefa deletada com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const completeTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    const task = await taskService.completeTask(id, req.userId);
    
    res.json({
      success: true,
      message: 'Tarefa completada com sucesso',
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (error.message === 'Tarefa já está completa') {
      res.status(400).json({
        success: false,
        error: 'Tarefa já completa',
        message: 'Esta tarefa já foi completada anteriormente',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const postponeTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    const postponeData: PostponeTaskRequest = req.body;
    
    const task = await taskService.postponeTask(id, req.userId, postponeData);
    
    res.json({
      success: true,
      message: 'Tarefa adiada com sucesso',
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    const commentData: CreateTaskCommentRequest = req.body;
    
    const comment = await taskService.addTaskComment(id, req.userId, commentData);
    
    res.status(201).json({
      success: true,
      message: 'Comentário adicionado com sucesso',
      data: comment,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const getEnergyBudget = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const energyBudget = await taskService.getUserEnergyBudget(req.userId);
    
    res.json({
      success: true,
      data: energyBudget,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getBombeiroTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const bombeiroTasks = await DailyTaskTracker.getBombeiroTasks(req.userId);
    
    res.json({
      success: true,
      data: bombeiroTasks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// ===== NOVOS ENDPOINTS PARA LEMBRETES =====

export const createTaskReminder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { taskId } = req.params;
    const config: TaskReminderConfig = req.body;

    // Verificar se a tarefa pertence ao usuário
    const task = await taskService.getTaskById(taskId, req.userId);
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const reminder = await createSingleReminder(req.userId, taskId, config);
    
    res.status(201).json({
      success: true,
      data: reminder,
      message: 'Lembrete criado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const createRecurringTaskReminders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { taskId } = req.params;
    const config: RecurringTaskReminderConfig = req.body;

    // Verificar se a tarefa pertence ao usuário e é recorrente
    const task = await taskService.getTaskById(taskId, req.userId);
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!task.isRecurring) {
      res.status(400).json({
        success: false,
        error: 'Tarefa deve ser recorrente para este tipo de lembrete',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const reminders = await createRecurringReminders(req.userId, taskId, 'task', config);
    
    res.status(201).json({
      success: true,
      data: reminders,
      message: `${reminders.length} lembrete(s) criado(s) com sucesso`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskReminders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { taskId } = req.params;

    // Verificar se a tarefa pertence ao usuário
    const task = await taskService.getTaskById(taskId, req.userId);
    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const reminders = await getEntityReminders(req.userId, taskId, 'task');
    
    res.json({
      success: true,
      data: reminders,
      meta: {
        total: reminders.length,
        taskId,
        entityType: 'task'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTaskReminder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { reminderId } = req.params;

    await deleteReminderAndChildren(req.userId, reminderId);
    
    res.json({
      success: true,
      message: 'Lembrete removido com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};