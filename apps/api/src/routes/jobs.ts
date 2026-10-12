import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { authenticate, requireOrganization, requireRoles, RECRUITER_ROLES } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

const createJobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  workMode: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).default('HYBRID'),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).default('MID'),
  location: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('USD'),
  skills: z.array(z.string()).default([]),
  department: z.string().optional(),
  headcount: z.number().default(1),
  clientId: z.string().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where = { organizationId: orgId, ...(status && { status: status as never }) };
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { client: { select: { name: true, logoUrl: true } } } }),
      prisma.job.count({ where }),
    ]);
    sendPaginated(res, jobs, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createJobSchema.parse(req.body);
    const orgId = req.user.organizationId!;
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    const job = await prisma.job.create({
      data: { ...body, slug, organizationId: orgId, status: 'DRAFT', applicationCount: 0 },
    });

    // Create default pipeline stages
    const defaultStages = [
      { name: 'Sourced', stageType: 'SOURCED', order: 1, color: '#6B7280' },
      { name: 'Applied', stageType: 'APPLIED', order: 2, color: '#3B82F6' },
      { name: 'Screening', stageType: 'SCREENING', order: 3, color: '#F59E0B' },
      { name: 'Interview', stageType: 'INTERVIEW', order: 4, color: '#8B5CF6' },
      { name: 'Offer', stageType: 'OFFER', order: 5, color: '#10B981' },
      { name: 'Hired', stageType: 'HIRED', order: 6, color: '#059669' },
    ];
    await prisma.pipelineStage.createMany({
      data: defaultStages.map(s => ({ ...s, jobId: job.id })),
    });

    sendSuccess(res, job, 201);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
      include: { client: true, pipelineStages: { orderBy: { order: 'asc' } } },
    });
    if (!job) throw new AppError('Job not found', 404);
    sendSuccess(res, job);
  } catch (err) { next(err); }
});

router.patch('/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.job.findFirst({ where: { id: req.params.id, organizationId: req.user.organizationId! } });
    if (!job) throw new AppError('Job not found', 404);
    const updated = await prisma.job.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRoles('ORG_ADMIN', 'AGENCY_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.job.findFirst({ where: { id: req.params.id, organizationId: req.user.organizationId! } });
    if (!job) throw new AppError('Job not found', 404);
    await prisma.job.update({ where: { id: req.params.id }, data: { status: 'ARCHIVED' } });
    sendSuccess(res, null, 200, 'Job archived');
  } catch (err) { next(err); }
});

export default router;
