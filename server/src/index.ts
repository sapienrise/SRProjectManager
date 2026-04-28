import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './db.js';
import projectsRouter from './routes/projects.js';
import actionItemsRouter from './routes/actionItems.js';
import teamMembersRouter from './routes/teamMembers.js';
import forecastsRouter from './routes/forecasts.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] }));
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/action-items', actionItemsRouter);
app.use('/api/team-members', teamMembersRouter);
app.use('/api/forecasts', forecastsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post('/api/seed', async (_req, res) => {
  try {
    await prisma.$transaction([
      prisma.monthlyForecast.deleteMany(),
      prisma.actionItem.deleteMany(),
      prisma.project.deleteMany(),
      prisma.teamMember.deleteMany(),
    ]);
    const { seedDatabase } = await import('./seed.js');
    await seedDatabase();
    res.json({ message: 'Database seeded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Seed failed' });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DATABASE_URL?.split('@')[1] || 'connected'}`);
  });
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
