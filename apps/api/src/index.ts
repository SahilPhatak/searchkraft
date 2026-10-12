import 'dotenv/config';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './database/prisma';
import { logger } from './utils/logger';
import { validateEnv, env } from './utils/env';

async function main() {
  validateEnv();
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`SearchKraft API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch(err => {
  logger.error('Failed to start', { error: err.message });
  process.exit(1);
});
