import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/action-items
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.actionItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch action items' });
  }
});

// POST /api/action-items
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, createdAt, updatedAt, ...data } = req.body;
    const item = await prisma.actionItem.create({ data });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create action item' });
  }
});

// PUT /api/action-items/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id, createdAt, updatedAt, project, ...data } = req.body;
    const item = await prisma.actionItem.update({
      where: { id: req.params.id },
      data,
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update action item' });
  }
});

// DELETE /api/action-items/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.actionItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete action item' });
  }
});

export default router;
