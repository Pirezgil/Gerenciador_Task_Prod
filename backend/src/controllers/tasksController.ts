import { Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import { AuthenticatedRequest } from '../types/api';
import { CreateTaskRequest, UpdateTaskRequest, PostponeTaskRequest, CreateTaskCommentRequest } from '../types/task';

export const getTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
    }

    const filters = req.query;
    const tasks = await taskService.getUserTasks(req.userId, filters);
    
    res.json({
      success: true,
      data: tasks,
      meta: {
        total: tasks.length,
        filtered: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
    }

    const { id } = req.params;
    const task = await taskService.getTaskById(id, req.userId);
    
    console.log('🎯 Tarefa retornada pelo backend:', JSON.stringify({
      id: task.id,
      description: task.description,
      comments: task.comments,
      attachments: task.attachments
    }, null, 2));
    
    res.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        message: 'A tarefa solicitada não existe ou não pertence ao usuário',
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
    }

    console.log('🚀 === NOVA TAREFA SENDO CRIADA ===');
    console.log('📥 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('📝 Campos específicos:');
    console.log('  - comments:', req.body.comments, '(tipo:', typeof req.body.comments, ')');
    console.log('  - attachments:', req.body.attachments, '(tipo:', typeof req.body.attachments, ')');
    console.log('  - description:', req.body.description);
    console.log('  - energyPoints:', req.body.energyPoints);

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
    
    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erro detalhado na criação de tarefa:', error);
    
    if (error.message === 'Projeto não encontrado') {
      return res.status(400).json({
        success: false,
        error: 'Projeto inválido',
        message: 'O projeto especificado não existe ou não pertence ao usuário',
        timestamp: new Date().toISOString()
      });
    }
    
    // Log do erro para debug
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Dados duplicados',
        message: 'Já existe um registro com esses dados',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.code) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        message: error.message || 'Dados inválidos fornecidos',
        details: error,
        timestamp: new Date().toISOString()
      });
    }
    
    next(error);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
    }

    const { id } = req.params;
    const updateData: UpdateTaskRequest = req.body;
    
    const task = await taskService.updateTask(id, req.userId, updateData);
    
    res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Tarefa não encontrada') {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message === 'Projeto não encontrado') {
      return res.status(400).json({
        success: false,
        error: 'Projeto inválido',
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
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
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
};

export const completeTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
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
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message === 'Tarefa já está completa') {
      return res.status(400).json({
        success: false,
        error: 'Tarefa já completa',
        message: 'Esta tarefa já foi completada anteriormente',
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
};

export const postponeTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
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
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
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
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada',
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
};

export const getEnergyBudget = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
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