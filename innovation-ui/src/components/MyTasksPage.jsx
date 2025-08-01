import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { TaskModal } from './TaskModal'; // We will use the modal for assigned tasks

export const MyTasksPage = ({ token, user }) => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // This function now fetches all tasks and separates them client-side
  const fetchAllTasks = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Call the single, unified endpoint
      const allTasks = await apiService.getMyTasks(token);

      // 2. Filter the tasks into two lists based on whether they have an assignee
      const assigned = allTasks.filter(task => task.assignee !== null);
      const group = allTasks.filter(task => task.assignee === null);
      
      setAssignedTasks(assigned);
      setGroupTasks(group);
      
    } catch (err) {
      setError('Could not fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllTasks();
    }
  }, [token, user]);

  const handleClaim = async (taskId) => {
    try {
      await apiService.claimTask(token, taskId);
      fetchAllTasks(); // Refresh both lists after claiming
    } catch (err) {
      alert("Failed to claim task.");
    }
  };
  
  const handleTaskCompleted = () => {
      setSelectedTask(null); // Close the modal
      fetchAllTasks(); // Refresh the task lists
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Assigned Tasks</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {loading && <li className="px-4 py-4 text-center text-gray-500">Loading...</li>}
            {!loading && assignedTasks.length === 0 && <li className="px-4 py-4 text-center text-gray-500">You have no assigned tasks.</li>}
            {assignedTasks.map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <p className="text-md font-medium text-indigo-600 truncate">{task.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Created: {new Date(task.created).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelectedTask(task)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                    Work on Task
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Group Tasks</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {loading && <li className="px-4 py-4 text-center text-gray-500">Loading...</li>}
            {!loading && groupTasks.length === 0 && <li className="px-4 py-4 text-center text-gray-500">No tasks available for your groups.</li>}
            {groupTasks.map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <p className="text-md font-medium text-indigo-600 truncate">{task.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Created: {new Date(task.created).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleClaim(task.id)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Claim
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
      
      {selectedTask && (
          <TaskModal 
              task={selectedTask} 
              token={token} 
              onClose={() => setSelectedTask(null)} 
              onTaskCompleted={handleTaskCompleted} 
          />
      )}
    </div>
  );
};