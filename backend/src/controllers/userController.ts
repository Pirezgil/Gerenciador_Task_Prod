import { Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { AuthenticatedRequest } from '../types/api';

export const getSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const settings = await userService.getUserSettings(req.userId);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const user = await userService.updateUserSettings(req.userId, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const user = await userService.updateUserProfile(req.userId, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const stats = await userService.getUserStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};