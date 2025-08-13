import { Router } from 'express';
import * as remindersController from '../controllers/remindersController';
import { requireAuth } from '../middleware/auth';
import { validate, validateQuery } from '../lib/validation';
import { 
  createReminderSchema, 
  updateReminderSchema,
  reminderFilterSchema
} from '../lib/validation';
import { 
  createReminderLimit, 
  generalNotificationLimit,
  readReminderLimit
} from '../middleware/notificationRateLimit';

const router = Router();

// ETAPA 2: Aplicar autenticação robusta a todas as rotas protegidas
router.use(requireAuth);

// Rotas principais com rate limiting
router.get('/', readReminderLimit, validateQuery(reminderFilterSchema), remindersController.getReminders);
router.get('/active', readReminderLimit, remindersController.getActiveReminders); // CORREÇÃO CRÍTICA: Agora filtra por usuário
router.post('/', createReminderLimit, validate(createReminderSchema), remindersController.createReminder);

router.get('/:id', readReminderLimit, remindersController.getReminder);
router.put('/:id', generalNotificationLimit, validate(updateReminderSchema), remindersController.updateReminder);
router.delete('/:id', generalNotificationLimit, remindersController.deleteReminder);

// Ações especiais
router.post('/:id/mark-sent', generalNotificationLimit, remindersController.markReminderSent);

export { router as reminderRoutes };