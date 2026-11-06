import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export type UserRole =
  | 'SUPER_ADMIN' | 'ORG_ADMIN' | 'AGENCY_ADMIN' | 'RECRUITER'
  | 'SENIOR_RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER'
  | 'CLIENT_ADMIN' | 'CLIENT_USER' | 'CANDIDATE';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export const RECRUITER_ROLES: UserRole[] = [
  'ORG_ADMIN', 'AGENCY_ADMIN', 'RECRUITER', 'SENIOR_RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'
];

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 401);
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
}

export function requireOrganization(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.organizationId) {
    return sendError(res, 'Organization context required', 403);
  }
  next();
}
