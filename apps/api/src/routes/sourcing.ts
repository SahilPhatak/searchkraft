import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { authenticate, requireOrganization, requireRoles, RECRUITER_ROLES } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

// ─── Schemas ─────────────────────────────────────────

const createAgentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  searchQuery: z.string().min(1),
  filters: z.any().optional(),
  jobId: z.string().optional(),
});

const updateAgentSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  searchQuery: z.string().min(1).optional(),
  filters: z.any().optional(),
});

const reviewResultSchema = z.object({
  isShortlisted: z.boolean().optional(),
});

const createSavedSearchSchema = z.object({
  name: z.string().min(1),
  query: z.string().min(1),
  filters: z.any().optional(),
});

// ─── Sourcing Agents ─────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: Record<string, unknown> = { organizationId: orgId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { searchQuery: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [agents, total] = await Promise.all([
      prisma.sourcingAgent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { job: { select: { title: true } }, _count: { select: { results: true } } },
      }),
      prisma.sourcingAgent.count({ where }),
    ]);
    sendPaginated(res, agents, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createAgentSchema.parse(req.body);
    const orgId = req.user.organizationId!;
    const agent = await prisma.sourcingAgent.create({
      data: { ...body, organizationId: orgId, createdById: req.user.sub },
    });
    sendSuccess(res, agent, 201);
  } catch (err) { next(err); }
});

router.get('/saved-searches', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const searches = await prisma.savedSearch.findMany({
      where: { organizationId: orgId, userId: req.user.sub },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, searches);
  } catch (err) { next(err); }
});

router.post('/saved-searches', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createSavedSearchSchema.parse(req.body);
    const orgId = req.user.organizationId!;
    const search = await prisma.savedSearch.create({
      data: { ...body, organizationId: orgId, userId: req.user.sub },
    });
    sendSuccess(res, search, 201);
  } catch (err) { next(err); }
});

router.delete('/saved-searches/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = await prisma.savedSearch.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId!, userId: req.user.sub },
    });
    if (!search) throw new AppError('Saved search not found', 404);
    await prisma.savedSearch.delete({ where: { id: req.params.id } });
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await prisma.sourcingAgent.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
      include: {
        job: { select: { title: true, status: true } },
        createdBy: { select: { name: true } },
        _count: { select: { results: true } },
      },
    });
    if (!agent) throw new AppError('Sourcing agent not found', 404);
    sendSuccess(res, agent);
  } catch (err) { next(err); }
});

router.patch('/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateAgentSchema.parse(req.body);
    const agent = await prisma.sourcingAgent.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!agent) throw new AppError('Sourcing agent not found', 404);
    const updated = await prisma.sourcingAgent.update({ where: { id: req.params.id }, data: body });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await prisma.sourcingAgent.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!agent) throw new AppError('Sourcing agent not found', 404);
    await prisma.sourcingAgent.delete({ where: { id: req.params.id } });
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
});

router.get('/:id/results', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const agent = await prisma.sourcingAgent.findFirst({
      where: { id: req.params.id, organizationId: orgId },
    });
    if (!agent) throw new AppError('Sourcing agent not found', 404);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      prisma.sourcingResult.findMany({
        where: { agentId: req.params.id },
        skip,
        take: limit,
        orderBy: { matchScore: 'desc' },
        include: { candidate: { select: { name: true, email: true, currentTitle: true, currentCompany: true, skills: true } } },
      }),
      prisma.sourcingResult.count({ where: { agentId: req.params.id } }),
    ]);
    sendPaginated(res, results, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/:id/results/:resultId/review', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = reviewResultSchema.parse(req.body);
    const agent = await prisma.sourcingAgent.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!agent) throw new AppError('Sourcing agent not found', 404);

    const result = await prisma.sourcingResult.findFirst({
      where: { id: req.params.resultId, agentId: req.params.id },
    });
    if (!result) throw new AppError('Result not found', 404);

    const updated = await prisma.sourcingResult.update({
      where: { id: req.params.resultId },
      data: { isReviewed: true, ...(body.isShortlisted !== undefined && { isShortlisted: body.isShortlisted }) },
    });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

export default router;
