import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';
import { requireAuth } from '../middleware/auth';
import { validate, validateQuery } from '../lib/validation';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  postponeTaskSchema,
  createTaskCommentSchema,
  taskFilterSchema
} from '../lib/validation';
import { 
  createReminderLimit, 
  readReminderLimit,
  generalNotificationLimit
} from '../middleware/notificationRateLimit';

const router = Router();

// ETAPA 2: Aplicar middleware de autenticação server-side robusto
router.use(requireAuth);

// Rotas principais
router.get('/', validateQuery(taskFilterSchema), tasksController.getTasks);
router.get('/bombeiro', tasksController.getBombeiroTasks);
router.post('/', validate(createTaskSchema), tasksController.createTask);

router.get('/:id', tasksController.getTask);
router.put('/:id', validate(updateTaskSchema), tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

// Ações especiais
router.post('/:id/complete', tasksController.completeTask);
router.post('/:id/postpone', validate(postponeTaskSchema), tasksController.postponeTask);

// Comentários
router.post('/:id/comments', validate(createTaskCommentSchema), tasksController.addComment);

// Orçamento de energia
router.get('/energy/budget', tasksController.getEnergyBudget);

// ===== NOVOS ENDPOINTS DE LEMBRETES =====
// Lembretes para tarefas normais/tijolos
router.post('/:taskId/reminders', createReminderLimit, tasksController.createTaskReminder);
// Lembretes para tarefas recorrentes
router.post('/:taskId/recurring-reminders', createReminderLimit, tasksController.createRecurringTaskReminders);
// Listar lembretes de uma tarefa
router.get('/:taskId/reminders', readReminderLimit, tasksController.getTaskReminders);
// Remover lembrete
router.delete('/reminders/:reminderId', generalNotificationLimit, tasksController.deleteTaskReminder);

export { router as taskRoutes };