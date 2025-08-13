// ============================================================================
// PUSH SUBSCRIPTION CONTROLLER - Controlador para gerenciamento de assinaturas
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import * as pushSubscriptionService from '../services/pushSubscriptionService';
import { notificationService } from '../services/notificationService';
import { 
  CreatePushSubscriptionRequest,
  PushSubscriptionFilter 
} from '../types/pushSubscription';
import {
  isPushSubscriptionValidationError,
  isPushSubscriptionNotFoundError,
  createReminderErrorResponse
} from '../lib/errors';

// ============================================================================
// INTERFACES DE REQUEST
// ============================================================================

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// ============================================================================
// CONTROLADORES
// ============================================================================

export const getUserPushSubscriptions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const filters: PushSubscriptionFilter = {};
    
    // Filtro por status ativo
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }

    const subscriptions = await pushSubscriptionService.getUserPushSubscriptions(userId, filters);

    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });

  } catch (error) {
    console.error('Erro ao buscar push subscriptions:', error);
    next(error);
  }
};

export const createPushSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const subscriptionData: CreatePushSubscriptionRequest = req.body;
    
    // Validação básica
    if (!subscriptionData.subscription) {
      return res.status(400).json({
        success: false,
        error: 'Dados da assinatura são obrigatórios'
      });
    }

    const subscription = await pushSubscriptionService.createPushSubscription(userId, subscriptionData);

    res.status(201).json({
      success: true,
      data: subscription,
      message: 'Push subscription criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar push subscription:', error);
    
    if (isPushSubscriptionValidationError(error)) {
      return res.status(400).json(createReminderErrorResponse(error));
    }
    
    next(error);
  }
};

export const updatePushSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const subscriptionId = req.params.id;
    const updates = req.body;

    // Validar que apenas campos permitidos sejam atualizados
    const allowedUpdates = ['isActive', 'userAgent'];
    const actualUpdates: any = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        actualUpdates[key] = updates[key];
      }
    }

    const subscription = await pushSubscriptionService.updatePushSubscription(
      userId, 
      subscriptionId, 
      actualUpdates
    );

    res.json({
      success: true,
      data: subscription,
      message: 'Push subscription atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar push subscription:', error);
    
    if (isPushSubscriptionNotFoundError(error)) {
      return res.status(404).json(createReminderErrorResponse(error));
    }
    
    next(error);
  }
};

export const deletePushSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const subscriptionId = req.params.id;

    await pushSubscriptionService.deletePushSubscription(userId, subscriptionId);

    res.json({
      success: true,
      message: 'Push subscription removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover push subscription:', error);
    
    if (isPushSubscriptionNotFoundError(error)) {
      return res.status(404).json(createReminderErrorResponse(error));
    }
    
    next(error);
  }
};

// ============================================================================
// ENDPOINT DE TESTE
// ============================================================================

export const testPushNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar assinaturas ativas do usuário
    const subscriptions = await pushSubscriptionService.getActivePushSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura push ativa encontrada para este usuário'
      });
    }

    // Enviar notificação de teste
    const testResult = await notificationService.testNotification(userId, 'push');

    res.json({
      success: testResult.success,
      message: testResult.success 
        ? `Notificação de teste enviada para ${subscriptions.length} assinatura(s)`
        : `Erro ao enviar teste: ${testResult.error}`,
      subscriptions: subscriptions.length,
      result: testResult
    });

  } catch (error) {
    console.error('Erro ao testar push notification:', error);
    next(error);
  }
};

// ============================================================================
// ENDPOINT DE LIMPEZA (ADMIN)
// ============================================================================

export const cleanupOldSubscriptions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const daysOld = parseInt(req.query.days as string) || 30;
    const deletedCount = await pushSubscriptionService.cleanupOldSubscriptions(daysOld);

    res.json({
      success: true,
      message: `Limpeza concluída: ${deletedCount} assinaturas antigas removidas`,
      deletedCount
    });

  } catch (error) {
    console.error('Erro na limpeza de subscriptions:', error);
    next(error);
  }
};

// ============================================================================
// ENDPOINT PARA LIMPEZA PROATIVA DE ASSINATURAS CORROMPIDAS
// ============================================================================

export const cleanupInvalidEndpoint = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint é obrigatório'
      });
    }

    console.log(`🧹 Limpeza proativa solicitada por usuário ${userId} para endpoint: ${endpoint.substring(0, 50)}...`);

    // Desativar/remover assinatura inválida
    await pushSubscriptionService.deactivateInvalidSubscription(endpoint);

    res.json({
      success: true,
      message: 'Assinatura inválida removida com sucesso'
    });

  } catch (error) {
    console.error('Erro na limpeza proativa de endpoint:', error);
    next(error);
  }
};