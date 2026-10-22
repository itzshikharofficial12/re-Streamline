import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@streamline/auth';
import { prisma } from '@streamline/database';
import type { SafeUser } from '@streamline/types';
import { config } from '../config/env.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Extract token from HttpOnly cookie or Authorization Bearer header
    let token = req.cookies?.access_token as string | undefined;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required'
        }
      });
      return;
    }

    // 2. Verify signature and claims (sub, iss, aud, exp, tokenPurpose)
    const payload = await verifyAccessToken(token, {
      secret: config.jwt.secret,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });

    // 3. Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account no longer exists'
        }
      });
      return;
    }

    // 4. Attach safe user to request context
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid or expired token';
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message
      }
    });
  }
}
