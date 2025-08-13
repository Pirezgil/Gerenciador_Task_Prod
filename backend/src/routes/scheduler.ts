import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { reminderScheduler, schedulerHealthCheck } from '../services/reminderScheduler';
import { notificationService } from '../services/notificationService';
import { AuthenticatedRequest } from '../types/api';

const router = Router();

// Aplicar autenticação (apenas admins deveriam acessar essas rotas em produção)
router.use(authenticate);

// ============================================================================
// ROTAS DE MONITORAMENTO
// ============================================================================

// Status completo do scheduler
router.get('/status', async (_req, res) => {
  try {
    const status = await schedulerHealthCheck.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Erro ao buscar status do scheduler:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Métricas do scheduler
router.get('/metrics', async (_req, res) => {
  try {
    const metrics = await schedulerHealthCheck.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Erro ao buscar métricas do scheduler:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Próximos lembretes agendados
router.get('/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const upcoming = await reminderScheduler.getUpcomingReminders(limit);
    res.json(upcoming);
  } catch (error) {
    console.error('Erro ao buscar próximos lembretes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ENDPOINT INTERNO PARA SCHEDULER =====
// Este endpoint é usado internamente pelo scheduler para acessar todos os lembretes ativos
// APENAS para usuários autenticados (admins/sistema)
router.get('/active-reminders-internal', async (_req, res) => {
  try {
    console.log('🔧 INTERNAL ENDPOINT - Admin/sistema acessando todos os lembretes ativos para scheduler');
    
    // Importar o service diretamente para manter separação
    const { getActiveReminders } = await import('../services/reminderService');
    const reminders = await getActiveReminders();
    
    console.log(`🔧 SCHEDULER ENDPOINT - Retornando ${reminders.length} lembretes ativos do sistema`);
    
    res.json({
      success: true,
      data: reminders,
      meta: {
        count: reminders.length,
        usage: 'internal-scheduler-only'
      }
    });
  } catch (error) {
    console.error('❌ Erro no endpoint interno do scheduler:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================================================
// ROTAS DE CONTROLE
// ============================================================================

// Executar scheduler manualmente
router.post('/run', async (_req, res) => {
  try {
    await reminderScheduler.runOnce();
    res.json({ message: 'Scheduler executado com sucesso' });
  } catch (error) {
    console.error('Erro ao executar scheduler:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Iniciar scheduler
router.post('/start', (_req, res) => {
  try {
    reminderScheduler.start();
    res.json({ message: 'Scheduler iniciado' });
  } catch (error) {
    console.error('Erro ao iniciar scheduler:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Parar scheduler
router.post('/stop', (_req, res) => {
  try {
    reminderScheduler.stop();
    res.json({ message: 'Scheduler parado' });
  } catch (error) {
    console.error('Erro ao parar scheduler:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Reiniciar scheduler
router.post('/restart', (_req, res) => {
  try {
    reminderScheduler.restart();
    res.json({ message: 'Scheduler reiniciado' });
  } catch (error) {
    console.error('Erro ao reiniciar scheduler:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Resetar estatísticas
router.post('/reset-stats', (_req, res) => {
  try {
    reminderScheduler.resetStats();
    res.json({ message: 'Estatísticas resetadas' });
  } catch (error) {
    console.error('Erro ao resetar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================================================
// ROTAS DE CONFIGURAÇÃO
// ============================================================================

// Obter configuração atual
router.get('/config', (_req, res) => {
  try {
    const config = reminderScheduler.getConfig();
    res.json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configuração
router.put('/config', (req, res) => {
  try {
    const updates = req.body;
    reminderScheduler.updateConfig(updates);
    
    const newConfig = reminderScheduler.getConfig();
    res.json({ 
      message: 'Configuração atualizada',
      config: newConfig 
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================================================
// ROTAS DE TESTE
// ============================================================================

// Testar notificação
router.post('/test-notification', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { type } = req.body;
    if (!['push', 'email', 'sms'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de notificação inválido' });
    }

    const result = await notificationService.testNotification(userId, type);
    return res.json(result);
  } catch (error) {
    console.error('Erro ao testar notificação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as schedulerRoutes };