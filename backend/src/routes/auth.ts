import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../lib/validation';
import { loginSchema, registerSchema, updateUserSchema } from '../lib/validation';

const router = Router();

// Rotas públicas
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// Rotas protegidas
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, validate(updateUserSchema), authController.updateProfile);

export { router as authRoutes };