// ============================================================================
// PUSH SUBSCRIPTION SERVICE - Gerenciamento de assinaturas push
// ============================================================================

import { prisma } from '../app';
import { 
  CreatePushSubscriptionRequest,
  PushSubscriptionResponse,
  PushSubscriptionFilter
} from '../types/pushSubscription';
import {
  PushSubscriptionValidationError,
  PushSubscriptionNotFoundError
} from '../lib/errors';

export const getUserPushSubscriptions = async (
  userId: string, 
  filters?: PushSubscriptionFilter
): Promise<PushSubscriptionResponse[]> => {
  const whereClause: any = { userId };

  if (filters?.isActive !== undefined) {
    whereClause.isActive = filters.isActive;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  return subscriptions.map(subscription => ({
    id: subscription.id,
    userId: subscription.userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.p256dh,
    auth: subscription.auth,
    userAgent: subscription.userAgent ?? undefined,
    isActive: subscription.isActive,
    lastNotificationSent: subscription.lastNotificationSent?.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString()
  }));
};

export const createPushSubscription = async (
  userId: string, 
  data: CreatePushSubscriptionRequest
): Promise<PushSubscriptionResponse> => {
  
  // Validar dados da assinatura
  if (!data.subscription.endpoint) {
    throw new PushSubscriptionValidationError('endpoint', 'Endpoint é obrigatório');
  }

  if (!data.subscription.keys?.p256dh) {
    throw new PushSubscriptionValidationError('p256dh', 'Chave p256dh é obrigatória');
  }

  if (!data.subscription.keys?.auth) {
    throw new PushSubscriptionValidationError('auth', 'Chave auth é obrigatória');
  }

  // Validar comprimento das chaves para evitar erros de criptografia
  // p256dh: 65 bytes -> ~87 caracteres base64url, auth: 16 bytes -> ~22 caracteres base64url
  if (data.subscription.keys.p256dh.length < 80 || data.subscription.keys.p256dh.length > 90) {
    throw new PushSubscriptionValidationError(
      'p256dh', 
      `Chave p256dh deve ter entre 80-90 caracteres base64url (atual: ${data.subscription.keys.p256dh.length})`
    );
  }

  if (data.subscription.keys.auth.length < 16 || data.subscription.keys.auth.length > 30) {
    throw new PushSubscriptionValidationError(
      'auth', 
      `Chave auth deve ter entre 16-30 caracteres base64url (atual: ${data.subscription.keys.auth.length})`
    );
  }

  // Validar formato base64url das chaves
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  if (!base64urlRegex.test(data.subscription.keys.p256dh)) {
    throw new PushSubscriptionValidationError('p256dh', 'Chave p256dh deve estar em formato base64url válido');
  }

  if (!base64urlRegex.test(data.subscription.keys.auth)) {
    throw new PushSubscriptionValidationError('auth', 'Chave auth deve estar em formato base64url válido');
  }

  // Verificar se já existe uma assinatura com o mesmo endpoint
  const existingSubscription = await prisma.pushSubscription.findUnique({
    where: { endpoint: data.subscription.endpoint }
  });

  if (existingSubscription) {
    // Se pertence ao mesmo usuário, apenas atualize e reative
    if (existingSubscription.userId === userId) {
      // Validar as chaves antes de atualizar
      if (data.subscription.keys.p256dh.length !== 65) {
        throw new PushSubscriptionValidationError(
          'p256dh', 
          `Chave p256dh deve ter exatamente 65 caracteres (atual: ${data.subscription.keys.p256dh.length})`
        );
      }

      if (data.subscription.keys.auth.length < 16) {
        throw new PushSubscriptionValidationError(
          'auth', 
          `Chave auth deve ter pelo menos 16 caracteres (atual: ${data.subscription.keys.auth.length})`
        );
      }

      const updatedSubscription = await prisma.pushSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          p256dh: data.subscription.keys.p256dh,
          auth: data.subscription.keys.auth,
          userAgent: data.userAgent,
          isActive: true,
          updatedAt: new Date()
        }
      });

      return {
        id: updatedSubscription.id,
        userId: updatedSubscription.userId,
        endpoint: updatedSubscription.endpoint,
        p256dh: updatedSubscription.p256dh,
        auth: updatedSubscription.auth,
        userAgent: updatedSubscription.userAgent ?? undefined,
        isActive: updatedSubscription.isActive,
        lastNotificationSent: updatedSubscription.lastNotificationSent?.toISOString(),
        createdAt: updatedSubscription.createdAt.toISOString(),
        updatedAt: updatedSubscription.updatedAt.toISOString()
      };
    } else {
      throw new PushSubscriptionValidationError('endpoint', 'Endpoint já está em uso por outro usuário');
    }
  }

  // Criar nova assinatura
  const subscription = await prisma.pushSubscription.create({
    data: {
      userId,
      endpoint: data.subscription.endpoint,
      p256dh: data.subscription.keys.p256dh,
      auth: data.subscription.keys.auth,
      userAgent: data.userAgent,
      isActive: true
    }
  });

  console.log(`✅ Push subscription criada para usuário ${userId}:`, {
    id: subscription.id,
    endpoint: subscription.endpoint.substring(0, 50) + '...'
  });

  return {
    id: subscription.id,
    userId: subscription.userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.p256dh,
    auth: subscription.auth,
    userAgent: subscription.userAgent ?? undefined,
    isActive: subscription.isActive,
    lastNotificationSent: subscription.lastNotificationSent?.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString()
  };
};

