import { Response, NextFunction } from 'express';
import * as habitService from '../services/habitService';
import { AuthenticatedRequest } from '../types/api';
import { CompleteHabitRequest } from '../types/habit';
import { 
  createHabitReminders,
  getEntityReminders,
  deleteReminderAndChildren
} from '../services/reminderService';
import { HabitReminderConfig } from '../types/reminder';

export const getHabits = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const habits = await habitService.getUserHabits(req.userId);
    res.json({ success: true, data: habits });
  } catch (error) {
    return next(error);
  }
};

export const getHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const habit = await habitService.getHabit(req.params.id, req.userId);
    res.json({ success: true, data: habit });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      res.status(404).json({ success: false, error: 'Hábito não encontrado' });
      return;
    }
    return next(error);
  }
};

export const createHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const habit = await habitService.createHabit(req.userId, req.body);
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    return next(error);
  }
};

export const updateHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const habit = await habitService.updateHabit(req.params.id, req.userId, req.body);
    res.json({ success: true, data: habit });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      res.status(404).json({ success: false, error: 'Hábito não encontrado' });
      return;
    }
    return next(error);
  }
};

export const deleteHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    await habitService.deleteHabit(req.params.id, req.userId);
    res.json({ success: true, message: 'Hábito excluído com sucesso' });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      res.status(404).json({ success: false, error: 'Hábito não encontrado' });
      return;
    }
    return next(error);
  }
};

export const getHabitComments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const comments = await habitService.getHabitComments(req.params.id, req.userId);
    res.json({ success: true, data: comments });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      res.status(404).json({ success: false, error: 'Hábito não encontrado' });
      return;
    }
    return next(error);
  }
};

export const addHabitComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const comment = await habitService.addHabitComment(req.params.id, req.userId, req.body);
    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      res.status(404).json({ success: false, error: 'Hábito não encontrado' });
      return;
    }
    return next(error);
  }
};

export const completeHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const { id } = req.params;
    const completeData: CompleteHabitRequest = req.body;
    
    console.log('🎯 Completando hábito:', { habitId: id, data: completeData, userId: req.userId });
    
    const completion = await habitService.completeHabit(id, req.userId, completeData);
    
    res.json({ 
      success: true, 
      message: 'Hábito completado com sucesso',
      data: completion,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Erro ao completar hábito:', error);
    if (error.message === 'Hábito não encontrado') {
      res.status(404).json({ 
        success: false, 
        error: 'Hábito não encontrado',
        timestamp: new Date().toISOString()
      });
      return;
    }
    return next(error);
  }
};

// ===== NOVOS ENDPOINTS PARA LEMBRETES DE HÁBITOS =====

export const createHabitReminder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { habitId } = req.params;
    const config: HabitReminderConfig = req.body;

    // Verificar se o hábito pertence ao usuário
    const habit = await habitService.getHabit(habitId, req.userId);
    if (!habit) {
      res.status(404).json({
        success: false,
        error: 'Hábito não encontrado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const reminders = await createHabitReminders(req.userId, habitId, config);
    
    res.status(201).json({
      success: true,
      data: reminders,
      message: `${reminders.length} lembrete(s) criado(s) para o hábito`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getHabitReminders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { habitId } = req.params;

    // Verificar se o hábito pertence ao usuário
    const habit = await habitService.getHabit(habitId, req.userId);
    if (!habit) {
      res.status(404).json({
        success: false,
        error: 'Hábito não encontrado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const reminders = await getEntityReminders(req.userId, habitId, 'habit');
    
    res.json({
      success: true,
      data: reminders,
      meta: {
        total: reminders.length,
        habitId,
        entityType: 'habit'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHabitReminder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
      message: 'Lembrete do hábito removido com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};