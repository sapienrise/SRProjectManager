import { useState } from 'react';
import { Project, ProjectStatus, Priority } from '../../types';
import { useStore } from '../../store';

interface ProjectFormProps {
  initial?: Partial<Project>;
  onSave: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const statusOptions: ProjectStatus[] = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
const priorityOptions: Priority[] = ['low', 'medium', 'high', 'critical'];

export function ProjectForm({ initial, onSave, onCancel }: ProjectFormProps) {
  const { teamMembers } = useStore();
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    client: initial?.client || '',
    status: (initial?.status || 'planning') as ProjectStatus,
    priority: (initial?.priority || 'medium') as Priority,
    startDate: initial?.startDate || '',
    endDate: initial?.endDate || '',
    budget: initial?.budget?.toString() || '',
    actualSpend: initial?.actualSpend?.toString() || '0',
    forecastedCost: initial?.forecastedCost?.toString() || '',
    progress: initial?.progress?.toString() || '0',
    teamMemberIds: initial?.teamMemberIds || [],
    tags: initial?.tags?.join(', ') || '',
  });

  const set = (field: string, value: string | string[]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleMember = (id: string) => {
    const next = form.teamMemberIds.includes(id)
      ? form.teamMemberIds.filter((x) => x !== id)
      : [...form.teamMemberIds, id];
    set('teamMemberIds', next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = Number(form.budget);
    onSave({
      name: form.name,
      description: form.description,
      client: form.client,
      status: form.status,
      priority: form.priority,
      startDate: form.startDate,
      endDate: form.endDate,
      budget,
      actualSpend: Number(form.actualSpend),
      forecastedCost: Number(form.forecastedCost) || budget,
      progress: Math.min(100, Math.max(0, Number(form.progress))),
      teamMemberIds: form.teamMemberIds,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Project Name *</label>
          <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. ERP System Upgrade" />
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What is this project about?" />
        </div>
        <div>
          <label className="label">Client / Owner *</label>
          <input className="input" required value={form.client} onChange={(e) => set('client', e.target.value)} placeholder="Client or department name" />
        </div>
        <div>
          <label className="label">Tags</label>
          <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="ERP, Migration, Cloud (comma separated)" />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {priorityOptions.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Start Date</label>
          <input className="input" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
        </div>
        <div>
          <label className="label">End Date</label>
          <input className="input" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
        </div>
        <div>
          <label className="label">Budget ($)</label>
          <input className="input" type="number" min="0" required value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label">Actual Spend ($)</label>
          <input className="input" type="number" min="0" value={form.actualSpend} onChange={(e) => set('actualSpend', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label">Forecasted Cost ($)</label>
          <input className="input" type="number" min="0" value={form.forecastedCost} onChange={(e) => set('forecastedCost', e.target.value)} placeholder="Leave blank to use budget" />
        </div>
        <div>
          <label className="label">Progress (%)</label>
          <input className="input" type="number" min="0" max="100" value={form.progress} onChange={(e) => set('progress', e.target.value)} placeholder="0-100" />
        </div>
      </div>

      {/* Team Members */}
      <div>
        <label className="label">Team Members</label>
        <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {teamMembers.map((m) => (
            <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
              <input
                type="checkbox"
                checked={form.teamMemberIds.includes(m.id)}
                onChange={() => toggleMember(m.id)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">{m.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{m.role}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Project</button>
      </div>
    </form>
  );
}