export const updatePushSubscription = async (
  userId: string,
  subscriptionId: string,
  updates: { isActive?: boolean; userAgent?: string }
): Promise<PushSubscriptionResponse> => {
  
  // Verificar se a assinatura pertence ao usuário
  const existingSubscription = await prisma.pushSubscription.findFirst({
    where: { id: subscriptionId, userId }
  });

  if (!existingSubscription) {
    throw new PushSubscriptionNotFoundError(subscriptionId);
  }

  const updatedSubscription = await prisma.pushSubscription.update({
    where: { id: subscriptionId },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });

  return {
    id: updatedSubscription.id,
    userId: updatedSubscription.userId,
    endpoint: updatedSubscription.endpoint,
    p256dh: updatedSubscription.p256dh,
    auth: updatedSubscription.auth,
    userAgent: updatedSubscription.userAgent ?? undefined,
    isActive: updatedSubscription.isActive,
    lastNotificationSent: updatedSubscription.lastNotificationSent?.toISOString(),
    createdAt: updatedSubscription.createdAt.toISOString(),
    updatedAt: updatedSubscription.updatedAt.toISOString()
  };
};

export const deletePushSubscription = async (
  userId: string,
  subscriptionId: string
): Promise<void> => {
  
  // Verificar se a assinatura pertence ao usuário
  const existingSubscription = await prisma.pushSubscription.findFirst({
    where: { id: subscriptionId, userId }
  });

  if (!existingSubscription) {
    throw new PushSubscriptionNotFoundError(subscriptionId);
  }

  await prisma.pushSubscription.delete({
    where: { id: subscriptionId }
  });

  console.log(`🗑️ Push subscription ${subscriptionId} removida para usuário ${userId}`);
};

export const getActivePushSubscriptions = async (userId: string): Promise<PushSubscriptionResponse[]> => {
  return getUserPushSubscriptions(userId, { isActive: true });
};

export const markSubscriptionAsNotified = async (subscriptionId: string): Promise<void> => {
  try {
    await prisma.pushSubscription.update({
      where: { id: subscriptionId },
      data: {
        lastNotificationSent: new Date()
      }
    });
  } catch (error) {
    console.warn(`⚠️ Falha ao atualizar timestamp de notificação para subscription ${subscriptionId}:`, error);
  }
};

export const deactivateInvalidSubscription = async (endpoint: string): Promise<void> => {
  try {
    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });
    
    console.log(`🚫 Push subscription desativada devido a endpoint inválido: ${endpoint.substring(0, 50)}...`);
  } catch (error) {
    console.warn(`⚠️ Falha ao desativar subscription inválida:`, error);
  }
};

// Função utilitária para limpar assinaturas antigas/inativas
export const cleanupOldSubscriptions = async (daysOld: number = 30): Promise<number> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const deletedCount = await prisma.pushSubscription.deleteMany({
    where: {
      isActive: false,
      updatedAt: {
        lt: cutoffDate
      }
    }
  });

  if (deletedCount.count > 0) {
    console.log(`🧹 Limpeza: ${deletedCount.count} push subscriptions antigas removidas`);
  }

  return deletedCount.count;
};