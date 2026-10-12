import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAiProvider, withRetry } from '../services/ai/provider';
import { prisma } from '../database/prisma';
import { sendSuccess, AppError } from '../utils/response';
import { authenticate, requireOrganization } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireOrganization);

router.post('/parse-jd', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = z.object({ text: z.string().min(50) }).parse(req.body);
    const ai = getAiProvider();
    const result = await withRetry(() => ai.complete(
      `Parse this job description and return JSON with: title, skills (array), experienceYears, location, workMode, responsibilities (array), requirements (array), department.\n\nJob description:\n${text}`,
      'You are a recruitment AI. Return only valid JSON, no markdown or explanation.'
    ));
    const parsed = JSON.parse(result);
    sendSuccess(res, parsed);
  } catch (err) { next(err); }
});

router.post('/match/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user.organizationId!;
    const job = await prisma.job.findFirst({ where: { id: req.params.jobId, organizationId: orgId } });
    if (!job) throw new AppError('Job not found', 404);

    const candidates = await prisma.candidate.findMany({
      where: { organizationId: orgId, availabilityStatus: { in: ['ACTIVELY_LOOKING', 'OPEN'] } },
      take: 50,
    });

    if (candidates.length === 0) {
      return sendSuccess(res, []);
    }

    const ai = getAiProvider();
    const prompt = `Score these candidates for this job. Return JSON array with candidateId, overallScore (0-100), skillsScore, experienceScore, locationScore, availabilityScore, reasoning.\n\nJob: ${job.title}\nSkills: ${job.skills.join(', ')}\n\nCandidates: ${JSON.stringify(candidates.map(c => ({ id: c.id, name: c.name, skills: c.skills, experienceYears: c.experienceYears, location: c.location, currentTitle: c.currentTitle })))}`;

    const result = await withRetry(() => ai.complete(prompt, 'You are a recruitment AI. Return only valid JSON array.'));
    const matches = JSON.parse(result);
    sendSuccess(res, matches);
  } catch (err) { next(err); }
});

router.post('/search-parse', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = z.object({ query: z.string().min(3) }).parse(req.body);
    const ai = getAiProvider();
    const result = await withRetry(() => ai.complete(
      `Parse this recruitment search query into filters JSON with: skills (array), experienceMin, experienceMax, location, workMode, availabilityStatus, keywords (array).\n\nQuery: "${query}"`,
      'You are a recruitment search AI. Return only valid JSON.'
    ));
    sendSuccess(res, JSON.parse(result));
  } catch (err) { next(err); }
});

export default router;
