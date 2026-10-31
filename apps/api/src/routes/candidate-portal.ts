import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated, sendError, AppError } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication as CANDIDATE
router.use(authenticate, requireRoles('CANDIDATE'));

// ─── Browse Active Jobs ──────────────────────────────
// Candidates can see all ACTIVE jobs across all organizations
router.get('/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const workMode = req.query.workMode as string;
    const experienceLevel = req.query.experienceLevel as string;
    const location = req.query.location as string;

    const where: Record<string, unknown> = { status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skills: { hasSome: [search] } },
      ];
    }
    if (workMode) where.workMode = workMode;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          workMode: true,
          experienceLevel: true,
          location: true,
          salaryMin: true,
          salaryMax: true,
          currency: true,
          skills: true,
          department: true,
          createdAt: true,
          organization: { select: { name: true, logoUrl: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    // Check which jobs the candidate has already applied to
    const candidateProfile = await prisma.candidate.findUnique({
      where: { userId: req.user.sub },
      select: { id: true },
    });

    let appliedJobIds: string[] = [];
    if (candidateProfile) {
      const applications = await prisma.application.findMany({
        where: { candidateId: candidateProfile.id, jobId: { in: jobs.map(j => j.id) } },
        select: { jobId: true },
      });
      appliedJobIds = applications.map(a => a.jobId);
    }

    const jobsWithStatus = jobs.map(job => ({
      ...job,
      hasApplied: appliedJobIds.includes(job.id),
    }));

    sendPaginated(res, jobsWithStatus, total, page, limit);
  } catch (err) { next(err); }
});

// ─── Get Single Job Detail ───────────────────────────
router.get('/jobs/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        responsibilities: true,
        workMode: true,
        experienceLevel: true,
        location: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        skills: true,
        department: true,
        headcount: true,
        createdAt: true,
        organization: { select: { name: true, logoUrl: true } },
      },
    });
    if (!job) throw new AppError('Job not found', 404);

    // Check if candidate already applied
    const candidateProfile = await prisma.candidate.findUnique({
      where: { userId: req.user.sub },
      select: { id: true },
    });
    let hasApplied = false;
    if (candidateProfile) {
      const existing = await prisma.application.findFirst({
        where: { candidateId: candidateProfile.id, jobId: job.id },
      });
      hasApplied = !!existing;
    }

    sendSuccess(res, { ...job, hasApplied });
  } catch (err) { next(err); }
});

// ─── Apply to a Job ─────────────────────────────────
router.post('/jobs/:id/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.id;

    // Verify job exists and is active
    const job = await prisma.job.findFirst({
      where: { id: jobId, status: 'ACTIVE' },
      include: { pipelineStages: { where: { stageType: 'APPLIED' }, take: 1 } },
    });
    if (!job) throw new AppError('Job not found or no longer active', 404);

    // Get or create candidate profile
    let candidate = await prisma.candidate.findUnique({
      where: { userId: req.user.sub },
    });
    if (!candidate) {
      // Auto-create a candidate profile from user data
      const user = await prisma.user.findUnique({ where: { id: req.user.sub }, select: { name: true, email: true } });
      candidate = await prisma.candidate.create({
        data: {
          userId: req.user.sub,
          name: user?.name || '',
          email: user?.email || req.user.email,
          availabilityStatus: 'ACTIVELY_LOOKING',
        },
      });
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { candidateId: candidate.id, jobId },
    });
    if (existing) throw new AppError('You have already applied to this job', 409);

    // Find the "Applied" stage
    const appliedStage = job.pipelineStages[0];
    if (!appliedStage) throw new AppError('Job pipeline not configured', 500);

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        stageId: appliedStage.id,
        status: 'ACTIVE',
      },
    });

    // Increment application count
    await prisma.job.update({
      where: { id: jobId },
      data: { applicationCount: { increment: 1 } },
    });

    sendSuccess(res, application, 201, 'Application submitted successfully');
  } catch (err) { next(err); }
});

// ─── My Applications ────────────────────────────────
router.get('/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user.sub },
      select: { id: true },
    });

    if (!candidate) {
      return sendSuccess(res, []);
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: candidate.id },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            workMode: true,
            organization: { select: { name: true, logoUrl: true } },
          },
        },
        stage: { select: { name: true, stageType: true, color: true } },
      },
    });

    sendSuccess(res, applications);
  } catch (err) { next(err); }
});

// ─── My Profile ─────────────────────────────────────
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { id: true, name: true, email: true, avatarUrl: true, phone: true, title: true },
    });

    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user.sub },
    });

    sendSuccess(res, {
      user,
      profile: candidate || null,
    });
  } catch (err) { next(err); }
});

// ─── Update Profile ─────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  experienceYears: z.number().optional(),
  skills: z.array(z.string()).optional(),
  summary: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  availabilityStatus: z.enum(['ACTIVELY_LOOKING', 'OPEN', 'NOT_LOOKING', 'EMPLOYED']).optional(),
  expectedSalary: z.number().optional(),
  noticePeriodDays: z.number().optional(),
});

router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateProfileSchema.parse(req.body);

    // Update user name if provided
    if (body.name) {
      await prisma.user.update({
        where: { id: req.user.sub },
        data: { name: body.name },
      });
    }

    // Separate candidate-specific fields from the body
    const { name, phone, ...candidateFields } = body;
    const candidateData = {
      ...candidateFields,
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
    };

    // Upsert candidate profile using userId (which has @unique)
    let candidate = await prisma.candidate.findUnique({
      where: { userId: req.user.sub },
    });

    if (candidate) {
      candidate = await prisma.candidate.update({
        where: { userId: req.user.sub },
        data: candidateData,
      });
    } else {
      const user = await prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { name: true, email: true },
      });
      candidate = await prisma.candidate.create({
        data: {
          userId: req.user.sub,
          name: name || user?.name || '',
          email: user?.email || req.user.email,
          ...candidateFields,
          ...(phone !== undefined && { phone }),
        },
      });
    }

    sendSuccess(res, candidate);
  } catch (err) { next(err); }
});

// ─── Dashboard Stats ────────────────────────────────
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user.sub },
      select: { id: true },
    });

    if (!candidate) {
      return sendSuccess(res, {
        activeApplications: 0,
        interviews: 0,
        totalJobs: 0,
      });
    }

    const [activeApplications, interviews, totalJobs] = await Promise.all([
      prisma.application.count({
        where: { candidateId: candidate.id, status: 'ACTIVE' },
      }),
      prisma.aIInterview.count({
        where: { candidateId: candidate.id, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
      }),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
    ]);

    sendSuccess(res, { activeApplications, interviews, totalJobs });
  } catch (err) { next(err); }
});

export default router;
