import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery } from '../lib/validation';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  postponeTaskSchema,
  createTaskCommentSchema,
  taskFilterSchema
} from '../lib/validation';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticate);

// Rotas principais
router.get('/', validateQuery(taskFilterSchema), tasksController.getTasks);
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

export { router as taskRoutes };