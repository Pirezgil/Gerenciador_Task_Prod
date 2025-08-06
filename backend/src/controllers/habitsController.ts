import { Response, NextFunction } from 'express';
import * as habitService from '../services/habitService';
import { AuthenticatedRequest } from '../types/api';
import { CreateHabitRequest, UpdateHabitRequest, CompleteHabitRequest } from '../types/habit';

export const getHabits = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const habits = await habitService.getUserHabits(req.userId);
    res.json({ success: true, data: habits });
  } catch (error) {
    next(error);
  }
};

export const getHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const habit = await habitService.getHabit(req.params.id, req.userId);
    res.json({ success: true, data: habit });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      return res.status(404).json({ success: false, error: 'Hábito não encontrado' });
    }
    next(error);
  }
};

export const createHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const habit = await habitService.createHabit(req.userId, req.body);
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const habit = await habitService.updateHabit(req.params.id, req.userId, req.body);
    res.json({ success: true, data: habit });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      return res.status(404).json({ success: false, error: 'Hábito não encontrado' });
    }
    next(error);
  }
};

export const deleteHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    await habitService.deleteHabit(req.params.id, req.userId);
    res.json({ success: true, message: 'Hábito excluído com sucesso' });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      return res.status(404).json({ success: false, error: 'Hábito não encontrado' });
    }
    next(error);
  }
};

export const getHabitComments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const comments = await habitService.getHabitComments(req.params.id, req.userId);
    res.json({ success: true, data: comments });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      return res.status(404).json({ success: false, error: 'Hábito não encontrado' });
    }
    next(error);
  }
};

export const addHabitComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const comment = await habitService.addHabitComment(req.params.id, req.userId, req.body);
    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      return res.status(404).json({ success: false, error: 'Hábito não encontrado' });
    }
    next(error);
  }
};

export const completeHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
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
      return res.status(404).json({ 
        success: false, 
        error: 'Hábito não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
};