import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { ActionItems } from './pages/ActionItems';
import { Forecast } from './pages/Forecast';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { useStore } from './store';

function AppLoader() {
  const { initialize, loading, error } = useStore();

  useEffect(() => {
    initialize();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-sm border border-red-100">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Cannot connect to server</h2>
          <p className="text-sm text-gray-500 mb-1">Make sure the backend is running:</p>
          <code className="block bg-gray-100 text-gray-700 text-xs px-4 py-2 rounded-lg mt-2 mb-4">
            cd server && npm run dev
          </code>
          <p className="text-xs text-red-400">{error}</p>
          <button
            className="mt-4 btn-primary"
            onClick={() => initialize()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="action-items" element={<ActionItems />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLoader />
    </BrowserRouter>
  );
}
