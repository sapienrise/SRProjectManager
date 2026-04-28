import { useState } from 'react';
import { useStore } from '../store';
import { AlertTriangle, RefreshCw, Database, Server, CheckCircle } from 'lucide-react';

export function Settings() {
  const { projects, actionItems, teamMembers, forecasts, resetToSampleData, loading } = useStore();
  const [confirmed, setConfirmed] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    if (!confirmed) { setConfirmed(true); return; }
    await resetToSampleData();
    setConfirmed(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Application configuration and data management</p>
      </div>

      {/* Architecture Info */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Server size={18} /> Architecture
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Frontend', value: 'React + TypeScript + Vite' },
            { label: 'Styling', value: 'Tailwind CSS + Recharts' },
            { label: 'State', value: 'Zustand (API-synced)' },
            { label: 'Backend', value: 'Node.js + Express' },
            { label: 'ORM', value: 'Prisma' },
            { label: 'Database', value: 'PostgreSQL' },
          ].map((row) => (
            <div key={row.label} className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-400 font-medium">{row.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Stats */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Database size={18} /> Database Stats
        </h2>
        <div className="space-y-2 divide-y divide-gray-50">
          {[
            { label: 'Projects', value: projects.length, table: 'projects' },
            { label: 'Action Items', value: actionItems.length, table: 'action_items' },
            { label: 'Team Members', value: teamMembers.length, table: 'team_members' },
            { label: 'Forecast Entries', value: forecasts.length, table: 'monthly_forecasts' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm text-gray-700 font-medium">{row.label}</span>
                <span className="text-xs text-gray-400 ml-2">· {row.table}</span>
              </div>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-0.5 rounded-full">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <RefreshCw size={18} /> Data Management
        </h2>

        <div className="border border-red-200 rounded-xl p-4 bg-red-50 space-y-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={16} />
            <p className="text-sm font-semibold">Reset to Sample Data</p>
          </div>
          <p className="text-sm text-red-600">
            Wipes all current database records and reloads the sample dataset. Cannot be undone.
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} disabled={loading} className={confirmed ? 'btn-danger' : 'btn-secondary'}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Resetting...' : confirmed ? 'Confirm — wipe and reseed' : 'Reset All Data'}
            </button>
            {confirmed && !loading && (
              <button className="btn-secondary" onClick={() => setConfirmed(false)}>Cancel</button>
            )}
            {resetDone && (
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <CheckCircle size={14} /> Done!
              </span>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">Prisma Studio</p>
          <p className="text-sm text-blue-600">Browse the database visually with:</p>
          <code className="block bg-white text-blue-700 text-xs px-3 py-2 rounded-lg mt-2 border border-blue-100">
            cd server && npx prisma studio
          </code>
        </div>
      </div>
    </div>
  );
}
