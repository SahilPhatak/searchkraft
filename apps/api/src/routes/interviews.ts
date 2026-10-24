import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { authenticate, requireOrganization, requireRoles, RECRUITER_ROLES } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

// ─── Schemas ─────────────────────────────────────────

const interviewTypeEnum = z.enum(['SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'LIVE_CODING', 'CASE_STUDY', 'CULTURE_FIT']);
const interviewStatusEnum = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);

const createInterviewSchema = z.object({
  jobId: z.string().min(1),
  candidateId: z.string().min(1),
  type: interviewTypeEnum.default('SCREENING'),
  scheduledAt: z.string().datetime().optional(),
});

const updateInterviewSchema = z.object({
  status: interviewStatusEnum.optional(),
  overallScore: z.number().int().min(0).max(100).optional(),
  summary: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  recommendation: z.string().optional(),
  duration: z.number().int().optional(),
  recordingUrl: z.string().url().optional(),
  transcriptUrl: z.string().url().optional(),
});

const createQuestionSchema = z.object({
  questionText: z.string().min(1),
  order: z.number().int(),
  category: z.string().optional(),
});

const updateQuestionSchema = z.object({
  answerText: z.string().optional(),
  score: z.number().int().min(0).max(10).optional(),
  feedback: z.string().optional(),
});

const createSkillScoreSchema = z.object({
  skillName: z.string().min(1),
  score: z.number().int().min(0).max(10),
  maxScore: z.number().int().default(10),
  notes: z.string().optional(),
});

// ─── Interviews ──────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const jobId = req.query.jobId as string;
    const status = req.query.status as string;
    const type = req.query.type as string;

    const where: Record<string, unknown> = { job: { organizationId: orgId } };
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [interviews, total] = await Promise.all([
      prisma.aIInterview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: { select: { title: true } },
          candidate: { select: { name: true, email: true, currentTitle: true } },
          conductedBy: { select: { name: true } },
        },
      }),
      prisma.aIInterview.count({ where }),
    ]);
    sendPaginated(res, interviews, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createInterviewSchema.parse(req.body);
    const orgId = req.user.organizationId!;

    const job = await prisma.job.findFirst({ where: { id: body.jobId, organizationId: orgId } });
    if (!job) throw new AppError('Job not found', 404);

    const interview = await prisma.aIInterview.create({
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        conductedById: req.user.sub,
      },
    });
    sendSuccess(res, interview, 201);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interview = await prisma.aIInterview.findFirst({
      where: { id: req.params.id, job: { organizationId: req.user.organizationId! } },
      include: {
        job: { select: { title: true, status: true } },
        candidate: { select: { name: true, email: true, currentTitle: true, skills: true } },
        conductedBy: { select: { name: true } },
        questions: { orderBy: { order: 'asc' } },
        skillScores: true,
      },
    });
    if (!interview) throw new AppError('Interview not found', 404);
    sendSuccess(res, interview);
  } catch (err) { next(err); }
});

router.patch('/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateInterviewSchema.parse(req.body);
    const interview = await prisma.aIInterview.findFirst({
      where: { id: req.params.id, job: { organizationId: req.user.organizationId! } },
    });
    if (!interview) throw new AppError('Interview not found', 404);
    const updated = await prisma.aIInterview.update({ where: { id: req.params.id }, data: body });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interview = await prisma.aIInterview.findFirst({
      where: { id: req.params.id, job: { organizationId: req.user.organizationId! } },
    });
    if (!interview) throw new AppError('Interview not found', 404);
    await prisma.aIInterview.delete({ where: { id: req.params.id } });
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
});

// ─── Questions ───────────────────────────────────────

router.post('/:id/questions', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createQuestionSchema.parse(req.body);
    const interview = await prisma.aIInterview.findFirst({
      where: { id: req.params.id, job: { organizationId: req.user.organizationId! } },
    });
    if (!interview) throw new AppError('Interview not found', 404);
    const question = await prisma.interviewQuestion.create({
      data: { ...body, interviewId: req.params.id },
    });
    sendSuccess(res, question, 201);
  } catch (err) { next(err); }
});

router.patch('/:id/questions/:questionId', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateQuestionSchema.parse(req.body);
    const interview = await prisma.aIInterview.findFirst({
      where: { id: req.params.id, job: { organizationId: req.user.organizationId! } },
    });
    if (!interview) throw new AppError('Interview not found', 404);
    const question = await prisma.interviewQuestion.findFirst({
      where: { id: req.params.questionId, interviewId: req.params.id },
    });
    if (!question) throw new AppError('Question not found', 404);
    const updated = await prisma.interviewQuestion.update({
      where: { id: req.params.questionId },
      data: body,
    });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

// ─── Skill Scores ────────────────────────────────────

router.post('/:id/skill-scores', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createSkillScoreSchema.parse(req.body);
    const interview = await prisma.aIInterview.findFirst({
      where: { id: req.params.id, job: { organizationId: req.user.organizationId! } },
    });
    if (!interview) throw new AppError('Interview not found', 404);
    const score = await prisma.interviewSkillScore.create({
      data: { ...body, interviewId: req.params.id },
    });
    sendSuccess(res, score, 201);
  } catch (err) { next(err); }
});

// ─── Complete Interview ──────────────────────────────

router.patch('/:id/complete', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interview = await prisma.aIInterview.findFirst({
      where: { id: req.params.id, job: { organizationId: req.user.organizationId! } },
    });
    if (!interview) throw new AppError('Interview not found', 404);
    if (interview.status === 'COMPLETED') throw new AppError('Interview already completed', 400);

    const updated = await prisma.aIInterview.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

export default router;
