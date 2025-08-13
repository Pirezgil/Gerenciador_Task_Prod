import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../lib/validation';
import { loginSchema, registerSchema, updateUserSchema, forgotPasswordSchema, resetPasswordSchema } from '../lib/validation';
import { authRateLimit } from '../middleware/authRateLimit';
import { checkPasswordResetRateLimit } from '../middleware/passwordResetRateLimit';

const router = Router();

// Rotas públicas (com rate limiting para segurança)
router.post('/register', authRateLimit, validate(registerSchema), authController.register);
router.post('/login', authRateLimit, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authRateLimit, authController.refreshToken); // Rate limit para refresh também

// Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Password Reset
router.post('/forgot-password', checkPasswordResetRateLimit, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/validate-reset-token', authController.validateResetToken);

// Rotas protegidas
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, validate(updateUserSchema), authController.updateProfile);

export { router as authRoutes };