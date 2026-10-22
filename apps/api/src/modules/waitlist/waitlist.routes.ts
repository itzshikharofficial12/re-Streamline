import { Router } from 'express';
import { waitlistController } from './waitlist.controller.js';
import { createRateLimiter } from '../../middleware/rateLimit.js';

export function createWaitlistRouter(): Router {
  const router = Router();

  // Public rate limiter: 20 submissions per 15 minutes per IP
  const waitlistRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many waitlist submissions. Please try again later.'
  });

  router.post('/', waitlistRateLimiter, (req, res) => waitlistController.join(req, res));

  return router;
}