import { Router, Request, Response, NextFunction } from 'express';
import { prisma, sendSuccess, authenticate, requireOrganization } from '@searchkraft/shared';

const router = Router();
router.use(authenticate, requireOrganization);

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const [totalJobs, activeJobs, totalCandidates, totalApplications, recentApplications] = await Promise.all([
      prisma.job.count({ where: { organizationId: orgId } }),
      prisma.job.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
      prisma.candidate.count({ where: { organizationId: orgId } }),
      prisma.application.count({ where: { job: { organizationId: orgId } } }),
      prisma.application.findMany({
        where: { job: { organizationId: orgId } },
        take: 10,
        orderBy: { appliedAt: 'desc' },
        include: {
          candidate: { select: { name: true, currentTitle: true } },
          job: { select: { title: true } },
          stage: { select: { name: true, stageType: true } },
        },
      }),
    ]);

    // Pipeline breakdown
    const stageCounts = await prisma.pipelineStage.findMany({
      where: { job: { organizationId: orgId } },
      select: {
        stageType: true,
        color: true,
        name: true,
        _count: { select: { applications: { where: { status: 'ACTIVE' } } } },
      },
    });

    const pipelineMap: Record<string, { count: number; color: string; name: string }> = {};
    for (const s of stageCounts) {
      if (!pipelineMap[s.stageType]) {
        pipelineMap[s.stageType] = { count: 0, color: s.color || '#7C3AED', name: s.name };
      }
      pipelineMap[s.stageType].count += s._count.applications;
    }

    const pipeline = ['SOURCED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED']
      .map(st => ({
        stage: pipelineMap[st]?.name || st.charAt(0) + st.slice(1).toLowerCase(),
        stageType: st,
        count: pipelineMap[st]?.count || 0,
        color: pipelineMap[st]?.color || '#7C3AED',
      }));

    sendSuccess(res, {
      stats: { totalJobs, activeJobs, totalCandidates, totalApplications },
      recentApplications,
      pipeline,
    });
  } catch (err) { next(err); }
});

router.get('/funnel/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const stages = await prisma.pipelineStage.findMany({
      where: { job: { id: req.params.jobId, organizationId: orgId } },
      orderBy: { order: 'asc' },
      include: { _count: { select: { applications: { where: { status: 'ACTIVE' } } } } },
    });
    sendSuccess(res, stages.map(s => ({ name: s.name, count: s._count.applications, color: s.color })));
  } catch (err) { next(err); }
});

export default router;
