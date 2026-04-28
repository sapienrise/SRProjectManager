import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Filter, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { ActionItemForm } from '../components/forms/ActionItemForm';
import { ActionItem, ActionStatus, Priority } from '../types';
import {
  formatDate, daysUntil,
  actionStatusColors, actionStatusLabel,
  priorityColors, priorityLabel,
} from '../utils/format';
import clsx from 'clsx';

type SortField = 'dueDate' | 'priority' | 'status' | 'title';

const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const statusOrder: Record<ActionStatus, number> = { 'in-progress': 0, todo: 1, done: 2, cancelled: 3 };

export function ActionItems() {
  const { actionItems, projects, teamMembers, addActionItem, updateActionItem, deleteActionItem } = useStore();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortField>('dueDate');
  const [modal, setModal] = useState<null | 'add' | { type: 'edit'; item: ActionItem } | { type: 'delete'; item: ActionItem }>(null);

  const filtered = useMemo(() => {
    let items = actionItems.filter((a) => {
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
      const matchProject = projectFilter === 'all' || a.projectId === projectFilter;
      const matchAssignee = assigneeFilter === 'all' || a.assigneeId === assigneeFilter;
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || a.priority === priorityFilter;
      return matchSearch && matchProject && matchAssignee && matchStatus && matchPriority;
    });

    items.sort((a, b) => {
      if (sortBy === 'dueDate') return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortBy === 'status') return statusOrder[a.status] - statusOrder[b.status];
      return a.title.localeCompare(b.title);
    });
    return items;
  }, [actionItems, search, projectFilter, assigneeFilter, statusFilter, priorityFilter, sortBy]);

  const stats = useMemo(() => ({
    todo: actionItems.filter(a => a.status === 'todo').length,
    inProgress: actionItems.filter(a => a.status === 'in-progress').length,
    done: actionItems.filter(a => a.status === 'done').length,
    overdue: actionItems.filter(a => daysUntil(a.dueDate) < 0 && a.status !== 'done' && a.status !== 'cancelled').length,
  }), [actionItems]);

  const handleAdd = (data: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => { addActionItem(data); setModal(null); };
  const handleEdit = (data: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (modal && typeof modal === 'object' && modal.type === 'edit') { updateActionItem(modal.item.id, data); setModal(null); }
  };
  const handleDelete = () => {
    if (modal && typeof modal === 'object' && modal.type === 'delete') { deleteActionItem(modal.item.id); setModal(null); }
  };

  const cycleStatus = (item: ActionItem) => {
    const next: Record<ActionStatus, ActionStatus> = { todo: 'in-progress', 'in-progress': 'done', done: 'todo', cancelled: 'todo' };
    updateActionItem(item.id, { status: next[item.status] });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">{actionItems.length} total across all projects</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add Item</button>
      </div>

      {/* Summary Stat Pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'To Do', value: stats.todo, color: 'bg-gray-100 text-gray-700', filter: 'todo' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-100 text-blue-700', filter: 'in-progress' },
          { label: 'Done', value: stats.done, color: 'bg-green-100 text-green-700', filter: 'done' },
          { label: 'Overdue', value: stats.overdue, color: 'bg-red-100 text-red-700', filter: 'all' },
        ].map((s) => (
          <button key={s.label}
            onClick={() => setStatusFilter(s.filter === 'all' ? 'all' : s.filter as ActionStatus)}
            className={clsx('px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-opacity hover:opacity-80', s.color)}>
            <span className="text-lg font-bold">{s.value}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search action items..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input w-auto" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
          <option value="all">All Assignees</option>
          {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ActionStatus | 'all')}>
          <option value="all">All Status</option>
          {(['todo','in-progress','done','cancelled'] as ActionStatus[]).map(s => <option key={s} value={s}>{actionStatusLabel[s]}</option>)}
        </select>
        <select className="input w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}>
          <option value="all">All Priority</option>
          {(['low','medium','high','critical'] as Priority[]).map(p => <option key={p} value={p}>{priorityLabel[p]}</option>)}
        </select>
        <select className="input w-auto ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)}>
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="status">Sort: Status</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>

      {/* Results count */}
      {filtered.length !== actionItems.length && (
        <p className="text-sm text-gray-500">Showing {filtered.length} of {actionItems.length} items</p>
      )}

      {/* Items */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Search size={28} />} title="No action items found" description="Try adjusting your filters or create a new action item."
          action={<button className="btn-primary" onClick={() => setModal('add')}><Plus size={14} /> Add Item</button>} />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const project = projects.find((p) => p.id === item.projectId);
            const assignee = teamMembers.find((m) => m.id === item.assigneeId);
            const overdue = daysUntil(item.dueDate) < 0 && item.status !== 'done' && item.status !== 'cancelled';
            const days = item.dueDate ? daysUntil(item.dueDate) : null;

            return (
              <div key={item.id} className={clsx('card px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow', overdue && 'border-red-100')}>
                {/* Status toggle */}
                <button onClick={() => cycleStatus(item)}
                  className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                    item.status === 'done' ? 'bg-green-500 border-green-500 text-white' :
                    item.status === 'in-progress' ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  )}>
                  {item.status === 'done' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  {item.status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-medium', item.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800')}>
                    {item.title}
                  </p>
                  {item.description && <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>}
                  {project && (
                    <Link to={`/projects/${project.id}`} className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 mt-0.5">
                      <ExternalLink size={10} /> {project.name}
                    </Link>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {overdue && <AlertTriangle size={13} className="text-red-500" />}
                  <Badge label={priorityLabel[item.priority]} className={priorityColors[item.priority]} size="sm" />
                  <Badge label={actionStatusLabel[item.status]} className={actionStatusColors[item.status]} size="sm" />
                  {item.dueDate && (
                    <span className={clsx('text-xs', overdue ? 'text-red-500 font-medium' : days !== null && days <= 3 ? 'text-amber-600' : 'text-gray-400')}>
                      {overdue ? `${Math.abs(days!)}d late` : days === 0 ? 'Due today' : `Due ${formatDate(item.dueDate)}`}
                    </span>
                  )}
                  {assignee ? <Avatar name={assignee.name} id={assignee.id} size="sm" showTooltip /> : <span className="text-xs text-gray-300">—</span>}
                  <button onClick={() => setModal({ type: 'edit', item })} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Edit2 size={12} /></button>
                  <button onClick={() => setModal({ type: 'delete', item })} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && (
        <Modal title="Add Action Item" onClose={() => setModal(null)} size="md">
          <ActionItemForm onSave={handleAdd} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'edit' && (
        <Modal title="Edit Action Item" onClose={() => setModal(null)} size="md">
          <ActionItemForm initial={modal.item} onSave={handleEdit} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'delete' && (
        <Modal title="Delete Action Item" onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Delete <strong>{modal.item.title}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
