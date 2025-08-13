// ============================================================================
// PUSH SUBSCRIPTION ROUTES - Rotas para gerenciamento de assinaturas push
// ============================================================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as pushSubscriptionController from '../controllers/pushSubscriptionController';
import { 
  pushSubscriptionLimit, 
  testNotificationLimit, 
  generalNotificationLimit 
} from '../middleware/notificationRateLimit';

const router = Router();

// Aplicar middleware de autenticação para todas as rotas
router.use(authenticate);

// ============================================================================
// ROTAS DE TESTE E UTILIDADES (DEVEM VIR ANTES DAS ROTAS COM :id)
// ============================================================================

// POST /api/push-subscriptions/test - Testar notificação push (muito restritivo)
router.post('/test', testNotificationLimit, pushSubscriptionController.testPushNotification);

// DELETE /api/push-subscriptions/cleanup - Limpar assinaturas antigas (admin, sem rate limit)
router.delete('/cleanup', pushSubscriptionController.cleanupOldSubscriptions);

// DELETE /api/push-subscriptions/cleanup-endpoint - Limpeza proativa de endpoint inválido
router.delete('/cleanup-endpoint', generalNotificationLimit, pushSubscriptionController.cleanupInvalidEndpoint);

// ============================================================================
// ROTAS PRINCIPAIS COM RATE LIMITING
// ============================================================================

// GET /api/push-subscriptions - Listar assinaturas do usuário
router.get('/', generalNotificationLimit, pushSubscriptionController.getUserPushSubscriptions);

// POST /api/push-subscriptions - Criar nova assinatura (restritivo)
router.post('/', pushSubscriptionLimit, pushSubscriptionController.createPushSubscription);

// PUT /api/push-subscriptions/:id - Atualizar assinatura
router.put('/:id', generalNotificationLimit, pushSubscriptionController.updatePushSubscription);

// DELETE /api/push-subscriptions/:id - Remover assinatura
router.delete('/:id', generalNotificationLimit, pushSubscriptionController.deletePushSubscription);

export { router as pushSubscriptionRoutes };