import type { Request, Response } from 'express';
import { waitlistSchema } from '@streamline/validation';
import { waitlistService, WaitlistConflictError } from './waitlist.service.js';

export class WaitlistController {
  async join(req: Request, res: Response): Promise<void> {
    try {
      // 1. Strict validation of request body
      const parsed = waitlistSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email address',
            details: parsed.error.format()
          }
        });
        return;
      }

      // 2. Add to waitlist
      const entry = await waitlistService.join(parsed.data);

      res.status(201).json({
        success: true,
        data: {
          entry,
          message: "You're on the list!"
        }
      });
    } catch (err: unknown) {
      if (err instanceof WaitlistConflictError) {
        res.status(409).json({
          success: false,
          error: {
            code: err.code,
            message: err.message
          }
        });
        return;
      }

      // Log server diagnostic without exposing internal error or sensitive data
      console.error(
        '[WaitlistController.join] Unexpected error:',
        err instanceof Error ? err.message : err
      );

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  }
}

export const waitlistController = new WaitlistController();
