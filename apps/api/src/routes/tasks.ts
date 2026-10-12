import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated } from '../utils/response';
import { authenticate, requireOrganization } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  jobId: z.string().optional(),
  candidateId: z.string().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: { OR: [{ assigneeId: req.user.sub }, { createdById: req.user.sub }] },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueDate: 'asc' },
      }),
      prisma.task.count({ where: { OR: [{ assigneeId: req.user.sub }, { createdById: req.user.sub }] } }),
    ]);
    sendPaginated(res, tasks, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = taskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: { ...body, createdById: req.user.sub, organizationId: req.user.organizationId!, dueDate: body.dueDate ? new Date(body.dueDate) : null },
    });
    sendSuccess(res, task, 201);
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, task);
  } catch (err) { next(err); }
});

export default router;
