import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md';
  color?: 'blue' | 'green' | 'amber' | 'red';
  showLabel?: boolean;
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const getColor = (value: number) => {
  if (value >= 100) return 'green';
  if (value >= 70) return 'blue';
  if (value >= 40) return 'amber';
  return 'red';
};

export function ProgressBar({ value, size = 'sm', color, showLabel = false }: ProgressBarProps) {
  const c = color ?? getColor(value);
  return (
    <div className="flex items-center gap-2">
      <div className={clsx('flex-1 bg-gray-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500', colorMap[c])}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-gray-500 w-8 text-right">{value}%</span>}
    </div>
  );
}
