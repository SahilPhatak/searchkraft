import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { authenticate, requireOrganization, requireRoles, RECRUITER_ROLES } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

const createCandidateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  experienceYears: z.number().optional(),
  skills: z.array(z.string()).default([]),
  summary: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  availabilityStatus: z.enum(['ACTIVELY_LOOKING', 'OPEN', 'NOT_LOOKING', 'EMPLOYED']).default('OPEN'),
  expectedSalary: z.number().optional(),
  noticePeriodDays: z.number().optional(),
});

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
        { email: { contains: search, mode: 'insensitive' } },
        { currentTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.candidate.count({ where }),
    ]);
    sendPaginated(res, candidates, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createCandidateSchema.parse(req.body);
    const orgId = req.user.organizationId!;
    const candidate = await prisma.candidate.create({ data: { ...body, organizationId: orgId } });
    sendSuccess(res, candidate, 201);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
      include: { notes: { orderBy: { createdAt: 'desc' } }, applications: { include: { job: { select: { title: true, status: true } }, stage: true } } },
    });
    if (!candidate) throw new AppError('Candidate not found', 404);
    sendSuccess(res, candidate);
  } catch (err) { next(err); }
});

router.patch('/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await prisma.candidate.findFirst({ where: { id: req.params.id, organizationId: req.user.organizationId! } });
    if (!candidate) throw new AppError('Candidate not found', 404);
    const updated = await prisma.candidate.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

router.post('/:id/notes', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = z.object({ content: z.string().min(1) }).parse(req.body);
    const candidate = await prisma.candidate.findFirst({ where: { id: req.params.id, organizationId: req.user.organizationId! } });
    if (!candidate) throw new AppError('Candidate not found', 404);
    const note = await prisma.candidateNote.create({
      data: { candidateId: req.params.id, authorId: req.user.sub, content },
    });
    sendSuccess(res, note, 201);
  } catch (err) { next(err); }
});

export default router;
