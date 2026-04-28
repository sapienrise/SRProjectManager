import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: string; up?: boolean };
}

export function StatsCard({ label, value, sub, icon, iconBg = 'bg-blue-50 text-blue-600', trend }: StatsCardProps) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={clsx('p-3 rounded-xl', iconBg)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {trend && (
          <p className={clsx('text-xs font-medium mt-1', trend.up ? 'text-green-600' : 'text-red-500')}>
            {trend.up ? '+' : ''}{trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
