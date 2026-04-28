import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Plus, Calendar, DollarSign, TrendingUp,
  Users, CheckSquare, Tag, Clock, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { useStore } from '../store';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar, AvatarGroup } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { ProjectForm } from '../components/forms/ProjectForm';
import { ActionItemForm } from '../components/forms/ActionItemForm';
import { ActionItem, Project } from '../types';
import {
  formatCurrency, formatDate, daysUntil,
  statusColors, statusLabel, priorityColors, priorityLabel,
  actionStatusColors, actionStatusLabel, getAvatarColor, getInitials,
} from '../utils/format';
import clsx from 'clsx';

type Tab = 'overview' | 'actions' | 'forecast' | 'team';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, actionItems, teamMembers, forecasts, updateProject, deleteProject, addActionItem, updateActionItem, deleteActionItem } = useStore();

  const project = projects.find((p) => p.id === id);
  const [tab, setTab] = useState<Tab>('overview');
  const [modal, setModal] = useState<null | 'edit' | 'delete' | 'addAction' | { type: 'editAction'; item: ActionItem } | { type: 'deleteAction'; item: ActionItem }>(null);
  const [actionStatusFilter, setActionStatusFilter] = useState<string>('all');

  const projectActions = useMemo(
    () => actionItems.filter((a) => a.projectId === id),
    [actionItems, id]
  );

  const filteredActions = useMemo(
    () => actionStatusFilter === 'all' ? projectActions : projectActions.filter(a => a.status === actionStatusFilter),
    [projectActions, actionStatusFilter]
  );

  const projectForecasts = useMemo(
    () => forecasts.filter((f) => f.projectId === id).sort((a, b) => a.month.localeCompare(b.month)),
    [forecasts, id]
  );

  const forecastChartData = useMemo(
    () => projectForecasts.map((f) => ({
      month: new Date(f.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      Planned: Math.round(f.planned / 1000),
      Actual: f.actual > 0 ? Math.round(f.actual / 1000) : undefined,
      Forecast: Math.round(f.forecast / 1000),
    })),
    [projectForecasts]
  );

  if (!project) {
    return (
      <div className="p-6">
        <div className="card p-12 text-center">
          <p className="text-gray-500">Project not found.</p>
          <Link to="/projects" className="btn-primary mt-4 inline-flex">Back to Projects</Link>
        </div>
      </div>
    );
  }

  const days = daysUntil(project.endDate);
  const budgetVariance = project.budget - project.forecastedCost;
  const spendPct = Math.round((project.actualSpend / project.budget) * 100);
  const projectTeam = teamMembers.filter((m) => project.teamMemberIds.includes(m.id));

  const handleEditProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateProject(project.id, data);
    setModal(null);
  };

  const handleDeleteProject = () => {
    deleteProject(project.id);
    navigate('/projects');
  };

  const handleAddAction = (data: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    addActionItem(data);
    setModal(null);
  };

  const handleEditAction = (data: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (modal && typeof modal === 'object' && modal.type === 'editAction') {
      updateActionItem(modal.item.id, data);
      setModal(null);
    }
  };

  const handleDeleteAction = () => {
    if (modal && typeof modal === 'object' && modal.type === 'deleteAction') {
      deleteActionItem(modal.item.id);
      setModal(null);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof CheckSquare }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'actions', label: `Action Items (${projectActions.length})`, icon: CheckSquare },
    { key: 'forecast', label: 'Forecast', icon: DollarSign },
    { key: 'team', label: 'Team', icon: Users },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Back + Header */}
      <div>
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={15} /> Back to Projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge label={statusLabel[project.status]} className={statusColors[project.status]} />
              <Badge label={priorityLabel[project.priority]} className={priorityColors[project.priority]} />
              {project.tags.map(t => <Badge key={t} label={t} className="bg-gray-100 text-gray-500" size="sm" />)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{project.client}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="btn-secondary" onClick={() => setModal('edit')}><Edit2 size={14} /> Edit</button>
            <button className="btn-danger" onClick={() => setModal('delete')}><Trash2 size={14} /></button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Budget', value: formatCurrency(project.budget), sub: `${spendPct}% utilized`, icon: <DollarSign size={18} />, bg: 'bg-blue-50 text-blue-600' },
          { label: 'Spent', value: formatCurrency(project.actualSpend), sub: `of ${formatCurrency(project.budget)}`, icon: <TrendingUp size={18} />, bg: spendPct > 90 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600' },
          { label: 'Forecast', value: formatCurrency(project.forecastedCost), sub: `${budgetVariance < 0 ? 'over' : 'under'} by ${formatCurrency(Math.abs(budgetVariance))}`, icon: <TrendingUp size={18} />, bg: budgetVariance < 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600' },
          { label: 'Deadline', value: `${Math.abs(days)}d ${days < 0 ? 'over' : 'left'}`, sub: formatDate(project.endDate), icon: <Clock size={18} />, bg: days < 0 ? 'bg-red-50 text-red-500' : days < 30 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={clsx('p-2.5 rounded-xl', stat.bg)}>{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={clsx('flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setTab(key)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{project.description || 'No description provided.'}</p>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Progress</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Completion</span>
                <span className="font-semibold text-gray-900">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} size="md" />
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Budget Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Budget', value: project.budget, pct: 100, color: 'bg-blue-200' },
                  { label: 'Actual Spend', value: project.actualSpend, pct: spendPct, color: 'bg-blue-500' },
                  { label: 'Forecasted Cost', value: project.forecastedCost, pct: Math.round((project.forecastedCost / project.budget) * 100), color: budgetVariance < 0 ? 'bg-red-400' : 'bg-emerald-400' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{row.label}</span>
                      <span className="font-medium">{formatCurrency(row.value)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full', row.color)} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-500">Start:</span>
                  <span className="font-medium text-gray-800">{formatDate(project.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-500">End:</span>
                  <span className={clsx('font-medium', days < 0 ? 'text-red-500' : 'text-gray-800')}>{formatDate(project.endDate)}</span>
                </div>
                {days < 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                    <AlertTriangle size={13} /> {Math.abs(days)} days overdue
                  </div>
                )}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Team ({project.teamMemberIds.length})</h3>
              <div className="space-y-2">
                {projectTeam.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Avatar name={m.name} id={m.id} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.role}</p>
                    </div>
                  </div>
                ))}
                {projectTeam.length === 0 && <p className="text-xs text-gray-400">No team members assigned.</p>}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Action Items</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                {(['todo','in-progress','done','cancelled'] as const).map(s => {
                  const count = projectActions.filter(a => a.status === s).length;
                  return (
                    <div key={s} className={clsx('rounded-lg p-2', actionStatusColors[s].replace('text-', 'bg-').replace('700','50').replace('600','50'))}>
                      <p className="text-xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500">{actionStatusLabel[s]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Items Tab */}
      {tab === 'actions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {['all', 'todo', 'in-progress', 'done', 'cancelled'].map((s) => (
                <button key={s} onClick={() => setActionStatusFilter(s)}
                  className={clsx('px-3 py-1.5 text-xs rounded-lg font-medium transition-colors',
                    actionStatusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}>
                  {s === 'all' ? 'All' : actionStatusLabel[s as keyof typeof actionStatusLabel]}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setModal('addAction')}><Plus size={14} /> Add Item</button>
          </div>

          {filteredActions.length === 0 && (
            <EmptyState icon={<CheckSquare size={28} />} title="No action items" description="Add action items to track work for this project."
              action={<button className="btn-primary" onClick={() => setModal('addAction')}><Plus size={14} /> Add Item</button>} />
          )}

          <div className="space-y-2">
            {filteredActions.map((item) => {
              const assignee = teamMembers.find((m) => m.id === item.assigneeId);
              const overdue = daysUntil(item.dueDate) < 0 && item.status !== 'done' && item.status !== 'cancelled';
              const nextStatus: Record<string, string> = { todo: 'in-progress', 'in-progress': 'done', done: 'todo', cancelled: 'todo' };
              return (
                <div key={item.id} className="card px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                  <button
                    onClick={() => updateActionItem(item.id, { status: nextStatus[item.status] as ActionItem['status'] })}
                    className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                      item.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-400'
                    )}
                  >
                    {item.status === 'done' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm font-medium', item.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800')}>{item.title}</p>
                    {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {overdue && <AlertTriangle size={13} className="text-red-500" />}
                    <Badge label={priorityLabel[item.priority]} className={priorityColors[item.priority]} size="sm" />
                    <Badge label={actionStatusLabel[item.status]} className={actionStatusColors[item.status]} size="sm" />
                    {item.dueDate && (
                      <span className={clsx('text-xs', overdue ? 'text-red-500 font-medium' : 'text-gray-400')}>
                        {formatDate(item.dueDate)}
                      </span>
                    )}
                    {assignee && <Avatar name={assignee.name} id={assignee.id} size="sm" showTooltip />}
                    <button onClick={() => setModal({ type: 'editAction', item })} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Edit2 size={12} /></button>
                    <button onClick={() => setModal({ type: 'deleteAction', item })} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Forecast Tab */}
      {tab === 'forecast' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Budget', value: formatCurrency(project.budget), sub: 'Approved budget', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Actual Spend', value: formatCurrency(project.actualSpend), sub: `${spendPct}% of budget`, color: 'text-gray-900', bg: 'bg-gray-50' },
              { label: 'Est. at Completion', value: formatCurrency(project.forecastedCost), sub: budgetVariance < 0 ? `Over by ${formatCurrency(Math.abs(budgetVariance))}` : `Under by ${formatCurrency(budgetVariance)}`, color: budgetVariance < 0 ? 'text-red-500' : 'text-green-600', bg: budgetVariance < 0 ? 'bg-red-50' : 'bg-green-50' },
            ].map((c) => (
              <div key={c.label} className={clsx('card p-4', c.bg)}>
                <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                <p className={clsx('text-2xl font-bold mt-1', c.color)}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>

          {forecastChartData.length > 0 ? (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Planned vs Actual vs Forecast ($K)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={forecastChartData} barSize={14} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`$${v}K`]} />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar dataKey="Planned" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Actual" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Forecast" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={<TrendingUp size={28} />} title="No forecast data" description="Monthly forecast data will appear here." />
          )}

          {projectForecasts.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Monthly Breakdown</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Month', 'Planned', 'Actual', 'Forecast', 'Variance'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectForecasts.map((f) => {
                    const v = f.actual > 0 ? f.planned - f.actual : f.planned - f.forecast;
                    return (
                      <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700">{new Date(f.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                        <td className="px-4 py-3 text-gray-600">{formatCurrency(f.planned)}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{f.actual > 0 ? formatCurrency(f.actual) : '—'}</td>
                        <td className="px-4 py-3 text-amber-600">{formatCurrency(f.forecast)}</td>
                        <td className={clsx('px-4 py-3 font-medium', v < 0 ? 'text-red-500' : 'text-green-600')}>{v < 0 ? '-' : '+'}{formatCurrency(Math.abs(v))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Team Tab */}
      {tab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projectTeam.map((m) => {
            const assignedActions = projectActions.filter((a) => a.assigneeId === m.id);
            const openActions = assignedActions.filter((a) => a.status !== 'done' && a.status !== 'cancelled');
            return (
              <div key={m.id} className="card p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} id={m.id} size="lg" />
                  <div>
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.role}</p>
                    <p className="text-xs text-gray-400">{m.department}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{m.email}</div>
                <div className="flex gap-3 text-center text-sm pt-2 border-t border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">{assignedActions.length}</p>
                    <p className="text-xs text-gray-400">Total Tasks</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-600">{openActions.length}</p>
                    <p className="text-xs text-gray-400">Open</p>
                  </div>
                  <div>
                    <p className="font-bold text-green-600">{assignedActions.filter(a => a.status === 'done').length}</p>
                    <p className="text-xs text-gray-400">Done</p>
                  </div>
                </div>
              </div>
            );
          })}
          {projectTeam.length === 0 && (
            <div className="col-span-3">
              <EmptyState icon={<Users size={28} />} title="No team members" description="Edit the project to add team members." />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'edit' && (
        <Modal title="Edit Project" onClose={() => setModal(null)} size="lg">
          <ProjectForm initial={project} onSave={handleEditProject} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal title="Delete Project" onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Delete <strong>{project.name}</strong>? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteProject}>Delete</button>
            </div>
          </div>
        </Modal>
      )}
      {modal === 'addAction' && (
        <Modal title="Add Action Item" onClose={() => setModal(null)} size="md">
          <ActionItemForm defaultProjectId={id} onSave={handleAddAction} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'editAction' && (
        <Modal title="Edit Action Item" onClose={() => setModal(null)} size="md">
          <ActionItemForm initial={modal.item} onSave={handleEditAction} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'deleteAction' && (
        <Modal title="Delete Action Item" onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Delete <strong>{modal.item.title}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteAction}>Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
