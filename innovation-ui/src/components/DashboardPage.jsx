import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { PriorityChart } from './PriorityChart';
import {
  LightBulbIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const StatCard = ({ title, value, icon: Icon, tone = 'indigo', isLoading }) => {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    green: 'bg-green-50 text-green-600 ring-green-100',
    sky: 'bg-sky-50 text-sky-600 ring-sky-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">{title}</h3>
        <span className={`inline-flex items-center justify-center rounded-full p-1.5 text-sm ring-1 ${tones[tone]}`}>
          {Icon ? <Icon className="h-4 w-4" /> : <LightBulbIcon className="h-4 w-4" />}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-2 h-7 w-16" />
      ) : (
        <p className="mt-2 text-2xl font-semibold text-gray-900">{value ?? 0}</p>
      )}
    </div>
  );
};

export const DashboardPage = ({ token, user, onNavigate, refreshKey }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await apiService.getDashboardStats(token);
        if (alive) setStats(data || {});
      } catch {
        if (alive) setError('Could not load dashboard data.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token, refreshKey]); // 👈 re-run fetch when AppLayout bumps the key

  return (
    <div className="space-y-6">
      {/* Compact welcome line only; the H2 title is now in AppLayout */}
      <p className="text-sm text-gray-600">
        Welcome{user?.username ? `, ${user.username}` : ''}! Here’s a snapshot of the innovation pipeline.
      </p>

      {/* Error, compact */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-sm text-red-700 flex items-start gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Stats row with tighter gaps */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Submitted Ideas" value={stats.totalIdeas} isLoading={loading} icon={LightBulbIcon} tone="indigo" />
        <StatCard title="Ideas In Progress" value={stats.ideasInProgress} isLoading={loading} icon={Cog6ToothIcon} tone="sky" />
        <StatCard title="Successfully Realized" value={stats.ideasRealisee} isLoading={loading} icon={CheckCircleIcon} tone="green" />
        <StatCard title="Postponed (Ajournée)" value={stats.ideasAjournee} isLoading={loading} icon={ClockIcon} tone="amber" />
      </div>

      {/* Content area: balanced columns, reduced padding */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-100 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <p className="text-sm text-gray-600">Jump straight into what matters.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate('ideas')}
                className="inline-flex items-center justify-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
              >
                View All Ideas
              </button>
              <button
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Go to My Tasks
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-100 p-5">
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Snapshot</h3>
            {loading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3.5 w-1/3" />
              </div>
            ) : (
              <ul className="mt-3 text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Total ideas: <span className="font-medium">{stats.totalIdeas ?? 0}</span></li>
                <li>In progress: <span className="font-medium">{stats.ideasInProgress ?? 0}</span></li>
                <li>Realized: <span className="font-medium">{stats.ideasRealisee ?? 0}</span></li>
                <li>Postponed: <span className="font-medium">{stats.ideasAjournee ?? 0}</span></li>
              </ul>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900">Ideas by Priority</h3>
          <div className="mt-3">
            <PriorityChart stats={stats.priorityStats} isLoading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};
