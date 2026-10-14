import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth';
import jobsRouter from './routes/jobs';
import candidatesRouter from './routes/candidates';
import pipelineRouter from './routes/pipeline';
import aiRouter from './routes/ai';
import analyticsRouter from './routes/analytics';
import clientsRouter from './routes/clients';
import notificationsRouter from './routes/notifications';
import tasksRouter from './routes/tasks';
import usersRouter from './routes/users';
import searchRouter from './routes/search';
import { errorHandler, notFound } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://sahilphatak.github.io',
    ],
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/jobs', jobsRouter);
  app.use('/api/v1/candidates', candidatesRouter);
  app.use('/api/v1/pipeline', pipelineRouter);
  app.use('/api/v1/ai', aiRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/clients', clientsRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/tasks', tasksRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/search', searchRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
