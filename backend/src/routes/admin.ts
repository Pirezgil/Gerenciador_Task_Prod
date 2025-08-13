// ============================================================================
// ADMIN ROUTES - Rotas administrativas para monitoramento e manutenção
// ============================================================================

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotificationRateLimitStats } from '../middleware/notificationRateLimit';
import { getAuthRateLimitStats } from '../middleware/authRateLimit';

const router = Router();

// Aplicar autenticação para todas as rotas administrativas
router.use(authenticate);

// ============================================================================
// RATE LIMITING STATISTICS
// ============================================================================

/**
 * GET /api/admin/rate-limit-stats
 * 
 * Retorna estatísticas de rate limiting para monitoramento
 * Útil para identificar tentativas de abuso e ajustar configurações
 */
router.get('/rate-limit-stats', async (_req: Request, res: Response) => {
  try {
    const authStats = getAuthRateLimitStats();
    const notificationStats = getNotificationRateLimitStats();
    
    const stats = {
      timestamp: new Date().toISOString(),
      authRateLimit: authStats,
      notificationRateLimit: notificationStats,
      summary: {
        totalActiveKeys: authStats.totalKeys + 
          notificationStats.createReminder.totalKeys +
          notificationStats.pushSubscription.totalKeys +
          notificationStats.testNotification.totalKeys +
          notificationStats.general.totalKeys,
        totalBlockedKeys: authStats.blockedKeys +
          notificationStats.createReminder.blockedKeys +
          notificationStats.pushSubscription.blockedKeys +
          notificationStats.testNotification.blockedKeys +
          notificationStats.general.blockedKeys,
        totalAttempts: authStats.totalAttempts +
          notificationStats.createReminder.totalAttempts +
          notificationStats.pushSubscription.totalAttempts +
          notificationStats.testNotification.totalAttempts +
          notificationStats.general.totalAttempts
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de rate limiting:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao obter estatísticas'
    });
  }
});

// ============================================================================
// SYSTEM HEALTH CHECK
// ============================================================================

/**
 * GET /api/admin/health
 * 
 * Endpoint simples de verificação de saúde do sistema
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      version: process.env.npm_package_version || 'unknown'
    }
  });
});

export { router as adminRoutes };