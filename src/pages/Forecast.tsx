import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCurrency, formatCurrencyFull, statusColors, statusLabel } from '../utils/format';
import clsx from 'clsx';

export function Forecast() {
  const { projects, forecasts } = useStore();
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const activeProjects = projects.filter(p => p.status !== 'cancelled');

  // Portfolio Summary
  const summary = useMemo(() => {
    const subset = selectedProject === 'all' ? activeProjects : activeProjects.filter(p => p.id === selectedProject);
    return {
      totalBudget: subset.reduce((s, p) => s + p.budget, 0),
      totalSpent: subset.reduce((s, p) => s + p.actualSpend, 0),
      totalForecast: subset.reduce((s, p) => s + p.forecastedCost, 0),
      overBudget: subset.filter(p => p.forecastedCost > p.budget),
      underBudget: subset.filter(p => p.forecastedCost <= p.budget),
    };
  }, [activeProjects, selectedProject, forecasts]);

  const variance = summary.totalBudget - summary.totalForecast;
  const burnRate = summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0;

  // Bar chart: Budget vs Spent vs Forecast per project
  const projectChartData = useMemo(() => {
    const subset = selectedProject === 'all' ? activeProjects : activeProjects.filter(p => p.id === selectedProject);
    return subset.map(p => ({
      name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
      Budget: Math.round(p.budget / 1000),
      Spent: Math.round(p.actualSpend / 1000),
      Forecast: Math.round(p.forecastedCost / 1000),
      over: p.forecastedCost > p.budget,
    }));
  }, [activeProjects, selectedProject]);

  // Monthly aggregate chart
  const monthlyAgg = useMemo(() => {
    const projectIds = selectedProject === 'all'
      ? activeProjects.map(p => p.id)
      : [selectedProject];
    const byMonth: Record<string, { planned: number; actual: number; forecast: number }> = {};
    forecasts.filter(f => projectIds.includes(f.projectId)).forEach(f => {
      if (!byMonth[f.month]) byMonth[f.month] = { planned: 0, actual: 0, forecast: 0 };
      byMonth[f.month].planned += f.planned;
      byMonth[f.month].actual += f.actual;
      byMonth[f.month].forecast += f.forecast;
    });
    return Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      Planned: Math.round(v.planned / 1000),
      Actual: Math.round(v.actual / 1000),
      'Running Forecast': Math.round(v.forecast / 1000),
    }));
  }, [forecasts, activeProjects, selectedProject]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forecast</h1>
          <p className="text-sm text-gray-500 mt-0.5">Budget planning and cost tracking</p>
        </div>
        <select className="input w-auto" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
          <option value="all">All Projects</option>
          {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Budget', value: formatCurrency(summary.totalBudget),
            sub: 'Approved', icon: <DollarSign size={20} />, bg: 'bg-blue-50 text-blue-600',
          },
          {
            label: 'Total Spent', value: formatCurrency(summary.totalSpent),
            sub: `${burnRate}% of budget`, icon: <TrendingUp size={20} />, bg: 'bg-gray-50 text-gray-600',
          },
          {
            label: 'Est. at Completion', value: formatCurrency(summary.totalForecast),
            sub: `${Math.round((summary.totalForecast / summary.totalBudget) * 100)}% of budget`,
            icon: variance < 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
            bg: variance < 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600',
          },
          {
            label: 'Budget Variance', value: `${variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(variance))}`,
            sub: variance < 0 ? `${summary.overBudget.length} project(s) over budget` : 'Within budget',
            icon: variance < 0 ? <AlertTriangle size={20} /> : <TrendingDown size={20} />,
            bg: variance < 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600',
          },
        ].map((c) => (
          <div key={c.label} className="card p-5 flex items-start gap-3">
            <div className={clsx('p-3 rounded-xl', c.bg)}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Over budget alert */}
      {summary.overBudget.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {summary.overBudget.length} project{summary.overBudget.length > 1 ? 's are' : ' is'} forecasted to exceed budget
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              {summary.overBudget.map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Budget vs Actual vs Forecast by Project ($K)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={projectChartData} barSize={12} barGap={2} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: number) => [`$${v}K`]} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="Budget" fill="#93c5fd" radius={[0, 3, 3, 0]} />
              <Bar dataKey="Spent" fill="#2563eb" radius={[0, 3, 3, 0]} />
              <Bar dataKey="Forecast" fill="#f59e0b" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Trend ($K)</h2>
          {monthlyAgg.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyAgg}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`$${v}K`]} />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="Planned" stroke="#93c5fd" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Actual" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Running Forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">No monthly data available</div>
          )}
        </div>
      </div>

      {/* Detailed Project Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Project Forecast Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Project', 'Status', 'Budget', 'Spent', 'Spent %', 'EAC', 'Variance', 'Progress', 'Health'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(selectedProject === 'all' ? activeProjects : activeProjects.filter(p => p.id === selectedProject)).map(p => {
                const v = p.budget - p.forecastedCost;
                const spentPct = Math.round((p.actualSpend / p.budget) * 100);
                const health = p.forecastedCost <= p.budget && p.progress >= (spentPct - 10) ? 'On Track' : p.forecastedCost > p.budget ? 'Over Budget' : 'At Risk';
                const healthColor = health === 'On Track' ? 'text-green-600 bg-green-50' : health === 'Over Budget' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.client}</p>
                    </td>
                    <td className="px-4 py-3"><Badge label={statusLabel[p.status]} className={statusColors[p.status]} size="sm" /></td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.budget)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(p.actualSpend)}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('font-medium', spentPct > 90 ? 'text-red-500' : spentPct > 70 ? 'text-amber-600' : 'text-gray-700')}>{spentPct}%</span>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.forecastedCost)}</td>
                    <td className={clsx('px-4 py-3 font-semibold', v < 0 ? 'text-red-500' : 'text-green-600')}>
                      {v < 0 ? '-' : '+'}{formatCurrency(Math.abs(v))}
                    </td>
                    <td className="px-4 py-3 w-28"><ProgressBar value={p.progress} showLabel /></td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', healthColor)}>{health}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-4 py-3 font-semibold text-gray-700" colSpan={2}>Portfolio Total</td>
                <td className="px-4 py-3 font-bold">{formatCurrency(summary.totalBudget)}</td>
                <td className="px-4 py-3 font-bold">{formatCurrency(summary.totalSpent)}</td>
                <td className="px-4 py-3 font-bold">{burnRate}%</td>
                <td className="px-4 py-3 font-bold">{formatCurrency(summary.totalForecast)}</td>
                <td className={clsx('px-4 py-3 font-bold', variance < 0 ? 'text-red-500' : 'text-green-600')}>
                  {variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(variance))}
                </td>
                <td className="px-4 py-3" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
