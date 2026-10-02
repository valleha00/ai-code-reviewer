import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import apiV1Router from './routes/index.js';

const app = express();

// Security and utility middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(requestLogger);

// API Routes
app.use('/api/v1', apiV1Router);

// 404 handler for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`
┌───────────────────────────────────────────────────────────┐
│   🤖 AI Code Reviewer Backend API v1.0.0                  │
│   • Server running at: http://localhost:${env.PORT}           │
│   • Health check:     http://localhost:${env.PORT}/api/v1/health │
│   • Analysis API:     http://localhost:${env.PORT}/api/v1/review/analyze│
│   • Environment:      ${env.NODE_ENV}                         │
└───────────────────────────────────────────────────────────┘
  `);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
