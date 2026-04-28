import clsx from 'clsx';
import { getInitials, getAvatarColor } from '../../utils/format';

interface AvatarProps {
  name: string;
  id: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

export function Avatar({ name, id, size = 'md', showTooltip = false }: AvatarProps) {
  return (
    <div
      className={clsx(
        'relative group rounded-full flex items-center justify-center text-white font-semibold shrink-0',
        sizeClasses[size],
        getAvatarColor(id)
      )}
      title={showTooltip ? name : undefined}
    >
      {getInitials(name)}
      {showTooltip && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {name}
        </div>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  memberIds: string[];
  members: Array<{ id: string; name: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ memberIds, members, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = memberIds.slice(0, max);
  const extra = memberIds.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((id) => {
        const m = members.find((x) => x.id === id);
        if (!m) return null;
        return (
          <div key={id} className="ring-2 ring-white rounded-full">
            <Avatar name={m.name} id={id} size={size} showTooltip />
          </div>
        );
      })}
      {extra > 0 && (
        <div
          className={clsx(
            'ring-2 ring-white rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium',
            sizeClasses[size]
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
