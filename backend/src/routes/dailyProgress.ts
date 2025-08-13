import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../app';
import { AuthenticatedRequest } from '../types/api';

const router = Router();

// GET /api/daily-progress - Buscar progresso diário
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const dateParam = req.query.date as string;
    
    let date: Date;
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date();
    }
    date.setHours(0, 0, 0, 0);
    
    const dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date
        }
      }
    });
    
    if (!dailyProgress) {
      return res.status(404).json({ message: 'Progresso diário não encontrado' });
    }
    
    return res.json({
      id: dailyProgress.id,
      userId: dailyProgress.userId,
      date: dailyProgress.date.toISOString().split('T')[0],
      plannedTasks: dailyProgress.plannedTasks,
      completedTasks: dailyProgress.completedTasks,
      plannedEnergyPoints: dailyProgress.plannedEnergyPoints,
      completedEnergyPoints: dailyProgress.completedEnergyPoints,
      achievedMastery: dailyProgress.achievedMastery,
      allHabitsCompleted: dailyProgress.allHabitsCompleted,
      celebrationShown: dailyProgress.celebrationShown,
      createdAt: dailyProgress.createdAt.toISOString(),
      updatedAt: dailyProgress.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar progresso diário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PATCH /api/daily-progress/celebration-shown - Marcar celebração como mostrada
router.patch('/celebration-shown', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const dateParam = req.body.date as string;
    
    let date: Date;
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date();
    }
    date.setHours(0, 0, 0, 0);
    
    console.log('🎯 Marcando celebração como mostrada:', { userId, date: date.toISOString().split('T')[0] });
    
    const updatedProgress = await prisma.dailyProgress.update({
      where: {
        userId_date: {
          userId,
          date
        }
      },
      data: {
        celebrationShown: true,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Celebração marcada como mostrada');
    
    res.json({
      id: updatedProgress.id,
      userId: updatedProgress.userId,
      date: updatedProgress.date.toISOString().split('T')[0],
      plannedTasks: updatedProgress.plannedTasks,
      completedTasks: updatedProgress.completedTasks,
      plannedEnergyPoints: updatedProgress.plannedEnergyPoints,
      completedEnergyPoints: updatedProgress.completedEnergyPoints,
      achievedMastery: updatedProgress.achievedMastery,
      allHabitsCompleted: updatedProgress.allHabitsCompleted,
      celebrationShown: updatedProgress.celebrationShown,
      createdAt: updatedProgress.createdAt.toISOString(),
      updatedAt: updatedProgress.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Erro ao marcar celebração como mostrada:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/daily-progress/test-reset - Resetar registros para teste (apenas desenvolvimento)
router.delete('/test-reset', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    console.log('🗑️ Resetando registros de celebração para teste...', { userId });
    
    // Deletar registros dos últimos 2 dias
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const deleteResult = await prisma.dailyProgress.deleteMany({
      where: {
        userId,
        date: {
          in: [yesterday, today]
        }
      }
    });
    
    console.log('✅ Registros deletados:', deleteResult.count);
    
    res.json({
      success: true,
      message: `${deleteResult.count} registro(s) de celebração removido(s) para teste`,
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Erro ao resetar registros:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export { router as dailyProgressRoutes };