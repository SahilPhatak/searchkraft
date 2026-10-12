import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, AppError } from '../utils/response';
import { authenticate, requireOrganization, requireRoles, RECRUITER_ROLES } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

// GET /pipeline/:jobId — kanban board
router.get('/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.jobId, organizationId: req.user.organizationId! },
    });
    if (!job) throw new AppError('Job not found', 404);

    const stages = await prisma.pipelineStage.findMany({
      where: { jobId: job.id },
      orderBy: { order: 'asc' },
      include: {
        applications: {
          where: { status: 'ACTIVE' },
          include: {
            candidate: { select: { id: true, name: true, currentTitle: true, currentCompany: true, skills: true, avatarUrl: true } },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    sendSuccess(res, { job: { id: job.id, title: job.title, status: job.status }, stages });
  } catch (err) { next(err); }
});

// POST /pipeline/:jobId/applications — add candidate to pipeline
router.post('/:jobId/applications', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateId, stageId } = z.object({ candidateId: z.string(), stageId: z.string().optional() }).parse(req.body);
    const orgId = req.user.organizationId!;

    const [job, candidate] = await Promise.all([
      prisma.job.findFirst({ where: { id: req.params.jobId, organizationId: orgId } }),
      prisma.candidate.findFirst({ where: { id: candidateId, organizationId: orgId } }),
    ]);
    if (!job) throw new AppError('Job not found', 404);
    if (!candidate) throw new AppError('Candidate not found', 404);

    const existing = await prisma.application.findFirst({ where: { jobId: job.id, candidateId } });
    if (existing) throw new AppError('Candidate already in pipeline', 409);

    let targetStageId = stageId;
    if (!targetStageId) {
      const firstStage = await prisma.pipelineStage.findFirst({ where: { jobId: job.id }, orderBy: { order: 'asc' } });
      if (!firstStage) throw new AppError('No pipeline stages found', 400);
      targetStageId = firstStage.id;
    }

    const application = await prisma.application.create({
      data: { jobId: job.id, candidateId, stageId: targetStageId, status: 'ACTIVE' },
    });
    await prisma.job.update({ where: { id: job.id }, data: { applicationCount: { increment: 1 } } });

    sendSuccess(res, application, 201);
  } catch (err) { next(err); }
});

// PATCH /pipeline/applications/:appId/move — move stage
router.patch('/applications/:appId/move', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stageId } = z.object({ stageId: z.string() }).parse(req.body);
    const orgId = req.user.organizationId!;

    const app = await prisma.application.findFirst({
      where: { id: req.params.appId },
      include: { job: true },
    });
    if (!app || app.job.organizationId !== orgId) throw new AppError('Application not found', 404);

    const stage = await prisma.pipelineStage.findFirst({ where: { id: stageId, jobId: app.jobId } });
    if (!stage) throw new AppError('Stage not found', 404);

    const updated = await prisma.application.update({ where: { id: app.id }, data: { stageId, updatedAt: new Date() } });
    await prisma.applicationHistory.create({
      data: { applicationId: app.id, fromStageId: app.stageId, toStageId: stageId, movedById: req.user.sub },
    });

    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

export default router;
