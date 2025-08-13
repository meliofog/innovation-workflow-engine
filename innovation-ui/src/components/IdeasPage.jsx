import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const IdeasPage = ({ token, user, onEditIdea, onViewIdea, statusFilter, priorityFilter }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- THIS IS THE FIX ---
  // A user can manage ideas if they are an Emetteur OR an Admin.
  const canManageIdeas = user?.groups?.includes('EM') || user?.groups?.includes('camunda-admin');

  const fetchIdeas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getIdeas(token, { status: statusFilter, priority: priorityFilter });
      setIdeas(data);
    } catch (err) {
      setError('Could not fetch ideas. Your session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [token, statusFilter, priorityFilter]);
  
  const handleDelete = (e, ideaId) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col items-center gap-4">
        <p className="font-semibold">Are you sure you want to delete this idea?</p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            onClick={() => {
              const promise = apiService.deleteIdea(token, ideaId).then(() => fetchIdeas());
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
    ), { duration: 6000 });
  };

  const handleEdit = (e, idea) => {
    e.stopPropagation();
    onEditIdea(idea);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {loading && <li className="px-4 py-4 text-center text-gray-500">Loading ideas...</li>}
        {error && <li className="px-4 py-4 text-center text-red-600">{error}</li>}
        {!loading && !error && ideas.length > 0 && ideas.map((idea) => (
          <li 
            key={idea.id}
            onClick={() => onViewIdea(idea.id)}
            className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="text-md font-medium text-indigo-600 truncate">{idea.titre}</p>
              <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(idea.priority)}`}>
                  {idea.priority || 'N/A'}
                </p>
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  {idea.statut}
                </p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <p className="flex items-center text-sm text-gray-500">{idea.description}</p>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <div className="flex items-center space-x-4 ml-auto">
                    <button onClick={() => onViewIdea(idea.id)} className="text-gray-400 hover:text-blue-600" title="View Details">
                        <EyeIcon className="h-5 w-5" />
                    </button>
                    {/* We now use the new `canManageIdeas` variable here */}
                    {canManageIdeas && (
                        <>
                            <button onClick={(e) => handleEdit(e, idea)} className="text-gray-400 hover:text-indigo-600" title="Edit Idea">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button onClick={(e) => handleDelete(e, idea.id)} className="text-gray-400 hover:text-red-600" title="Delete Idea">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>
              </div>
            </div>
          </li>
        ))}
        {!loading && !error && ideas.length === 0 && (
           <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No ideas found.</li>
        )}
      </ul>
    </div>
  );
};