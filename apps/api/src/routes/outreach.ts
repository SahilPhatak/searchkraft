import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { authenticate, requireOrganization, requireRoles, RECRUITER_ROLES } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

// ─── Schemas ─────────────────────────────────────────

const channelEnum = z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'LINKEDIN']);
const statusEnum = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']);
const messageStatusEnum = z.enum(['PENDING', 'SENT', 'DELIVERED', 'OPENED', 'REPLIED', 'BOUNCED', 'FAILED']);

const createCampaignSchema = z.object({
  name: z.string().min(2),
  channel: channelEnum.default('EMAIL'),
  subject: z.string().optional(),
  templateBody: z.string().optional(),
  jobId: z.string().optional(),
  followUpDays: z.number().int().optional(),
  maxFollowUps: z.number().int().default(3),
});

const updateCampaignSchema = z.object({
  name: z.string().min(2).optional(),
  channel: channelEnum.optional(),
  status: statusEnum.optional(),
  subject: z.string().optional(),
  templateBody: z.string().optional(),
  followUpDays: z.number().int().optional(),
  maxFollowUps: z.number().int().optional(),
});

const createStepSchema = z.object({
  stepOrder: z.number().int(),
  channel: channelEnum.default('EMAIL'),
  subject: z.string().optional(),
  body: z.string().min(1),
  delayDays: z.number().int().default(0),
});

const createMessageSchema = z.object({
  candidateId: z.string().min(1),
  channel: channelEnum,
  subject: z.string().optional(),
  body: z.string().min(1),
});

// ─── Campaigns ───────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: Record<string, unknown> = { organizationId: orgId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [campaigns, total] = await Promise.all([
      prisma.outreachCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: { select: { title: true } },
          _count: { select: { messages: true, steps: true } },
        },
      }),
      prisma.outreachCampaign.count({ where }),
    ]);
    sendPaginated(res, campaigns, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createCampaignSchema.parse(req.body);
    const orgId = req.user.organizationId!;
    const campaign = await prisma.outreachCampaign.create({
      data: { ...body, organizationId: orgId, createdById: req.user.sub },
    });
    sendSuccess(res, campaign, 201);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
      include: {
        job: { select: { title: true } },
        createdBy: { select: { name: true } },
        steps: { orderBy: { stepOrder: 'asc' } },
        _count: { select: { messages: true } },
      },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);
    sendSuccess(res, campaign);
  } catch (err) { next(err); }
});

router.patch('/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateCampaignSchema.parse(req.body);
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);
    const updated = await prisma.outreachCampaign.update({ where: { id: req.params.id }, data: body });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);
    await prisma.outreachCampaign.delete({ where: { id: req.params.id } });
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
});

// ─── Steps ───────────────────────────────────────────

router.post('/:id/steps', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createStepSchema.parse(req.body);
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);
    const step = await prisma.outreachStep.create({
      data: { ...body, campaignId: req.params.id },
    });
    sendSuccess(res, step, 201);
  } catch (err) { next(err); }
});

router.patch('/:id/steps/:stepId', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);
    const step = await prisma.outreachStep.findFirst({
      where: { id: req.params.stepId, campaignId: req.params.id },
    });
    if (!step) throw new AppError('Step not found', 404);
    const updated = await prisma.outreachStep.update({ where: { id: req.params.stepId }, data: req.body });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

router.delete('/:id/steps/:stepId', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);
    const step = await prisma.outreachStep.findFirst({
      where: { id: req.params.stepId, campaignId: req.params.id },
    });
    if (!step) throw new AppError('Step not found', 404);
    await prisma.outreachStep.delete({ where: { id: req.params.stepId } });
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
});

// ─── Messages ────────────────────────────────────────

router.get('/:id/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.outreachMessage.findMany({
        where: { campaignId: req.params.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { candidate: { select: { name: true, email: true } } },
      }),
      prisma.outreachMessage.count({ where: { campaignId: req.params.id } }),
    ]);
    sendPaginated(res, messages, total, page, limit);
  } catch (err) { next(err); }
});

router.post('/:id/messages', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createMessageSchema.parse(req.body);
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);
    const message = await prisma.outreachMessage.create({
      data: { ...body, campaignId: req.params.id },
    });

    await prisma.outreachCampaign.update({
      where: { id: req.params.id },
      data: { totalSent: { increment: 1 } },
    });

    sendSuccess(res, message, 201);
  } catch (err) { next(err); }
});

router.patch('/:id/messages/:messageId', requireRoles(...RECRUITER_ROLES), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = z.object({ status: messageStatusEnum }).parse(req.body);
    const campaign = await prisma.outreachCampaign.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId! },
    });
    if (!campaign) throw new AppError('Campaign not found', 404);

    const message = await prisma.outreachMessage.findFirst({
      where: { id: req.params.messageId, campaignId: req.params.id },
    });
    if (!message) throw new AppError('Message not found', 404);

    const updateData: Record<string, unknown> = { status };
    if (status === 'SENT') updateData.sentAt = new Date();
    if (status === 'OPENED') updateData.openedAt = new Date();
    if (status === 'REPLIED') updateData.repliedAt = new Date();

    const updated = await prisma.outreachMessage.update({
      where: { id: req.params.messageId },
      data: updateData,
    });

    if (status === 'OPENED') {
      await prisma.outreachCampaign.update({ where: { id: req.params.id }, data: { totalOpened: { increment: 1 } } });
    }
    if (status === 'REPLIED') {
      await prisma.outreachCampaign.update({ where: { id: req.params.id }, data: { totalReplied: { increment: 1 } } });
    }

    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

export default router;
