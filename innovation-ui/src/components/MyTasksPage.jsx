import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { TaskModal } from './TaskModal';
import toast from 'react-hot-toast';

// The component now receives ideaNameFilter as a prop
export const MyTasksPage = ({ token, user, ideaNameFilter }) => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  
  // The local ideaNameFilter state has been removed.

  const fetchAllTasks = async () => {
    setLoading(true);
    setError('');
    try {
      // The filter value now comes directly from props
      const allTasks = await apiService.getMyTasks(token, ideaNameFilter);

      const assigned = allTasks.filter(taskDetail => taskDetail.task.assignee !== null);
      const group = allTasks.filter(taskDetail => taskDetail.task.assignee === null);
      
      setAssignedTasks(assigned);
      setGroupTasks(group);
      
    } catch (err) {
      setError('Could not fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  // The useEffect hook now correctly depends on the ideaNameFilter prop
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (user) {
        fetchAllTasks();
      }
    }, 500); // 500ms delay to avoid excessive API calls while typing

    return () => clearTimeout(delayDebounceFn);
  }, [token, user, ideaNameFilter]);

  const handleClaim = async (taskId) => {
    const promise = apiService.claimTask(token, taskId);
    toast.promise(promise, {
      loading: 'Claiming task...',
      success: () => {
        fetchAllTasks(); // Refresh list on success
        return 'Task claimed successfully!';
      },
      error: 'Failed to claim task.',
    });
  };
  
  const handleUnclaim = async (taskId) => {
    const promise = apiService.unclaimTask(token, taskId);
    toast.promise(promise, {
      loading: 'Unclaiming task...',
      success: () => {
        fetchAllTasks(); // Refresh both lists on success
        return 'Task returned to group queue!';
      },
      error: 'Failed to unclaim task.',
    });
  };

  const handleTaskCompleted = () => {
    setSelectedTask(null);
    fetchAllTasks();
    toast.success('Task completed!');
  };

  // The JSX for rendering the component no longer includes the search bar,
  // as it has been moved to the AppLayout component.
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Assigned Tasks</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {loading && <li className="px-4 py-4 text-center text-gray-500">Loading...</li>}
            {!loading && assignedTasks.length === 0 && <li className="px-4 py-4 text-center text-gray-500">You have no assigned tasks.</li>}
            {assignedTasks.map((taskDetail) => (
              <li key={taskDetail.task.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <p className="text-md font-medium text-indigo-600 truncate">Idea: {taskDetail.idea?.titre || 'N/A'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Task: <span className="font-medium">{taskDetail.task.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleUnclaim(taskDetail.task.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-red-100 rounded-md hover:bg-red-200">
                      Unclaim
                    </button>
                    <button onClick={() => setSelectedTask(taskDetail.task)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                      Work on Task
                    </button>
                  </div>
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
            {groupTasks.map((taskDetail) => (
              <li key={taskDetail.task.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <p className="text-md font-medium text-indigo-600 truncate">Idea: {taskDetail.idea?.titre || 'N/A'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Task: <span className="font-medium">{taskDetail.task.name}</span>
                    </p>
                  </div>
                  <button onClick={() => handleClaim(taskDetail.task.id)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
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