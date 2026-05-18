import { Router } from 'express';
import prisma from '../../config/db.js';

const router = Router();

router.post('/track', async (req, res, next) => {
  try {
    const { sessionId, destinationId } = req.body;
    if (!sessionId || !destinationId) {
      return res.status(400).json({ error: 'sessionId and destinationId required' });
    }

    await prisma.visitHistory.create({
      data: { sessionId, destinationId: parseInt(destinationId) },
    });

    res.status(201).json({ message: 'Visit tracked' });
  } catch (err) {
    next(err);
  }
});

router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { limit = 20 } = req.query;

    const history = await prisma.visitHistory.findMany({
      where: { sessionId },
      orderBy: { visitedAt: 'desc' },
      take: parseInt(limit),
      include: {
        destination: {
          include: {
            category: true,
            accessCompass: true,
          },
        },
      },
    });

    res.json(history);
  } catch (err) {
    next(err);
  }
});

export default router;
