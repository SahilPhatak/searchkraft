import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { authenticate, requireOrganization, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

const clientSchema = z.object({
  name: z.string().min(2),
  industry: z.string().optional(),
  website: z.string().url().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const [clients, total] = await Promise.all([
      prisma.client.findMany({ where: { organizationId: orgId }, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' }, include: { _count: { select: { jobs: true } } } }),
      prisma.client.count({ where: { organizationId: orgId } }),
    ]);
    sendPaginated(res, clients, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/', requireRoles('ORG_ADMIN', 'AGENCY_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = clientSchema.parse(req.body);
    const orgId = req.user.organizationId!;
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    const client = await prisma.client.create({ data: { ...body, slug, organizationId: orgId } });
    sendSuccess(res, client, 201);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
      include: { jobs: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!client) throw new AppError('Client not found', 404);
    sendSuccess(res, client);
  } catch (err) { next(err); }
});

export default router;
