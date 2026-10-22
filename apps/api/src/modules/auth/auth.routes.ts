import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { createRateLimiter } from '../../middleware/rateLimit.js';

export function createAuthRouter(): Router {
  const router = Router();

  // Rate limiters for sensitive authentication endpoints
  const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  });

  const refreshLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: 'Too many refresh attempts. Please try again later.'
  });

  // Endpoints
  router.post('/signup', authLimiter, (req, res) => authController.signup(req, res));
  router.post('/login', authLimiter, (req, res) => authController.login(req, res));
  router.post('/refresh', refreshLimiter, (req, res) => authController.refresh(req, res));
  router.post('/logout', (req, res) => authController.logout(req, res));
  router.get('/me', requireAuth, (req, res) => authController.getMe(req, res));

  return router;
}
