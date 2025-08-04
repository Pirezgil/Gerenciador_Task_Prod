import { Response, NextFunction } from 'express';
import * as noteService from '../services/noteService';
import { AuthenticatedRequest } from '../types/api';

export const getNotes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const notes = await noteService.getUserNotes(req.userId);
    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const note = await noteService.createNote(req.userId, req.body);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const note = await noteService.updateNote(req.params.id, req.userId, req.body);
    res.json({ success: true, data: note });
  } catch (error: any) {
    if (error.message === 'Nota não encontrada') {
      return res.status(404).json({ success: false, error: 'Nota não encontrada' });
    }
    next(error);
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    await noteService.deleteNote(req.params.id, req.userId);
    res.json({ success: true, message: 'Nota deletada' });
  } catch (error: any) {
    if (error.message === 'Nota não encontrada') {
      return res.status(404).json({ success: false, error: 'Nota não encontrada' });
    }
    next(error);
  }
};

export const authenticateSandbox = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const result = await noteService.authenticateSandbox(req.userId, req.body.password);
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('Senha')) {
      return res.status(401).json({ success: false, error: error.message });
    }
    next(error);
  }
};