import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { TaskModal } from './TaskModal';
import toast from 'react-hot-toast';


export const MyTasksPage = ({ token, user }) => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchAllTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const allTasks = await apiService.getMyTasks(token);
      
      // Filter the tasks into two lists
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

  useEffect(() => {
    if (user) {
      fetchAllTasks();
    }
  }, [token, user]);

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
                    <p className="text-md font-medium text-indigo-600 truncate">{taskDetail.task.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Related Idea: <span className="font-medium">{taskDetail.idea?.titre || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Created: {new Date(taskDetail.task.created).toLocaleString()}</p>
                  </div>
                  {/* --- THIS SECTION IS UPDATED --- */}
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleUnclaim(taskDetail.task.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-red-100 rounded-md hover:bg-gray-200">
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
                    <p className="text-md font-medium text-indigo-600 truncate">{taskDetail.task.name}</p>
                    {/* --- THIS IS THE FIX --- */}
                    <p className="text-sm text-gray-500 mt-1">
                      Related Idea: <span className="font-medium">{taskDetail.idea?.titre || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Created: {new Date(taskDetail.task.created).toLocaleString()}</p>
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