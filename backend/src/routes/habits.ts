import { Router } from 'express';
import * as habitsController from '../controllers/habitsController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../lib/validation';
import { createHabitSchema, completeHabitSchema } from '../lib/validation';
import { 
  createReminderLimit, 
  readReminderLimit,
  generalNotificationLimit
} from '../middleware/notificationRateLimit';

const router = Router();

// ETAPA 2: Proteção server-side robusta
router.use(requireAuth);

router.get('/', habitsController.getHabits);
router.get('/:id', habitsController.getHabit);
router.post('/', validate(createHabitSchema), habitsController.createHabit);
router.put('/:id', habitsController.updateHabit);
router.delete('/:id', habitsController.deleteHabit);
router.get('/:id/comments', habitsController.getHabitComments);
router.post('/:id/comments', habitsController.addHabitComment);
router.post('/:id/complete', validate(completeHabitSchema), habitsController.completeHabit);

// ===== NOVOS ENDPOINTS DE LEMBRETES PARA HÁBITOS =====
// Criar lembretes para hábito
router.post('/:habitId/reminders', createReminderLimit, habitsController.createHabitReminder);
// Listar lembretes de um hábito
router.get('/:habitId/reminders', readReminderLimit, habitsController.getHabitReminders);
// Remover lembrete de hábito
router.delete('/reminders/:reminderId', generalNotificationLimit, habitsController.deleteHabitReminder);

export { router as habitRoutes };