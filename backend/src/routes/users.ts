import { Router } from 'express';
import * as userController from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../lib/validation';
import { updateUserSettingsSchema, updateUserProfileSchema } from '../lib/validation';

const router = Router();

// ETAPA 2: Proteção de rotas server-side robusta
router.use(requireAuth);

router.get('/settings', userController.getSettings);
router.put('/settings', validate(updateUserSettingsSchema), userController.updateSettings);
router.put('/profile', validate(updateUserProfileSchema), userController.updateProfile);
router.get('/stats', userController.getStats);

export { router as userRoutes };