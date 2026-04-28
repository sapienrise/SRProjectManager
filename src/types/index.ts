export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ActionStatus = 'todo' | 'in-progress' | 'done' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  budget: number;
  actualSpend: number;
  forecastedCost: number;
  progress: number; // 0-100
  teamMemberIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: ActionStatus;
  priority: Priority;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface MonthlyForecast {
  id: string;
  projectId: string;
  month: string; // YYYY-MM
  planned: number;
  actual: number;
  forecast: number;
}
