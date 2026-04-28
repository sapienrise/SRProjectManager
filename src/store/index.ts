import { create } from 'zustand';
import { Project, ActionItem, TeamMember, MonthlyForecast } from '../types';
import { api } from '../api/client';
import {
  sampleActionItems,
  sampleForecasts,
  sampleProjects,
  sampleTeamMembers,
} from './sampleData';

interface AppStore {
  projects: Project[];
  actionItems: ActionItem[];
  teamMembers: TeamMember[];
  forecasts: MonthlyForecast[];
  loading: boolean;
  error: string | null;
  usingSampleData: boolean;

  // Bootstrap — load all data from API
  initialize: () => Promise<void>;

  // Projects
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Action Items
  addActionItem: (a: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => Promise<void>;
  deleteActionItem: (id: string) => Promise<void>;

  // Team Members
  addTeamMember: (m: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;

  // Forecasts
  upsertForecast: (f: Omit<MonthlyForecast, 'id'>) => Promise<void>;
  deleteForecast: (id: string) => Promise<void>;

  // Seed / reset
  resetToSampleData: () => Promise<void>;
}

const loadSampleState = () => ({
  projects: sampleProjects.map((project) => ({ ...project })),
  actionItems: sampleActionItems.map((item) => ({ ...item })),
  teamMembers: sampleTeamMembers.map((member) => ({ ...member })),
  forecasts: sampleForecasts.map((forecast) => ({ ...forecast })),
  loading: false,
  error: null,
  usingSampleData: true,
});

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useStore = create<AppStore>()((set, get) => ({
  projects: [],
  actionItems: [],
  teamMembers: [],
  forecasts: [],
  loading: false,
  error: null,
  usingSampleData: false,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const [projects, actionItems, teamMembers, forecasts] = await Promise.all([
        api.projects.list(),
        api.actionItems.list(),
        api.teamMembers.list(),
        api.forecasts.list(),
      ]);
      set({ projects, actionItems, teamMembers, forecasts, loading: false, usingSampleData: false });
    } catch (err) {
      set(loadSampleState());
    }
  },

  // --- Projects ---
  addProject: async (data) => {
    if (get().usingSampleData) {
      const project: Project = {
        ...data,
        id: makeId('project'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({ projects: [project, ...s.projects] }));
      return;
    }
    const project = await api.projects.create(data);
    set((s) => ({ projects: [project, ...s.projects] }));
  },

  updateProject: async (id, updates) => {
    const current = get().projects.find((p) => p.id === id);
    if (!current) return;
    if (get().usingSampleData) {
      const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
      set((s) => ({ projects: s.projects.map((p) => (p.id === id ? updated : p)) }));
      return;
    }
    const updated = await api.projects.update(id, { ...current, ...updates });
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? updated : p)) }));
  },

  deleteProject: async (id) => {
    if (get().usingSampleData) {
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
        actionItems: s.actionItems.filter((a) => a.projectId !== id),
        forecasts: s.forecasts.filter((f) => f.projectId !== id),
      }));
      return;
    }
    await api.projects.delete(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      actionItems: s.actionItems.filter((a) => a.projectId !== id),
      forecasts: s.forecasts.filter((f) => f.projectId !== id),
    }));
  },

  // --- Action Items ---
  addActionItem: async (data) => {
    if (get().usingSampleData) {
      const item: ActionItem = {
        ...data,
        id: makeId('action'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({ actionItems: [item, ...s.actionItems] }));
      return;
    }
    const item = await api.actionItems.create(data);
    set((s) => ({ actionItems: [item, ...s.actionItems] }));
  },

  updateActionItem: async (id, updates) => {
    const current = get().actionItems.find((a) => a.id === id);
    if (!current) return;
    if (get().usingSampleData) {
      const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
      set((s) => ({ actionItems: s.actionItems.map((a) => (a.id === id ? updated : a)) }));
      return;
    }
    const updated = await api.actionItems.update(id, { ...current, ...updates });
    set((s) => ({ actionItems: s.actionItems.map((a) => (a.id === id ? updated : a)) }));
  },

  deleteActionItem: async (id) => {
    if (get().usingSampleData) {
      set((s) => ({ actionItems: s.actionItems.filter((a) => a.id !== id) }));
      return;
    }
    await api.actionItems.delete(id);
    set((s) => ({ actionItems: s.actionItems.filter((a) => a.id !== id) }));
  },

  // --- Team Members ---
  addTeamMember: async (data) => {
    if (get().usingSampleData) {
      const member: TeamMember = { ...data, id: makeId('member') };
      set((s) => ({ teamMembers: [...s.teamMembers, member] }));
      return;
    }
    const member = await api.teamMembers.create(data);
    set((s) => ({ teamMembers: [...s.teamMembers, member] }));
  },

  updateTeamMember: async (id, updates) => {
    const current = get().teamMembers.find((m) => m.id === id);
    if (!current) return;
    if (get().usingSampleData) {
      const updated = { ...current, ...updates };
      set((s) => ({ teamMembers: s.teamMembers.map((m) => (m.id === id ? updated : m)) }));
      return;
    }
    const updated = await api.teamMembers.update(id, { ...current, ...updates });
    set((s) => ({ teamMembers: s.teamMembers.map((m) => (m.id === id ? updated : m)) }));
  },

  deleteTeamMember: async (id) => {
    if (get().usingSampleData) {
      set((s) => ({ teamMembers: s.teamMembers.filter((m) => m.id !== id) }));
      return;
    }
    await api.teamMembers.delete(id);
    set((s) => ({ teamMembers: s.teamMembers.filter((m) => m.id !== id) }));
  },

  // --- Forecasts ---
  upsertForecast: async (data) => {
    if (get().usingSampleData) {
      const existing = get().forecasts.find((f) => f.projectId === data.projectId && f.month === data.month);
      const forecast: MonthlyForecast = existing
        ? { ...existing, ...data }
        : { ...data, id: makeId('forecast') };
      set((s) => ({
        forecasts: existing
          ? s.forecasts.map((f) => (f.id === existing.id ? forecast : f))
          : [...s.forecasts, forecast],
      }));
      return;
    }
    const forecast = await api.forecasts.upsert(data);
    set((s) => {
      const exists = s.forecasts.find((f) => f.projectId === data.projectId && f.month === data.month);
      return {
        forecasts: exists
          ? s.forecasts.map((f) => (f.id === exists.id ? forecast : f))
          : [...s.forecasts, forecast],
      };
    });
  },

  deleteForecast: async (id) => {
    if (get().usingSampleData) {
      set((s) => ({ forecasts: s.forecasts.filter((f) => f.id !== id) }));
      return;
    }
    await api.forecasts.delete(id);
    set((s) => ({ forecasts: s.forecasts.filter((f) => f.id !== id) }));
  },

  // --- Seed ---
  resetToSampleData: async () => {
    set({ loading: true, error: null });
    if (get().usingSampleData) {
      set(loadSampleState());
      return;
    }
    try {
      await api.seed();
      await get().initialize();
    } catch (_err) {
      set(loadSampleState());
    }
  },
}));
