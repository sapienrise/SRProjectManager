import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/team-members
router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({ orderBy: { name: 'asc' } });
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST /api/team-members
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;
    const member = await prisma.teamMember.create({ data });
    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// PUT /api/team-members/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;
    const member = await prisma.teamMember.update({
      where: { id: req.params.id },
      data,
    });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// DELETE /api/team-members/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.teamMember.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

export default router;
