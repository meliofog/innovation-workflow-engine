import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const IdeasPage = ({ token, user, onEditIdea, onViewIdea, statusFilter, priorityFilter }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManageIdeas =
    user?.groups?.includes('EM') || user?.groups?.includes('camunda-admin');

  const fetchIdeas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getIdeas(token, {
        status: statusFilter,
        priority: priorityFilter,
      });
      setIdeas(data);
    } catch (err) {
      setError('Could not fetch ideas. Your session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, priorityFilter]);

  const handleDelete = (e, ideaId) => {
    e.stopPropagation();
    toast(
      (t) => (
        <div className="flex flex-col items-center gap-4">
          <p className="font-semibold">Delete this idea?</p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              onClick={() => {
                const promise = apiService
                  .deleteIdea(token, ideaId)
                  .then(() => fetchIdeas());
                toast.promise(promise, {
                  loading: 'Deleting idea...',
                  success: 'Idea deleted successfully!',
                  error: 'Failed to delete idea.',
                });
                toast.dismiss(t.id);
              }}
            >
              Delete
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  const handleEdit = (e, idea) => {
    e.stopPropagation();
    onEditIdea(idea);
  };

  const PriorityBadge = ({ value }) => {
    const tone =
      value === 'High'
        ? 'bg-red-100 text-red-800 ring-red-200'
        : value === 'Medium'
        ? 'bg-amber-100 text-amber-800 ring-amber-200'
        : value === 'Low'
        ? 'bg-green-100 text-green-800 ring-green-200'
        : 'bg-gray-100 text-gray-800 ring-gray-200';
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tone}`}
      >
        {value || 'N/A'}
      </span>
    );
  };

  const StatusBadge = ({ value }) => (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-gray-100 text-gray-800 ring-gray-200">
      {value}
    </span>
  );

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {loading &&
        [1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 w-full animate-pulse rounded-lg border border-gray-200 bg-gray-50"
          />
        ))}

      {error && (
        <div className="text-center py-10 text-red-600">{error}</div>
      )}

      {!loading &&
        !error &&
        ideas.length > 0 &&
        ideas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => onViewIdea(idea.id)}
            className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {idea.titre}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  {idea.createdBy && (
                    <span className="inline-flex items-center">
                      <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {idea.createdBy}
                    </span>
                  )}
                  {idea.dateCreation && (
                    <span className="inline-flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      Created on {formatDate(idea.dateCreation)}
                    </span>
                  )}
                </div>
                {idea.description && (
                  <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                    {idea.description}
                  </p>
                )}
              </div>

              {/* Right rail */}
              <div className="flex flex-col items-end gap-2 w-56">
                <div className="flex items-center gap-2">
                  <PriorityBadge value={idea.priority} />
                  <StatusBadge value={idea.statut} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewIdea(idea.id);
                    }}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  {canManageIdeas && (
                    <>
                      <button
                        onClick={(e) => handleEdit(e, idea)}
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, idea.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

      {!loading && !error && ideas.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No ideas found.
        </div>
      )}
    </div>
  );
};
