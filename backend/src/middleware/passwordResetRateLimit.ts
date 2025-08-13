import { Request, Response, NextFunction } from 'express';
import { createErrorResponse, ErrorCode } from '../lib/errors';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAttempt: number;
}

class PasswordResetRateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private readonly maxAttempts = 3;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly cleanupInterval = 60 * 1000; // 1 minute

  constructor() {
    // Cleanup expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key);
      }
    }
  }

  private getClientKey(req: Request): string {
    const email = req.body.email?.toLowerCase() || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    return `${ip}:${email}`;
  }

  checkRateLimit = (req: Request, res: Response, next: NextFunction): void => {
    const key = this.getClientKey(req);
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry) {
      // First attempt
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
        lastAttempt: now
      });
      next();
      return;
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset the counter
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
        lastAttempt: now
      });
      next();
      return;
    }

    // Check if limit exceeded
    if (entry.count >= this.maxAttempts) {
      const timeRemaining = Math.ceil((entry.resetTime - now) / 1000 / 60);
      
      const response = createErrorResponse(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'password_reset_rate_limit',
        undefined,
        `Muitas tentativas de redefinição de senha. Tente novamente em ${timeRemaining} minutos.`
      );
      
      res.status(429).json(response);
      return;
    }

    // Increment counter
    entry.count++;
    entry.lastAttempt = now;
    this.attempts.set(key, entry);
    
    next();
  };

  clearAttempts(req: Request): void {
    const key = this.getClientKey(req);
    this.attempts.delete(key);
  }
}

export const passwordResetRateLimiter = new PasswordResetRateLimiter();
export const checkPasswordResetRateLimit = passwordResetRateLimiter.checkRateLimit;
export const clearPasswordResetAttempts = passwordResetRateLimiter.clearAttempts;