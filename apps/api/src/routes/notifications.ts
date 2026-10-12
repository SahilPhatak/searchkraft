import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess } from '../utils/response';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    sendSuccess(res, notifications);
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.sub },
      data: { isRead: true, readAt: new Date() },
    });
    sendSuccess(res, null);
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.sub, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    sendSuccess(res, null);
  } catch (err) { next(err); }
});

export default router;
