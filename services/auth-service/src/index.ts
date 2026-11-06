import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFound, logger, disconnectPrisma } from '@searchkraft/shared';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import adminRoutes from './routes/admin';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health checks
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'auth-service', timestamp: new Date().toISOString() }));
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/readyz', (_req, res) => res.json({ status: 'ready' }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Auth service running on port ${PORT}`);
});

const shutdown = async () => {
  logger.info('Shutting down auth-service...');
  server.close();
  await disconnectPrisma();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
