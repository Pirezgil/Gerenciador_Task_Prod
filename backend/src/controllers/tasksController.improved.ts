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
import {
  createSuccessResponse,
  ErrorCode
} from '../lib/errors';
import {
  throwAppError,
  assertResourceExists
} from '../middleware/errorHandler';

/**
 * EXEMPLO DE CONTROLLER PADRONIZADO
 * 
 * Este arquivo demonstra como implementar os controllers
 * usando o novo sistema de erro padronizado.
 * 
 * Principais melhorias:
 * 1. Uso consistente de createSuccessResponse()
 * 2. Uso de throwAppError() para erros específicos
 * 3. Uso de assertResourceExists() para validações
 * 4. Remoção de tratamento manual de erros
 * 5. Delegação completa para o error handler
 */

// ===== HELPER FUNCTIONS INTERNAS =====

/**
 * Valida se o usuário está autenticado
 */
function assertAuthenticated(userId?: string): asserts userId is string {
  if (!userId) {
    throwAppError(ErrorCode.AUTH_REQUIRED);
  }
}

/**
 * Valida ownership e existência de tarefa
 */
async function validateTaskOwnership(taskId: string, userId: string): Promise<void> {
  const task = await taskService.getTaskById(taskId, userId);
  assertResourceExists(task, ErrorCode.TASK_NOT_FOUND, 'task_ownership');
}

// ===== ENDPOINTS PRINCIPAIS =====

export const getTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const filters = req.query;
    const tasks = await taskService.getUserTasks(req.userId, filters);
    
    const response = createSuccessResponse(
      tasks,
      undefined, // Sem mensagem para listagens
      {
        total: tasks.length,
        filtered: true
      }
    );
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { id } = req.params;
    const task = await taskService.getTaskById(id, req.userId);
    
    assertResourceExists(task, ErrorCode.TASK_NOT_FOUND, 'get_task');
    
    console.log('🎯 Tarefa retornada pelo backend:', JSON.stringify({
      id: task.id,
      description: task.description,
      comments: task.comments,
      attachments: task.attachments
    }, null, 2));
    
    const response = createSuccessResponse(task);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    console.log('🚀 === NOVA TAREFA SENDO CRIADA ===');
    console.log('📥 Body completo:', JSON.stringify(req.body, null, 2));

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

    console.log('Dados filtrados para criação:', JSON.stringify(taskData, null, 2));

    const task = await taskService.createTask(req.userId, taskData);
    
    console.log('✅ Tarefa criada no backend:', JSON.stringify({
      id: task.id,
      description: task.description,
      comments: task.comments,
      attachments: task.attachments
    }, null, 2));
    
    const response = createSuccessResponse(
      task,
      'Tarefa criada com sucesso'
    );
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Erro detalhado na criação de tarefa:', error);
    next(error);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { id } = req.params;
    const updateData: UpdateTaskRequest = req.body;
    
    await validateTaskOwnership(id, req.userId);
    const task = await taskService.updateTask(id, req.userId, updateData);
    
    const response = createSuccessResponse(
      task,
      'Tarefa atualizada com sucesso'
    );
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { id } = req.params;
    
    await validateTaskOwnership(id, req.userId);
    await taskService.deleteTask(id, req.userId);
    
    const response = createSuccessResponse(
      undefined,
      'Tarefa deletada com sucesso'
    );
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { id } = req.params;
    
    await validateTaskOwnership(id, req.userId);
    const task = await taskService.completeTask(id, req.userId);
    
    const response = createSuccessResponse(
      task,
      'Tarefa completada com sucesso'
    );
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const postponeTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { id } = req.params;
    const postponeData: PostponeTaskRequest = req.body;
    
    await validateTaskOwnership(id, req.userId);
    const task = await taskService.postponeTask(id, req.userId, postponeData);
    
    const response = createSuccessResponse(
      task,
      'Tarefa adiada com sucesso'
    );
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { id } = req.params;
    const commentData: CreateTaskCommentRequest = req.body;
    
    await validateTaskOwnership(id, req.userId);
    const comment = await taskService.addTaskComment(id, req.userId, commentData);
    
    const response = createSuccessResponse(
      comment,
      'Comentário adicionado com sucesso'
    );
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getEnergyBudget = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const energyBudget = await taskService.getUserEnergyBudget(req.userId);
    
    const response = createSuccessResponse(energyBudget);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getBombeiroTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const bombeiroTasks = await DailyTaskTracker.getBombeiroTasks(req.userId);
    
    const response = createSuccessResponse(bombeiroTasks);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// ===== ENDPOINTS PARA LEMBRETES =====

export const createTaskReminder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { taskId } = req.params;
    const config: TaskReminderConfig = req.body;

    // Verificar se a tarefa pertence ao usuário
    await validateTaskOwnership(taskId, req.userId);

    const reminder = await createSingleReminder(req.userId, taskId, config);
    
    const response = createSuccessResponse(
      reminder,
      'Lembrete criado com sucesso'
    );
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const createRecurringTaskReminders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { taskId } = req.params;
    const config: RecurringTaskReminderConfig = req.body;

    // Verificar se a tarefa pertence ao usuário e é recorrente
    const task = await taskService.getTaskById(taskId, req.userId);
    assertResourceExists(task, ErrorCode.TASK_NOT_FOUND, 'recurring_reminder_task');

    if (!task.isRecurring) {
      throwAppError(
        ErrorCode.RECURRING_TASK_REQUIRED,
        'Tarefa deve ser recorrente para este tipo de lembrete'
      );
    }

    const reminders = await createRecurringReminders(req.userId, taskId, 'task', config);
    
    const response = createSuccessResponse(
      reminders,
      `${reminders.length} lembrete(s) criado(s) com sucesso`
    );
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTaskReminders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { taskId } = req.params;

    // Verificar se a tarefa pertence ao usuário
    await validateTaskOwnership(taskId, req.userId);

    const reminders = await getEntityReminders(req.userId, taskId, 'task');
    
    const response = createSuccessResponse(
      reminders,
      undefined,
      {
        total: reminders.length,
        taskId,
        entityType: 'task'
      }
    );
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteTaskReminder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    assertAuthenticated(req.userId);

    const { reminderId } = req.params;

    await deleteReminderAndChildren(req.userId, reminderId);
    
    const response = createSuccessResponse(
      undefined,
      'Lembrete removido com sucesso'
    );
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};