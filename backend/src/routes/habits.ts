import { Router } from 'express';
import * as habitsController from '../controllers/habitsController';
import { authenticate } from '../middleware/auth';
import { validate } from '../lib/validation';
import { createHabitSchema, completeHabitSchema } from '../lib/validation';

const router = Router();

router.use(authenticate);

router.get('/', habitsController.getHabits);
router.post('/', validate(createHabitSchema), habitsController.createHabit);
router.post('/:id/complete', validate(completeHabitSchema), habitsController.completeHabit);

export { router as habitRoutes };