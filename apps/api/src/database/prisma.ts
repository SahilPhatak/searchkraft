import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient({
  log: [{ emit: 'event', level: 'query' }, 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

prisma.$on('query' as never, (e: { query: string; duration: number }) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query: ${e.query} (${e.duration}ms)`);
  }
});

export async function connectDatabase() {
  await prisma.$connect();
  logger.info('Database connected');
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
