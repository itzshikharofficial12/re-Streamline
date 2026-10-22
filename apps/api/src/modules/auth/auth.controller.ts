import type { Request, Response } from 'express';
import { signupSchema, loginSchema } from '@streamline/validation';
import { authService, AuthenticationError } from './auth.service.js';
import { config } from '../../config/env.js';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Access token lifetime: 10 minutes in ms
const ACCESS_TOKEN_MAX_AGE = 10 * 60 * 1000;

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const refreshMaxAge = config.refreshToken.expiresDays * 24 * 60 * 60 * 1000;

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/auth',
    maxAge: refreshMaxAge
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/'
  });

  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/auth'
  });
}

export class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid registration input',
            details: parsed.error.format()
          }
        });
        return;
      }

      const result = await authService.signup(parsed.data);
      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(201).json({
        success: true,
        data: {
          user: result.user
        }
      });
    } catch (err: unknown) {
      if (err instanceof AuthenticationError) {
        res.status(409).json({
          success: false,
          error: {
            code: err.code,
            message: err.message
          }
        });
        return;
      }

      console.error('[AuthController.signup]', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid credentials format',
            details: parsed.error.format()
          }
        });
        return;
      }

      const result = await authService.login(parsed.data);
      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user: result.user
        }
      });
    } catch (err: unknown) {
      if (err instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: err.code,
            message: err.message
          }
        });
        return;
      }

      console.error('[AuthController.login]', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken =
        (req.cookies?.[REFRESH_TOKEN_COOKIE] as string) ||
        (req.headers['x-refresh-token'] as string);

      if (!refreshToken) {
        clearAuthCookies(res);
        res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_MISSING',
            message: 'Refresh token is required'
          }
        });
        return;
      }

      const result = await authService.refresh(refreshToken);
      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user: result.user
        }
      });
    } catch (err: unknown) {
      clearAuthCookies(res);

      if (err instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: err.code,
            message: err.message
          }
        });
        return;
      }

      console.error('[AuthController.refresh]', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during token refresh'
        }
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken =
        (req.cookies?.[REFRESH_TOKEN_COOKIE] as string) ||
        (req.headers['x-refresh-token'] as string);

      await authService.logout(refreshToken);
    } finally {
      clearAuthCookies(res);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  }
}

export const authController = new AuthController();
