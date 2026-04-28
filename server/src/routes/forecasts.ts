import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/forecasts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const forecasts = await prisma.monthlyForecast.findMany({
      orderBy: [{ projectId: 'asc' }, { month: 'asc' }],
    });
    res.json(forecasts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch forecasts' });
  }
});

// POST /api/forecasts (upsert by projectId+month)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, project, ...data } = req.body;
    const forecast = await prisma.monthlyForecast.upsert({
      where: { projectId_month: { projectId: data.projectId, month: data.month } },
      update: { planned: data.planned, actual: data.actual, forecast: data.forecast },
      create: data,
    });
    res.status(201).json(forecast);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upsert forecast' });
  }
});

// DELETE /api/forecasts/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.monthlyForecast.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete forecast' });
  }
});

export default router;
