import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated } from '../utils/response';
import { authenticate, requireOrganization, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

router.get('/', requireRoles('ORG_ADMIN', 'AGENCY_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { organizationId: orgId },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, lastLoginAt: true },
      }),
      prisma.user.count({ where: { organizationId: orgId } }),
    ]);
    sendPaginated(res, users, total, page, limit);
  } catch (err) { next(err); }
});

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { id: true, email: true, name: true, role: true, organizationId: true, avatarUrl: true, title: true, phone: true },
    });
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

export default router;
