import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../app';
import { emailService } from './emailService';

const TOKEN_EXPIRY_HOURS = 1;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export const requestPasswordReset = async (data: ForgotPasswordRequest): Promise<void> => {
  const { email } = data;
  const startTime = Date.now();

  try {
    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('base64').replace(/[+/]/g, (c) => c === '+' ? '-' : '_').replace(/=/g, '');
    const hashedToken = await bcrypt.hash(resetToken, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Always do the database lookup for timing consistency
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true }
    });

    if (user) {
      // Clear any existing reset tokens for this user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: expiresAt
        }
      });

      // Send reset email (fire and forget)
      emailService.sendPasswordResetEmail(user.email, resetToken).catch(error => {
        console.error('Failed to send password reset email:', error);
      });
    } else {
      // Fake hash operation to maintain timing consistency
      await bcrypt.hash('dummy-token-for-timing', BCRYPT_ROUNDS);
    }

    // Ensure minimum response time to prevent timing attacks
    const elapsedTime = Date.now() - startTime;
    const minimumTime = 200; // 200ms minimum
    if (elapsedTime < minimumTime) {
      await new Promise(resolve => setTimeout(resolve, minimumTime - elapsedTime));
    }

    // Always return success message (don't reveal if email exists)
    return;
  } catch (error) {
    // Ensure minimum response time even on error
    const elapsedTime = Date.now() - startTime;
    const minimumTime = 200;
    if (elapsedTime < minimumTime) {
      await new Promise(resolve => setTimeout(resolve, minimumTime - elapsedTime));
    }
    
    console.error('Password reset request error:', error);
    throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
  }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  const { token, password, confirmPassword } = data;
  const startTime = Date.now();

  try {
    // Validate passwords match
    if (password !== confirmPassword) {
      throw new Error('As senhas não coincidem');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('A senha deve ter pelo menos 8 caracteres');
    }

    // Find user with valid reset token
    const users = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpires: { gt: new Date() }
      },
      select: {
        id: true,
        email: true,
        passwordResetToken: true,
        passwordResetExpires: true
      }
    });

    let validUser = null;
    
    // Check all potential users to find valid token (constant time)
    for (const user of users) {
      if (user.passwordResetToken) {
        const isValidToken = await bcrypt.compare(token, user.passwordResetToken);
        if (isValidToken) {
          validUser = user;
          break;
        }
      }
    }

    if (!validUser) {
      // Fake hash operation to maintain timing consistency
      await bcrypt.hash(password, BCRYPT_ROUNDS);
      throw new Error('Token inválido ou expirado');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: validUser.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      }
    });

    // Ensure minimum response time
    const elapsedTime = Date.now() - startTime;
    const minimumTime = 200;
    if (elapsedTime < minimumTime) {
      await new Promise(resolve => setTimeout(resolve, minimumTime - elapsedTime));
    }

    return;
  } catch (error) {
    // Ensure minimum response time even on error
    const elapsedTime = Date.now() - startTime;
    const minimumTime = 200;
    if (elapsedTime < minimumTime) {
      await new Promise(resolve => setTimeout(resolve, minimumTime - elapsedTime));
    }

    if (error instanceof Error) {
      throw error;
    }
    
    console.error('Password reset error:', error);
    throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
  }
};

export const validateResetToken = async (token: string): Promise<boolean> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpires: { gt: new Date() }
      },
      select: {
        passwordResetToken: true
      }
    });

    // Check all potential users to find valid token
    for (const user of users) {
      if (user.passwordResetToken) {
        const isValidToken = await bcrypt.compare(token, user.passwordResetToken);
        if (isValidToken) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};