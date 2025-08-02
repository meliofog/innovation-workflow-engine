import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// We need to register the components Chart.js will use
ChartJS.register(ArcElement, Tooltip, Legend);

export const PriorityChart = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg animate-pulse">
        <p className="text-gray-500">Loading Chart...</p>
      </div>
    );
  }

  const data = {
    labels: ['High', 'Medium', 'Low', 'Unassigned'],
    datasets: [
      {
        label: '# of Ideas',
        data: [
          stats?.high || 0,
          stats?.medium || 0,
          stats?.low || 0,
          stats?.unassigned || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',  // Red for High
          'rgba(245, 158, 11, 0.8)', // Amber for Medium
          'rgba(34, 197, 94, 0.8)', // Green for Low
          'rgba(156, 163, 175, 0.8)',// Gray for Unassigned
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Idea Priority Distribution',
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};