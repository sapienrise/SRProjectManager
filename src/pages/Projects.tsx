import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List, Calendar, DollarSign, Users, ChevronRight, Trash2, Edit2, Filter } from 'lucide-react';
import { useStore } from '../store';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AvatarGroup } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { ProjectForm } from '../components/forms/ProjectForm';
import { Project, ProjectStatus, Priority } from '../types';
import { formatCurrency, formatDate, statusColors, statusLabel, priorityColors, priorityLabel, daysUntil } from '../utils/format';
import clsx from 'clsx';

type ViewMode = 'grid' | 'list';

export function Projects() {
  const { projects, addProject, updateProject, deleteProject, teamMembers } = useStore();
  const [view, setView] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [modal, setModal] = useState<null | 'add' | { type: 'edit'; project: Project } | { type: 'delete'; project: Project }>(null);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.client.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchPriority = priorityFilter === 'all' || p.priority === priorityFilter;
        return matchSearch && matchStatus && matchPriority;
      }),
    [projects, search, statusFilter, priorityFilter]
  );

  const handleAdd = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    addProject(data);
    setModal(null);
  };

  const handleEdit = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (modal && typeof modal === 'object' && modal.type === 'edit') {
      updateProject(modal.project.id, data);
      setModal(null);
    }
  };

  const handleDelete = () => {
    if (modal && typeof modal === 'object' && modal.type === 'delete') {
      deleteProject(modal.project.id);
      setModal(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} total · {projects.filter(p => p.status === 'active').length} active</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}>
            <option value="all">All Status</option>
            {(['planning','active','on-hold','completed','cancelled'] as ProjectStatus[]).map(s => (
              <option key={s} value={s}>{statusLabel[s]}</option>
            ))}
          </select>
          <select className="input w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}>
            <option value="all">All Priority</option>
            {(['low','medium','high','critical'] as Priority[]).map(p => (
              <option key={p} value={p}>{priorityLabel[p]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 ml-auto bg-gray-100 rounded-lg p-1">
          <button className={clsx('p-1.5 rounded', view === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400')} onClick={() => setView('grid')}>
            <LayoutGrid size={15} />
          </button>
          <button className={clsx('p-1.5 rounded', view === 'list' ? 'bg-white shadow-sm' : 'text-gray-400')} onClick={() => setView('list')}>
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          icon={<Search size={28} />}
          title="No projects found"
          description="Try adjusting your filters or create a new project."
          action={<button className="btn-primary" onClick={() => setModal('add')}><Plus size={14} /> New Project</button>}
        />
      )}

      {/* Grid View */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const days = daysUntil(p.endDate);
            const budgetPct = Math.round((p.actualSpend / p.budget) * 100);
            return (
              <div key={p.id} className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                {/* Top */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${p.id}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">{p.name}</Link>
                    <p className="text-xs text-gray-400 mt-0.5">{p.client}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setModal({ type: 'edit', project: p })} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setModal({ type: 'delete', project: p })} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge label={statusLabel[p.status]} className={statusColors[p.status]} size="sm" />
                  <Badge label={priorityLabel[p.priority]} className={priorityColors[p.priority]} size="sm" />
                  {p.tags.slice(0, 2).map(t => <Badge key={t} label={t} className="bg-gray-100 text-gray-500" size="sm" />)}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span><span className="font-medium">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} size="md" />
                </div>

                {/* Budget */}
                <div className="grid grid-cols-3 gap-2 text-center border border-gray-100 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(p.budget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Spent</p>
                    <p className={clsx('text-sm font-semibold', budgetPct > 100 ? 'text-red-500' : 'text-gray-800')}>{formatCurrency(p.actualSpend)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Forecast</p>
                    <p className={clsx('text-sm font-semibold', p.forecastedCost > p.budget ? 'text-amber-600' : 'text-gray-800')}>{formatCurrency(p.forecastedCost)}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <AvatarGroup memberIds={p.teamMemberIds} members={teamMembers} size="sm" />
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={11} />
                    <span className={days < 0 ? 'text-red-500 font-medium' : days < 30 ? 'text-amber-600' : ''}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  </div>
                  <Link to={`/projects/${p.id}`} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                    Details <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Spent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Team</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const days = daysUntil(p.endDate);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/projects/${p.id}`} className="font-medium text-gray-800 hover:text-blue-600">{p.name}</Link>
                      <p className="text-xs text-gray-400">{p.client}</p>
                    </td>
                    <td className="px-4 py-3"><Badge label={statusLabel[p.status]} className={statusColors[p.status]} size="sm" /></td>
                    <td className="px-4 py-3"><Badge label={priorityLabel[p.priority]} className={priorityColors[p.priority]} size="sm" /></td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.budget)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(p.actualSpend)}</td>
                    <td className="px-4 py-3"><ProgressBar value={p.progress} showLabel /></td>
                    <td className="px-4 py-3"><AvatarGroup memberIds={p.teamMemberIds} members={teamMembers} size="sm" /></td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-xs', days < 0 ? 'text-red-500 font-medium' : days < 30 ? 'text-amber-600' : 'text-gray-500')}>
                        {formatDate(p.endDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type: 'edit', project: p })} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setModal({ type: 'delete', project: p })} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                        <Link to={`/projects/${p.id}`} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500">
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && (
        <Modal title="New Project" onClose={() => setModal(null)} size="lg">
          <ProjectForm onSave={handleAdd} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'edit' && (
        <Modal title="Edit Project" onClose={() => setModal(null)} size="lg">
          <ProjectForm initial={modal.project} onSave={handleEdit} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'delete' && (
        <Modal title="Delete Project" onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{modal.project.name}</strong>? This will also delete all associated action items and forecasts.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete Project</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
