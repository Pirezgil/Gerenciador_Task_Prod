import { Router } from 'express';
import * as projectsController from '../controllers/projectsController';
import { authenticate } from '../middleware/auth';
import { validate } from '../lib/validation';
import { createProjectSchema, updateProjectSchema } from '../lib/validation';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticate);

// Rotas principais
router.get('/', projectsController.getProjects);
router.post('/', validate(createProjectSchema), projectsController.createProject);

router.get('/:id', projectsController.getProject);
router.put('/:id', validate(updateProjectSchema), projectsController.updateProject);
router.delete('/:id', projectsController.deleteProject);

// Estatísticas
router.get('/:id/stats', projectsController.getProjectStats);

export { router as projectRoutes };