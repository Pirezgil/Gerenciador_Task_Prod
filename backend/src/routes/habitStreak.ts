import express from 'express';
import { authenticate } from '../middleware/auth';
import { HabitStreakService } from '../services/habitStreakService';
import { AuthenticatedRequest } from '../types/api';

const router = express.Router();

router.get('/streak', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const streak = await HabitStreakService.getHabitStreak(userId);
    return res.json(streak);
  } catch (error) {
    console.error('Erro ao buscar sequência de hábitos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;