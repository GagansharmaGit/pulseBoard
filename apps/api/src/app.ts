import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestInterceptor } from './common/middleware/request-interceptor.middleware';
import { errorHandler } from './common/middleware/error-handler.middleware';
import { notFound } from './common/middleware/not-found.middleware';
import { healthRouter } from './modules/health/health.router';
import { env } from './config/env';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID'],
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestInterceptor);

  app.use('/api/health', healthRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
