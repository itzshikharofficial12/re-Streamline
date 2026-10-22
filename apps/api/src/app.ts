import express, { type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { HealthResponse } from '@streamline/types';
import { config } from './config/env.js';
import { csrfProtection } from './middleware/csrf.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';

export function createApp(): express.Application {
  const app = express();

  // Configure strict CORS with credentials
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  // CSRF protection for state-changing browser requests
  app.use(csrfProtection);

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Streamline API',
      version: '0.0.1',
      status: 'operational',
      endpoints: {
        health: '/health',
        auth: '/auth'
      }
    });
  });

  app.get('/health', (_req: Request, res: Response<HealthResponse>) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'api',
      version: '0.0.1',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Mount Auth Router
  app.use('/auth', createAuthRouter());

  return app;
}
