import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFound, logger, disconnectPrisma } from '@searchkraft/shared';
import jobsRoutes from './routes/jobs';
import pipelineRoutes from './routes/pipeline';
import clientsRoutes from './routes/clients';

const app = express();
const PORT = parseInt(process.env.PORT || '3002', 10);

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health checks
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'jobs-service', timestamp: new Date().toISOString() }));
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/readyz', (_req, res) => res.json({ status: 'ready' }));

// Routes
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/pipeline', pipelineRoutes);
app.use('/api/v1/clients', clientsRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Jobs service running on port ${PORT}`);
});

const shutdown = async () => {
  logger.info('Shutting down jobs-service...');
  server.close();
  await disconnectPrisma();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
