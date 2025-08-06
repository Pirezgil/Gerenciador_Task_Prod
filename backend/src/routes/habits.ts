import { Router } from 'express';
import * as habitsController from '../controllers/habitsController';
import { authenticate } from '../middleware/auth';
import { validate } from '../lib/validation';
import { createHabitSchema, completeHabitSchema } from '../lib/validation';

const router = Router();

router.use(authenticate);

router.get('/', habitsController.getHabits);
router.get('/:id', habitsController.getHabit);
router.post('/', validate(createHabitSchema), habitsController.createHabit);
router.put('/:id', habitsController.updateHabit);
router.delete('/:id', habitsController.deleteHabit);
router.get('/:id/comments', habitsController.getHabitComments);
router.post('/:id/comments', habitsController.addHabitComment);
router.post('/:id/complete', validate(completeHabitSchema), habitsController.completeHabit);

export { router as habitRoutes };