import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

// Clear all data — requires SUPER_ADMIN or ORG_ADMIN role
// In production, restrict this further or remove entirely
router.post('/clear-database', authenticate, requireRoles('SUPER_ADMIN', 'ORG_ADMIN'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Delete in dependency order
    await prisma.interviewSkillScore.deleteMany();
    await prisma.interviewQuestion.deleteMany();
    await prisma.aIInterview.deleteMany();
    await prisma.outreachMessage.deleteMany();
    await prisma.outreachStep.deleteMany();
    await prisma.outreachCampaign.deleteMany();
    await prisma.sourcingResult.deleteMany();
    await prisma.sourcingAgent.deleteMany();
    await prisma.savedSearch.deleteMany();
    await prisma.candidateNote.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.task.deleteMany();
    await prisma.applicationHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.pipelineStage.deleteMany();
    await prisma.job.deleteMany();
    await prisma.client.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();

    sendSuccess(res, { message: 'All data cleared successfully' });
  } catch (err) {
    next(err);
  }
});

// Clear all data using JWT_SECRET as admin key (works even with no users in DB)
router.post('/clear-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.JWT_SECRET) {
      return sendError(res, 'Unauthorized: invalid admin key', 403);
    }

    await prisma.interviewSkillScore.deleteMany();
    await prisma.interviewQuestion.deleteMany();
    await prisma.aIInterview.deleteMany();
    await prisma.outreachMessage.deleteMany();
    await prisma.outreachStep.deleteMany();
    await prisma.outreachCampaign.deleteMany();
    await prisma.sourcingResult.deleteMany();
    await prisma.sourcingAgent.deleteMany();
    await prisma.savedSearch.deleteMany();
    await prisma.candidateNote.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.task.deleteMany();
    await prisma.applicationHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.pipelineStage.deleteMany();
    await prisma.job.deleteMany();
    await prisma.client.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();

    sendSuccess(res, { message: 'All data cleared successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
