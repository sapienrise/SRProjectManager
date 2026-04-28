import { useState } from 'react';
import { ActionItem, ActionStatus, Priority } from '../../types';
import { useStore } from '../../store';

interface ActionItemFormProps {
  initial?: Partial<ActionItem>;
  defaultProjectId?: string;
  onSave: (data: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const statusOptions: ActionStatus[] = ['todo', 'in-progress', 'done', 'cancelled'];
const priorityOptions: Priority[] = ['low', 'medium', 'high', 'critical'];

const statusLabels: Record<ActionStatus, string> = {
  todo: 'To Do', 'in-progress': 'In Progress', done: 'Done', cancelled: 'Cancelled',
};

export function ActionItemForm({ initial, defaultProjectId, onSave, onCancel }: ActionItemFormProps) {
  const { projects, teamMembers } = useStore();
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    projectId: initial?.projectId || defaultProjectId || '',
    status: (initial?.status || 'todo') as ActionStatus,
    priority: (initial?.priority || 'medium') as Priority,
    assigneeId: initial?.assigneeId || '',
    dueDate: initial?.dueDate || '',
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input className="input" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Action item title" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[72px] resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Additional details..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Project *</label>
          <select className="input" required value={form.projectId} onChange={(e) => set('projectId', e.target.value)}>
            <option value="">Select project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Assignee</label>
          <select className="input" value={form.assigneeId} onChange={(e) => set('assigneeId', e.target.value)}>
            <option value="">Unassigned</option>
            {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {statusOptions.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {priorityOptions.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Due Date</label>
          <input className="input" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Action Item</button>
      </div>
    </form>
  );
}
