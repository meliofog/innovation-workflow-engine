import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { TaskModal } from './TaskModal';
import toast from 'react-hot-toast';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export const MyTasksPage = ({ token, user, ideaNameFilter, taskTypeFilter }) => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  const fetchAllTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const allTasks = await apiService.getMyTasks(token, {
        ideaName: ideaNameFilter,
        taskDefinitionKey: taskTypeFilter,
      });
      const assigned = allTasks.filter((t) => t.task.assignee !== null);
      const group = allTasks.filter((t) => t.task.assignee === null);
      setAssignedTasks(assigned);
      setGroupTasks(group);
    } catch (err) {
      setError('Could not fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if (user) fetchAllTasks();
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, ideaNameFilter, taskTypeFilter]);

  const handleClaim = async (taskId) => {
    const promise = apiService.claimTask(token, taskId);
    toast.promise(promise, {
      loading: 'Claiming task...',
      success: () => {
        fetchAllTasks();
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
        fetchAllTasks();
        return 'Task returned to group queue!';
      },
      error: 'Failed to unclaim task.',
    });
  };

  const handleTaskCompleted = () => {
    setSelectedTaskDetail(null);
    fetchAllTasks();
    toast.success('Task completed!');
  };

  const formatDateTime = (d) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return '';
    }
  };

  const SectionHeader = ({ title, count }) => (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <span className="text-xs text-gray-500">Total: <span className="font-medium">{count}</span></span>
    </div>
  );

  const Badge = ({ children }) => (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-200">
      {children}
    </span>
  );

  const SkeletonCard = () => (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-48 rounded bg-gray-200" />
        <div className="h-3 w-80 rounded bg-gray-200" />
        <div className="h-3 w-56 rounded bg-gray-200" />
        <div className="mt-3 h-8 w-36 rounded bg-gray-200" />
      </div>
    </div>
  );

  const TaskCard = ({ detail, actions }) => {
    const ideaTitle = detail.idea?.titre || 'N/A';
    const task = detail.task;

    return (
      <div className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition">
        <div className="flex items-start justify-between gap-4">
          {/* Left: content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-500" />
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {ideaTitle}
              </h3>
            </div>

            <div className="mt-1 text-sm text-gray-700">
              Task: <span className="font-medium">{task.name}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              {task.assignee ? (
                <span className="inline-flex items-center">
                  <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                  Assigned to you
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                  Unassigned (group)
                </span>
              )}
              {task.created && (
                <span className="inline-flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                  Created {formatDateTime(task.created)}
                </span>
              )}
              {/* Optional: show definition key as a badge if filtered */}
              {taskTypeFilter && (
                <Badge>{task.taskDefinitionKey || taskTypeFilter}</Badge>
              )}
            </div>
          </div>

          {/* Right rail: actions */}
          <div className="flex flex-col items-end gap-2">
            {actions}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Assigned Tasks */}
      <section>
        <SectionHeader title="My Assigned Tasks" count={assignedTasks.length} />
        {loading ? (
          <div className="grid gap-3">
            <SkeletonCard /><SkeletonCard />
          </div>
        ) : assignedTasks.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            No assigned tasks.
          </div>
        ) : (
          <div className="grid gap-3">
            {assignedTasks.map((detail) => (
              <TaskCard
                key={detail.task.id}
                detail={detail}
                actions={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUnclaim(detail.task.id)}
                      className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100"
                    >
                      Unclaim
                    </button>
                    <button
                      onClick={() => setSelectedTaskDetail(detail)}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Work on Task
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Group Tasks */}
      <section>
        <SectionHeader title="Available Group Tasks" count={groupTasks.length} />
        {loading ? (
          <div className="grid gap-3">
            <SkeletonCard /><SkeletonCard />
          </div>
        ) : groupTasks.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            No tasks available for your groups.
          </div>
        ) : (
          <div className="grid gap-3">
            {groupTasks.map((detail) => (
              <TaskCard
                key={detail.task.id}
                detail={detail}
                actions={
                  <button
                    onClick={() => handleClaim(detail.task.id)}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Claim
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>

      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}

      {selectedTaskDetail && (
        <TaskModal
          details={selectedTaskDetail}
          token={token}
          onClose={() => setSelectedTaskDetail(null)}
          onTaskCompleted={handleTaskCompleted}
        />
      )}
    </div>
  );
};
