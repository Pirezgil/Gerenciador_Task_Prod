import { Router } from 'express';
import * as projectsController from '../controllers/projectsController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../lib/validation';
import { createProjectSchema, updateProjectSchema } from '../lib/validation';

const router = Router();

// ETAPA 2: Proteção de rotas server-side robusta
router.use(requireAuth);

// Rotas principais
router.get('/', projectsController.getProjects);
router.post('/', validate(createProjectSchema), projectsController.createProject);

router.get('/:id', projectsController.getProject);
router.put('/:id', validate(updateProjectSchema), projectsController.updateProject);
router.delete('/:id', projectsController.deleteProject);

// Estatísticas
router.get('/:id/stats', projectsController.getProjectStats);

// Gerenciamento de tarefas do projeto
router.put('/:id/tasks/:taskId', projectsController.updateProjectTask);

export { router as projectRoutes };