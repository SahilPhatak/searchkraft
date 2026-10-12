import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AppError } from '../utils/response';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Record already exists' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    logger.error('Prisma error', { code: err.code, meta: err.meta });
    return res.status(500).json({ success: false, error: 'Database error' });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  return res.status(500).json({ success: false, error: 'Internal server error' });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'Route not found' });
}
