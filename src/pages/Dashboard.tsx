import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FolderKanban, DollarSign, CheckSquare, TrendingUp, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { useStore } from '../store';
import { StatsCard } from '../components/ui/StatsCard';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import {
  formatCurrency, formatDate, daysUntil,
  statusLabel, statusColors, priorityColors, priorityLabel,
  actionStatusColors, actionStatusLabel,
} from '../utils/format';

const STATUS_CHART_COLORS: Record<string, string> = {
  planning: '#3b82f6',
  active: '#22c55e',
  'on-hold': '#f59e0b',
  completed: '#94a3b8',
  cancelled: '#ef4444',
};

export function Dashboard() {
  const { projects, actionItems, teamMembers } = useStore();

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'active');
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.actualSpend, 0);
    const overBudget = projects.filter((p) => p.forecastedCost > p.budget).length;
    const done = projects.filter((p) => p.status === 'completed').length;
    const openActions = actionItems.filter((a) => a.status !== 'done' && a.status !== 'cancelled');
    const overdueActions = openActions.filter((a) => daysUntil(a.dueDate) < 0);
    return { active, totalBudget, totalSpent, overBudget, done, openActions, overdueActions };
  }, [projects, actionItems]);

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: statusLabel[name as keyof typeof statusLabel] || name,
      value,
      key: name,
    }));
  }, [projects]);

  // Monthly planned vs actual (last 6 months across all projects)
  const monthlyData = useMemo(() => {
    const { forecasts } = useStore.getState();
    const byMonth: Record<string, { planned: number; actual: number; forecast: number }> = {};
    forecasts.forEach((f) => {
      if (!byMonth[f.month]) byMonth[f.month] = { planned: 0, actual: 0, forecast: 0 };
      byMonth[f.month].planned += f.planned;
      byMonth[f.month].actual += f.actual;
      byMonth[f.month].forecast += f.forecast;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        Planned: Math.round(v.planned / 1000),
        Actual: Math.round(v.actual / 1000),
        Forecast: Math.round(v.forecast / 1000),
      }));
  }, []);

  const recentActions = useMemo(
    () => [...actionItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [actionItems]
  );

  const upcomingDeadlines = useMemo(
    () =>
      projects
        .filter((p) => p.status !== 'completed' && p.status !== 'cancelled')
        .map((p) => ({ ...p, days: daysUntil(p.endDate) }))
        .filter((p) => p.days <= 90)
        .sort((a, b) => a.days - b.days)
        .slice(0, 5),
    [projects]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Total Projects"
          value={projects.length}
          sub={`${stats.active.length} active · ${stats.done} completed`}
          icon={<FolderKanban size={22} />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatsCard
          label="Total Budget"
          value={formatCurrency(stats.totalBudget)}
          sub={`${formatCurrency(stats.totalSpent)} spent`}
          icon={<DollarSign size={22} />}
          iconBg="bg-green-50 text-green-600"
          trend={{ value: `${Math.round((stats.totalSpent / stats.totalBudget) * 100)}% utilized`, up: stats.totalSpent < stats.totalBudget }}
        />
        <StatsCard
          label="Open Action Items"
          value={stats.openActions.length}
          sub={`${stats.overdueActions.length} overdue`}
          icon={<CheckSquare size={22} />}
          iconBg="bg-purple-50 text-purple-600"
        />
        <StatsCard
          label="Over Budget Projects"
          value={stats.overBudget}
          sub={`${projects.length - stats.overBudget} on track`}
          icon={<TrendingUp size={22} />}
          iconBg={stats.overBudget > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Status Pie */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Projects by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                {statusChartData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_CHART_COLORS[entry.key] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} project${v !== 1 ? 's' : ''}`, '']} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Budget vs Actual */}
        <div className="card p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Spend Overview ($K)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={10} barGap={2}>
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
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Action Items */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Action Items</h2>
            <Link to="/action-items" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActions.map((item) => {
              const project = projects.find((p) => p.id === item.projectId);
              const assignee = teamMembers.find((m) => m.id === item.assigneeId);
              const overdue = daysUntil(item.dueDate) < 0 && item.status !== 'done';
              return (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  {assignee && <Avatar name={assignee.name} id={assignee.id} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{project?.name} · Due {formatDate(item.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {overdue && <AlertTriangle size={13} className="text-red-500" />}
                    <Badge label={actionStatusLabel[item.status]} className={actionStatusColors[item.status]} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Project Deadlines</h2>
            <Link to="/projects" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No upcoming deadlines</p>
            )}
            {upcomingDeadlines.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="block hover:bg-gray-50 rounded-lg -mx-2 px-2 py-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${p.days < 14 ? 'bg-red-50 text-red-500' : p.days < 30 ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                    <Clock size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <ProgressBar value={p.progress} />
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-semibold ${p.days < 0 ? 'text-red-500' : p.days < 14 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {p.days < 0 ? `${Math.abs(p.days)}d overdue` : `${p.days}d left`}
                    </p>
                    <Badge label={statusLabel[p.status]} className={statusColors[p.status]} size="sm" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Project Budget Overview Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Project Budget Overview</h2>
          <Link to="/forecast" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Full forecast <ArrowRight size={13} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Spent</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Forecast</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Variance</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Progress</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const variance = p.budget - p.forecastedCost;
                const isOver = variance < 0;
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <Link to={`/projects/${p.id}`} className="font-medium text-gray-800 hover:text-blue-600">{p.name}</Link>
                      <p className="text-xs text-gray-400">{p.client}</p>
                    </td>
                    <td className="py-3 px-3">
                      <Badge label={statusLabel[p.status]} className={statusColors[p.status]} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-medium">{formatCurrency(p.budget)}</td>
                    <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(p.actualSpend)}</td>
                    <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(p.forecastedCost)}</td>
                    <td className={`py-3 px-3 text-right font-medium ${isOver ? 'text-red-500' : 'text-green-600'}`}>
                      {isOver ? '-' : '+'}{formatCurrency(Math.abs(variance))}
                    </td>
                    <td className="py-3 px-3">
                      <ProgressBar value={p.progress} showLabel size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-3 px-3 font-semibold text-gray-700" colSpan={2}>Total</td>
                <td className="py-3 px-3 text-right font-semibold">{formatCurrency(projects.reduce((s, p) => s + p.budget, 0))}</td>
                <td className="py-3 px-3 text-right font-semibold">{formatCurrency(projects.reduce((s, p) => s + p.actualSpend, 0))}</td>
                <td className="py-3 px-3 text-right font-semibold">{formatCurrency(projects.reduce((s, p) => s + p.forecastedCost, 0))}</td>
                <td className="py-3 px-3 text-right font-semibold">
                  {(() => {
                    const v = projects.reduce((s, p) => s + p.budget - p.forecastedCost, 0);
                    return <span className={v < 0 ? 'text-red-500' : 'text-green-600'}>{v < 0 ? '-' : '+'}{formatCurrency(Math.abs(v))}</span>;
                  })()}
                </td>
                <td className="py-3 px-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
