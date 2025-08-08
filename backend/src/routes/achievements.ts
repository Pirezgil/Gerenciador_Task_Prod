import { Router, Request, Response } from 'express';
import AchievementService from '../services/achievementService';
import { authenticate } from '../middleware/auth';
import { AchievementType, TaskAchievementSubtype } from '../types/achievement';

const router = Router();

// ===== ROTAS DE CONQUISTAS =====

/**
 * GET /api/achievements
 * Busca todas as conquistas do usuário
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, subtype, startDate, endDate, limit, offset } = req.query;

    const filters: any = {
      type: type as string,
      subtype: subtype as string,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    // Remove filtros vazios
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined || 
          filters[key as keyof typeof filters] === '') {
        delete filters[key as keyof typeof filters];
      }
    });

    const result = await AchievementService.getUserAchievements(userId, filters);
    res.json(result);

  } catch (error: any) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * GET /api/achievements/rewards-page
 * Busca dados completos para a página de recompensas
 */
router.get('/rewards-page', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const data = await AchievementService.getRewardsPageData(userId);
    res.json(data);

  } catch (error: any) {
    console.error('Erro ao buscar dados da página de recompensas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * POST /api/achievements
 * Criar uma conquista manualmente (para testes/admin)
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, subtype, relatedId, metadata } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Tipo de conquista é obrigatório' });
    }

    const achievementData = {
      userId,
      type,
      subtype,
      relatedId,
      metadata
    };

    const achievement = await AchievementService.createAchievement(achievementData);
    res.status(201).json(achievement);

  } catch (error: any) {
    console.error('Erro ao criar conquista:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// ===== ROTAS DE PROGRESSO DIÁRIO =====

/**
 * GET /api/achievements/daily-progress/:date
 * Busca progresso diário específico
 */
router.get('/daily-progress/:date', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { date } = req.params;

    const progress = await AchievementService.getDailyProgress(userId, date);
    
    if (!progress) {
      return res.status(404).json({ error: 'Progresso não encontrado para esta data' });
    }

    res.json(progress);

  } catch (error: any) {
    console.error('Erro ao buscar progresso diário:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * PUT /api/achievements/daily-progress/:date
 * Atualiza progresso diário
 */
router.put('/daily-progress/:date', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { date } = req.params;
    const { plannedTasks, completedTasks, achievedMastery } = req.body;

    const updateData = {
      userId,
      date,
      plannedTasks,
      completedTasks,
      achievedMastery
    };

    const progress = await AchievementService.updateDailyProgress(updateData);
    res.json(progress);

  } catch (error: any) {
    console.error('Erro ao atualizar progresso diário:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * GET /api/achievements/stats
 * Busca estatísticas resumidas das conquistas
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const result = await AchievementService.getUserAchievements(userId);
    
    res.json({
      stats: result.stats,
      recentAchievements: result.recentAchievements
    });

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * GET /api/achievements/weekly
 * Busca medalhas da semana (domingo a sábado)
 */
router.get('/weekly', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
    
    const weeklyData = await AchievementService.getWeeklyAchievements(userId, targetDate);
    
    res.json(weeklyData);

  } catch (error: any) {
    console.error('Erro ao buscar medalhas da semana:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * GET /api/achievements/today-count
 * Busca quantidade de medalhas ganhas hoje
 */
router.get('/today-count', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const today = new Date().toISOString().split('T')[0];
    
    const count = await AchievementService.getTodayAchievementsCount(userId, today);
    
    res.json({ count, date: today });

  } catch (error: any) {
    console.error('Erro ao buscar contador de medalhas de hoje:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * POST /api/achievements/check-daily-mastery
 * Força verificação de conquista de Mestre do Dia (para testes)
 */
router.post('/check-daily-mastery', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { date } = req.body;
    
    const dateToCheck = date || new Date().toISOString().split('T')[0];
    
    const achievement = await AchievementService.checkDailyMastery(userId, dateToCheck);
    
    if (achievement) {
      res.json({ 
        message: 'Conquista de Mestre do Dia obtida!',
        achievement 
      });
    } else {
      res.json({ 
        message: 'Condições para Mestre do Dia ainda não foram atingidas',
        achievement: null 
      });
    }

  } catch (error: any) {
    console.error('Erro ao verificar maestria diária:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * POST /api/achievements/check-weekly-legend
 * Força verificação de conquista de Lenda da Semana (para testes)
 */
router.post('/check-weekly-legend', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { weekStartDate } = req.body;
    
    if (!weekStartDate) {
      return res.status(400).json({ error: 'Data de início da semana é obrigatória' });
    }
    
    const achievement = await AchievementService.checkWeeklyLegend(userId, weekStartDate);
    
    if (achievement) {
      res.json({ 
        message: 'Conquista de Lenda da Semana obtida!',
        achievement 
      });
    } else {
      res.json({ 
        message: 'Condições para Lenda da Semana ainda não foram atingidas',
        achievement: null 
      });
    }

  } catch (error: any) {
    console.error('Erro ao verificar lenda semanal:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * POST /api/achievements/create-sample-data
 * Cria dados de exemplo para demonstração (APENAS PARA DESENVOLVIMENTO)
 */
router.post('/create-sample-data', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Criar algumas conquistas de exemplo
    const sampleAchievements = [
      {
        userId,
        type: 'task_completion' as AchievementType,
        subtype: 'bronze' as TaskAchievementSubtype,
        metadata: {
          energyPoints: 1 as 1,
          taskDescription: 'Organizar mesa de trabalho',
        }
      },
      {
        userId,
        type: 'task_completion' as AchievementType,
        subtype: 'silver' as TaskAchievementSubtype,
        metadata: {
          energyPoints: 3 as 3,
          taskDescription: 'Completar relatório mensal',
        }
      },
      {
        userId,
        type: 'project_completion' as AchievementType,
        metadata: {
          projectName: 'Sistema de Recompensas',
          tasksInProject: 5,
        }
      },
      {
        userId,
        type: 'daily_master' as AchievementType,
        metadata: {
          tasksCompletedToday: 8,
          dateCompleted: new Date().toISOString().split('T')[0],
        }
      }
    ];

    const createdAchievements = [];
    for (const achievementData of sampleAchievements) {
      const achievement = await AchievementService.createAchievement(achievementData);
      createdAchievements.push(achievement);
    }

    // Criar progresso diário de exemplo
    await AchievementService.updateDailyProgress({
      userId,
      date: new Date().toISOString().split('T')[0],
      plannedTasks: 10,
      completedTasks: 8,
      achievedMastery: true,
    });

    res.json({
      message: 'Dados de exemplo criados com sucesso!',
      achievements: createdAchievements.length,
    });

  } catch (error: any) {
    console.error('Erro ao criar dados de exemplo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

export default router;