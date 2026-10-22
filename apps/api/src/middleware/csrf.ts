import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Defense-in-depth CSRF Protection:
 * 1. Verifies Origin / Referer header matches the configured FRONTEND_URL.
 * 2. For browser fetch requests using cookies, requires a custom header (e.g. X-Requested-With)
 *    which cannot be sent by cross-origin HTML form submissions without triggering a CORS preflight.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Expected origin from config (normalize trailing slash)
  const allowedOrigin = new URL(config.frontendUrl).origin;

  if (origin) {
    try {
      const requestOrigin = new URL(origin).origin;
      if (requestOrigin !== allowedOrigin) {
        res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_ORIGIN_MISMATCH',
            message: 'Cross-origin request rejected'
          }
        });
        return;
      }
    } catch {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_INVALID_ORIGIN',
          message: 'Malformed Origin header'
        }
      });
      return;
    }
  } else if (referer) {
    try {
      const requestRefererOrigin = new URL(referer).origin;
      if (requestRefererOrigin !== allowedOrigin) {
        res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_REFERER_MISMATCH',
            message: 'Cross-origin referer rejected'
          }
        });
        return;
      }
    } catch {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_INVALID_REFERER',
          message: 'Malformed Referer header'
        }
      });
      return;
    }
  }

  // Next, verify custom header for requests using cookie-based auth
  // Standard HTML forms cannot set custom headers, defeating cross-site request forgery
  const customHeader = req.headers['x-requested-with'];
  const hasAuthCookie = Boolean(req.cookies?.access_token || req.cookies?.refresh_token);

  if (hasAuthCookie && !customHeader) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_HEADER_MISSING',
        message: 'Missing required security header (X-Requested-With)'
      }
    });
    return;
  }

  next();
}
