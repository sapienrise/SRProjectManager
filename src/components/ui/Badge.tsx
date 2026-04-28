import clsx from 'clsx';

interface BadgeProps {
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, className, size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {label}
    </span>
  );
}
