import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/api';
import * as reminderService from '../services/reminderService';
import { ReminderFilter } from '../types/reminder';
import {
  getHttpStatusForReminderError,
  createReminderErrorResponse
} from '../lib/errors';

export const getReminders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const filters: ReminderFilter = {
      entityType: req.query.entityType as any,
      entityId: req.query.entityId as string,
      type: req.query.type as any,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined
    };

    // Remover filtros undefined
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ReminderFilter] === undefined) {
        delete filters[key as keyof ReminderFilter];
      }
    });

    const reminders = await reminderService.getUserReminders(req.userId, filters);
    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('Erro ao buscar lembretes:', error);
    const statusCode = getHttpStatusForReminderError(error as Error);
    const errorResponse = createReminderErrorResponse(error as Error);
    res.status(statusCode).json(errorResponse);
  }
};

export const getReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { id } = req.params;
    const reminder = await reminderService.getReminder(req.userId, id);
    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Erro ao buscar lembrete:', error);
    const statusCode = getHttpStatusForReminderError(error as Error);
    const errorResponse = createReminderErrorResponse(error as Error);
    res.status(statusCode).json(errorResponse);
  }
};

export const createReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const reminderData = req.body;
    const reminder = await reminderService.createReminder(req.userId, reminderData);
    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Erro ao criar lembrete:', error);
    const statusCode = getHttpStatusForReminderError(error as Error);
    const errorResponse = createReminderErrorResponse(error as Error);
    res.status(statusCode).json(errorResponse);
  }
};

export const updateReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;
    
    const reminder = await reminderService.updateReminder(req.userId, id, updateData);
    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Erro ao atualizar lembrete:', error);
    const statusCode = getHttpStatusForReminderError(error as Error);
    const errorResponse = createReminderErrorResponse(error as Error);
    res.status(statusCode).json(errorResponse);
  }
};

export const deleteReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { id } = req.params;
    await reminderService.deleteReminder(req.userId, id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar lembrete:', error);
    const statusCode = getHttpStatusForReminderError(error as Error);
    const errorResponse = createReminderErrorResponse(error as Error);
    res.status(statusCode).json(errorResponse);
  }
};

// ===== CORREÇÃO DE SEGURANÇA CRÍTICA =====
// Esta função foi corrigida para eliminar vulnerabilidade IDOR
// Usuários agora só podem acessar seus próprios lembretes ativos
export const getActiveReminders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      console.log('🚫 SECURITY BLOCK - Tentativa de acesso sem autenticação ao endpoint de lembretes ativos');
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    console.log(`🛡️  SECURITY CHECK - Usuário ${req.userId} acessando lembretes ativos próprios`);
    
    // CORREÇÃO CRÍTICA: Filtrar por usuário para evitar IDOR
    const reminders = await reminderService.getUserActiveReminders(req.userId);
    
    console.log(`✅ SECURITY SUCCESS - Retornando ${reminders.length} lembretes do usuário ${req.userId}`);
    
    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes ativos do usuário:', error);
    const statusCode = getHttpStatusForReminderError(error as Error);
    const errorResponse = createReminderErrorResponse(error as Error);
    res.status(statusCode).json(errorResponse);
  }
};

export const markReminderSent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await reminderService.markReminderAsSent(id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao marcar lembrete como enviado:', error);
    const statusCode = getHttpStatusForReminderError(error as Error);
    const errorResponse = createReminderErrorResponse(error as Error);
    res.status(statusCode).json(errorResponse);
  }
};