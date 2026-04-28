import { Project, ActionItem, TeamMember, MonthlyForecast } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// Normalize Prisma DateTime strings → keep as string (already ISO)
const normalizeProject = (p: Project): Project => ({
  ...p,
  createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date(p.createdAt).toISOString(),
  updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date(p.updatedAt).toISOString(),
});

const normalizeAction = (a: ActionItem): ActionItem => ({
  ...a,
  createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString(),
  updatedAt: typeof a.updatedAt === 'string' ? a.updatedAt : new Date(a.updatedAt).toISOString(),
});

export const api = {
  projects: {
    list: () => request<Project[]>('/projects').then(ps => ps.map(normalizeProject)),
    create: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
      request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }).then(normalizeProject),
    update: (id: string, data: Partial<Project>) =>
      request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(normalizeProject),
    delete: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  },

  actionItems: {
    list: () => request<ActionItem[]>('/action-items').then(items => items.map(normalizeAction)),
    create: (data: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) =>
      request<ActionItem>('/action-items', { method: 'POST', body: JSON.stringify(data) }).then(normalizeAction),
    update: (id: string, data: Partial<ActionItem>) =>
      request<ActionItem>(`/action-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(normalizeAction),
    delete: (id: string) => request<void>(`/action-items/${id}`, { method: 'DELETE' }),
  },

  teamMembers: {
    list: () => request<TeamMember[]>('/team-members'),
    create: (data: Omit<TeamMember, 'id'>) =>
      request<TeamMember>('/team-members', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<TeamMember>) =>
      request<TeamMember>(`/team-members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/team-members/${id}`, { method: 'DELETE' }),
  },

  forecasts: {
    list: () => request<MonthlyForecast[]>('/forecasts'),
    upsert: (data: Omit<MonthlyForecast, 'id'>) =>
      request<MonthlyForecast>('/forecasts', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/forecasts/${id}`, { method: 'DELETE' }),
  },

  seed: () => request<{ message: string }>('/seed', { method: 'POST' }),
};
