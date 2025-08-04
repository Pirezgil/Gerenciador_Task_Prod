import { Response, NextFunction } from 'express';
import * as habitService from '../services/habitService';
import { AuthenticatedRequest } from '../types/api';

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

export const completeHabit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const completion = await habitService.completeHabit(req.params.id, req.userId, req.body);
    res.json({ success: true, data: completion });
  } catch (error: any) {
    if (error.message === 'Hábito não encontrado') {
      return res.status(404).json({ success: false, error: 'Hábito não encontrado' });
    }
    next(error);
  }
};