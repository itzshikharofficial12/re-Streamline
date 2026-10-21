import express, { type Request, type Response } from 'express';
import cors from 'cors';
import type { HealthResponse } from '@streamline/types';

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Streamline API',
      version: '0.0.1',
      status: 'operational',
      endpoints: {
        health: '/health'
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

  return app;
}
