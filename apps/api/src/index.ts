import { createApp } from './app.js';

const port = Number(process.env.API_PORT || process.env.PORT || 4000);
const app = createApp();

const server = app.listen(port, () => {
  console.log(`[Streamline API] Running on http://localhost:${port}`);
  console.log(`[Streamline API] Health check available at http://localhost:${port}/health`);
});

const shutdown = (signal: string) => {
  console.log(`\n[Streamline API] Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('[Streamline API] HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[Streamline API] Force shutdown after timeout.');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
