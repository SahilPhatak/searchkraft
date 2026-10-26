import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { env } from '../utils/env';
import { sendSuccess, sendError, AppError } from '../utils/response';
import { authenticate } from '../middleware/auth';

// In-memory password reset tokens (token -> { email, expiresAt })
// In production, use a DB table or Redis
const resetTokens = new Map<string, { email: string; expiresAt: Date }>();

// Cleanup expired tokens every 15 minutes
setInterval(() => {
  const now = new Date();
  for (const [token, data] of resetTokens) {
    if (data.expiresAt < now) resetTokens.delete(token);
  }
}, 15 * 60 * 1000);

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['RECRUITER', 'CANDIDATE']).default('RECRUITER'),
  organizationName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new AppError('Email already registered', 409);

    let organizationId: string | null = null;
    if (body.role !== 'CANDIDATE' && body.organizationName) {
      const slug = body.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
      const org = await prisma.organization.create({
        data: { name: body.organizationName, slug, plan: 'FREE' },
      });
      organizationId = org.id;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { email: body.email, passwordHash, name: body.name, role: body.role, organizationId },
    });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    sendSuccess(res, {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId },
    }, 201, 'Account created');
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    sendSuccess(res, {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { id: true, email: true, name: true, role: true, organizationId: true, avatarUrl: true, title: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, (_req: Request, res: Response) => {
  sendSuccess(res, null, 200, 'Logged out');
});

// --- Forgot / Reset Password ---

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = forgotSchema.parse(req.body);

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.isActive) {
      const token = crypto.randomBytes(32).toString('hex');
      resetTokens.set(token, { email, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }); // 1 hour

      // In production, send an email with the reset link:
      // https://yourdomain.com/reset-password?token=<token>
      // For now, log it (only in dev)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Password reset token for ${email}: ${token}`);
      }
    }

    sendSuccess(res, null, 200, 'If that email is registered, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = resetSchema.parse(req.body);

    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      resetTokens.delete(token);
      throw new AppError('Reset link is invalid or has expired.', 400);
    }

    const user = await prisma.user.findUnique({ where: { email: tokenData.email } });
    if (!user) throw new AppError('Reset link is invalid or has expired.', 400);

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    // Invalidate the used token
    resetTokens.delete(token);

    sendSuccess(res, null, 200, 'Password has been reset successfully.');
  } catch (err) {
    next(err);
  }
});

export default router;
