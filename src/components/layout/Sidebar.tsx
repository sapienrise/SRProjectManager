import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, TrendingUp, Users, Settings } from 'lucide-react';
import clsx from 'clsx';
import logo from '../../assets/sapienrise.png';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/action-items', label: 'Action Items', icon: CheckSquare },
  { to: '/forecast', label: 'Forecast', icon: TrendingUp },
  { to: '/team', label: 'Team', icon: Users },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-slate-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <img src={logo} alt="Sapien Rise" className="w-full h-auto rounded-lg bg-white p-2" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 py-4 border-t border-slate-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )
          }
        >
          <Settings size={17} />
          Settings
        </NavLink>
        <div className="mt-4 px-3">
          <p className="text-slate-600 text-xs">v1.0.0 &bull; Internal Tool</p>
        </div>
      </div>
    </aside>
  );
}
