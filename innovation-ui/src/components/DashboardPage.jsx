import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { PriorityChart } from './PriorityChart'; // <-- Import the new chart component

// A reusable card component for displaying stats
const StatCard = ({ title, value, isLoading }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
    {isLoading ? (
      <div className="mt-1 h-8 bg-gray-200 rounded animate-pulse"></div>
    ) : (
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    )}
  </div>
);

export const DashboardPage = ({ token, user, onNavigate }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getDashboardStats(token);
        setStats(data);
      } catch (err) {
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <div className="space-y-8">
      <div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Submitted Ideas" value={stats.totalIdeas} isLoading={loading} />
          <StatCard title="Ideas Currently In Progress" value={stats.ideasInProgress} isLoading={loading} />
          <StatCard title="Ideas Successfully Realized" value={stats.ideasRealisee} isLoading={loading} />
          <StatCard title="Postponed (Ajournée) Ideas" value={stats.ideasAjournee} isLoading={loading} />
        </div>
      </div>

      {/* NEW SECTION for Charts and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          {/* We will add more charts or lists here later */}
           <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
           <div className="flex space-x-4">
              <button
                  onClick={() => onNavigate('ideas')}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                  View All Ideas
              </button>
              <button
                  onClick={() => onNavigate('tasks')}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                  Go to My Tasks
              </button>
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* The new chart component is rendered here */}
          <PriorityChart stats={stats.priorityStats} isLoading={loading} />
        </div>
      </div>
    </div>
  );
};