import 'dotenv/config';
import prisma from './db.js';

export async function seedDatabase() {
  console.log('Seeding team members...');
  const members = await Promise.all([
    prisma.teamMember.create({ data: { name: 'Alice Johnson', email: 'alice@tlxworks.com', role: 'Project Manager', department: 'PMO' } }),
    prisma.teamMember.create({ data: { name: 'Bob Smith', email: 'bob@tlxworks.com', role: 'Lead Developer', department: 'Engineering' } }),
    prisma.teamMember.create({ data: { name: 'Carol Davis', email: 'carol@tlxworks.com', role: 'UI/UX Designer', department: 'Design' } }),
    prisma.teamMember.create({ data: { name: 'David Lee', email: 'david@tlxworks.com', role: 'Backend Developer', department: 'Engineering' } }),
    prisma.teamMember.create({ data: { name: 'Emma Wilson', email: 'emma@tlxworks.com', role: 'Data Analyst', department: 'Analytics' } }),
    prisma.teamMember.create({ data: { name: 'Frank Brown', email: 'frank@tlxworks.com', role: 'QA Engineer', department: 'Engineering' } }),
    prisma.teamMember.create({ data: { name: 'Grace Kim', email: 'grace@tlxworks.com', role: 'Business Analyst', department: 'PMO' } }),
    prisma.teamMember.create({ data: { name: 'Henry Chen', email: 'henry@tlxworks.com', role: 'DevOps Engineer', department: 'Infrastructure' } }),
  ]);

  const [alice, bob, carol, david, emma, frank, grace, henry] = members;

  console.log('Seeding projects...');
  const projects = await Promise.all([
    prisma.project.create({ data: {
      name: 'ERP System Upgrade',
      description: 'Full upgrade of the enterprise ERP system to the latest version, including data migration, customization, and user training across all departments.',
      client: 'TLX Works Internal', status: 'active', priority: 'high',
      startDate: '2025-01-15', endDate: '2025-12-31',
      budget: 500000, actualSpend: 198000, forecastedCost: 520000, progress: 65,
      teamMemberIds: [alice.id, bob.id, david.id, frank.id],
      tags: ['ERP', 'Migration', 'Enterprise'],
    }}),
    prisma.project.create({ data: {
      name: 'Mobile App v2.0',
      description: 'Complete redesign and rebuild of the customer-facing mobile application with new features, improved performance, and modern UI.',
      client: 'Retail Solutions Ltd', status: 'active', priority: 'critical',
      startDate: '2025-03-01', endDate: '2025-09-30',
      budget: 250000, actualSpend: 148000, forecastedCost: 262000, progress: 40,
      teamMemberIds: [bob.id, carol.id, frank.id, grace.id],
      tags: ['Mobile', 'React Native', 'UX'],
    }}),
    prisma.project.create({ data: {
      name: 'Data Analytics Platform',
      description: 'Build a centralized data analytics and reporting platform integrating multiple data sources, with interactive dashboards and automated reporting.',
      client: 'FinTech Group', status: 'planning', priority: 'medium',
      startDate: '2026-06-01', endDate: '2026-12-31',
      budget: 180000, actualSpend: 12000, forecastedCost: 185000, progress: 10,
      teamMemberIds: [alice.id, emma.id, david.id],
      tags: ['Analytics', 'BI', 'Data'],
    }}),
    prisma.project.create({ data: {
      name: 'Customer Portal Redesign',
      description: 'Complete overhaul of the customer self-service portal including new authentication, profile management, and support ticketing system.',
      client: 'Apex Corporation', status: 'completed', priority: 'high',
      startDate: '2025-01-01', endDate: '2025-04-30',
      budget: 120000, actualSpend: 115000, forecastedCost: 120000, progress: 100,
      teamMemberIds: [carol.id, david.id, grace.id],
      tags: ['Portal', 'UX', 'Auth'],
    }}),
    prisma.project.create({ data: {
      name: 'Infrastructure Migration',
      description: 'Migration of on-premise infrastructure to cloud (Azure), including all microservices, databases, and storage systems.',
      client: 'TLX Works Internal', status: 'on-hold', priority: 'medium',
      startDate: '2025-02-01', endDate: '2025-08-31',
      budget: 300000, actualSpend: 78000, forecastedCost: 310000, progress: 30,
      teamMemberIds: [bob.id, henry.id, frank.id],
      tags: ['Cloud', 'Azure', 'DevOps'],
    }}),
    prisma.project.create({ data: {
      name: 'AI Chatbot Integration',
      description: 'Integration of AI-powered chatbot across all customer touchpoints for automated support, with escalation workflows and analytics.',
      client: 'ServiceFirst Inc', status: 'active', priority: 'high',
      startDate: '2026-04-01', endDate: '2026-10-31',
      budget: 150000, actualSpend: 22000, forecastedCost: 155000, progress: 15,
      teamMemberIds: [alice.id, david.id, emma.id, grace.id],
      tags: ['AI', 'Chatbot', 'Integration'],
    }}),
  ]);

  const [p1, p2, p3, p4, p5, p6] = projects;

  console.log('Seeding action items...');
  await prisma.actionItem.createMany({ data: [
    { projectId: p1.id, title: 'Complete data migration script for HR module', description: 'Write and test data migration scripts for the HR module legacy data.', status: 'in-progress', priority: 'high', assigneeId: david.id, dueDate: '2026-05-05' },
    { projectId: p1.id, title: 'User acceptance testing - Finance module', description: 'Coordinate UAT sessions with finance team for the upgraded ERP modules.', status: 'todo', priority: 'critical', assigneeId: alice.id, dueDate: '2026-05-15' },
    { projectId: p1.id, title: 'Update training documentation', description: 'Update all user guides and training materials to reflect the new ERP interface.', status: 'todo', priority: 'medium', assigneeId: grace.id, dueDate: '2026-05-30' },
    { projectId: p2.id, title: 'Design new onboarding screens', description: 'Create high-fidelity mockups for the new user onboarding flow.', status: 'done', priority: 'high', assigneeId: carol.id, dueDate: '2026-04-15' },
    { projectId: p2.id, title: 'Implement push notification service', description: 'Build and integrate push notification service using Firebase.', status: 'in-progress', priority: 'high', assigneeId: bob.id, dueDate: '2026-05-10' },
    { projectId: p2.id, title: 'Performance testing on Android', description: 'Run full performance test suite on Android devices.', status: 'todo', priority: 'medium', assigneeId: frank.id, dueDate: '2026-06-01' },
    { projectId: p3.id, title: 'Requirements gathering workshop', description: 'Conduct workshop with stakeholders to gather analytics requirements.', status: 'in-progress', priority: 'high', assigneeId: emma.id, dueDate: '2026-05-01' },
    { projectId: p6.id, title: 'Set up Claude API integration', description: 'Configure and test Claude API endpoints for the chatbot engine.', status: 'in-progress', priority: 'critical', assigneeId: david.id, dueDate: '2026-05-07' },
    { projectId: p6.id, title: 'Define escalation workflows', description: 'Map out all escalation paths when AI cannot resolve customer queries.', status: 'todo', priority: 'high', assigneeId: grace.id, dueDate: '2026-05-20' },
    { projectId: p5.id, title: 'Review cloud cost estimates', description: 'Review and validate Azure cost estimates before resuming migration.', status: 'todo', priority: 'medium', assigneeId: henry.id, dueDate: '2026-05-30' },
  ]});

  console.log('Seeding forecasts...');
  const forecastData: Array<{ projectId: string; month: string; planned: number; actual: number; forecast: number }> = [];

  // ERP (p1) - Jan to Dec 2026
  ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12'].forEach((month, i) => {
    const actuals = [38000, 42000, 39000, 41000];
    forecastData.push({ projectId: p1.id, month, planned: 40000, actual: i < 4 ? actuals[i] : 0, forecast: i < 4 ? actuals[i] : 43000 + i * 500 });
  });

  // Mobile (p2) - Mar to Sep 2025
  ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09'].forEach((month, i) => {
    const actuals = [25000, 30000, 27000, 29000];
    forecastData.push({ projectId: p2.id, month, planned: 28000, actual: i < 4 ? actuals[i] : 0, forecast: i < 4 ? actuals[i] : 29000 + i * 300 });
  });

  // AI Chatbot (p6) - Apr to Oct 2026
  ['2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10'].forEach((month, i) => {
    forecastData.push({ projectId: p6.id, month, planned: 22000, actual: i === 0 ? 22000 : 0, forecast: i === 0 ? 22000 : 22000 + i * 200 });
  });

  await prisma.monthlyForecast.createMany({ data: forecastData });

  console.log('✅ Seed complete!');
  console.log(`   ${members.length} team members`);
  console.log(`   ${projects.length} projects`);
  console.log(`   10 action items`);
  console.log(`   ${forecastData.length} forecast entries`);
}

const isDirectRun = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js');

if (isDirectRun) {
  seedDatabase()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
