import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import { sendSuccess } from '../utils/response';
import { authenticate, requireOrganization } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

router.get('/candidates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const { skills, experienceMin, experienceMax, location, availability, keywords } = req.query;

    const where: Record<string, unknown> = { organizationId: orgId };
    if (skills) where.skills = { hasSome: (skills as string).split(',') };
    if (experienceMin) where.experienceYears = { gte: parseInt(experienceMin as string) };
    if (availability) where.availabilityStatus = availability;
    if (keywords) {
      where.OR = [
        { name: { contains: keywords as string, mode: 'insensitive' } },
        { currentTitle: { contains: keywords as string, mode: 'insensitive' } },
        { summary: { contains: keywords as string, mode: 'insensitive' } },
      ];
    }

    const candidates = await prisma.candidate.findMany({ where, take: 50, orderBy: { createdAt: 'desc' } });
    sendSuccess(res, candidates);
  } catch (err) { next(err); }
});

router.post('/nlp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, filters } = z.object({ query: z.string(), filters: z.record(z.unknown()).optional() }).parse(req.body);
    const orgId = req.user.organizationId!;

    const where: Record<string, unknown> = { organizationId: orgId };
    if (filters?.skills) where.skills = { hasSome: filters.skills as string[] };
    if (filters?.availability) where.availabilityStatus = filters.availability;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { currentTitle: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { currentCompany: { contains: query, mode: 'insensitive' } },
      ];
    }

    const candidates = await prisma.candidate.findMany({ where, take: 30 });
    sendSuccess(res, { candidates, parsedFilters: filters || {} });
  } catch (err) { next(err); }
});

export default router;
