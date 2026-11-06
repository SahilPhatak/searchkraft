import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFound, logger, disconnectPrisma } from '@searchkraft/shared';
import notificationsRoutes from './routes/notifications';
import tasksRoutes from './routes/tasks';

const app = express();
const PORT = parseInt(process.env.PORT || '3004', 10);

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health checks
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'notification-service', timestamp: new Date().toISOString() }));
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/readyz', (_req, res) => res.json({ status: 'ready' }));

// Routes
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/tasks', tasksRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Notification service running on port ${PORT}`);
});

const shutdown = async () => {
  logger.info('Shutting down notification-service...');
  server.close();
  await disconnectPrisma();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
