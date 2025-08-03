import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'; // EyeIcon is added

export const IdeasPage = ({ token, user, onEditIdea, onViewIdea }) => { // onViewIdea prop is added
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isEmetteur = user?.groups?.includes('EM');

  const fetchIdeas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getIdeas(token);
      setIdeas(data);
    } catch (err) {
      setError('Could not fetch ideas. Your session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [token]);
  
  const handleDelete = async (ideaId) => {
    if (window.confirm("Are you sure you want to delete this idea?")) {
      try {
        await apiService.deleteIdea(token, ideaId);
        fetchIdeas(); // Refresh the list
      } catch (err) {
        alert("Failed to delete idea.");
      }
    }
  };

  // Helper to determine priority color
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {loading && <li className="px-4 py-4 text-center text-gray-500">Loading ideas...</li>}
        {error && <li className="px-4 py-4 text-center text-red-600">{error}</li>}
        {!loading && !error && ideas.length > 0 && ideas.map((idea) => (
          <li key={idea.id}>
            <div className="px-4 py-4 sm:px-6">
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
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {idea.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <div className="flex items-center space-x-4 ml-auto">
                      {/* NEW VIEW BUTTON (Visible to all roles) */}
                      <button onClick={() => onViewIdea(idea.id)} className="text-gray-400 hover:text-blue-600" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Emetteur-specific buttons */}
                      {isEmetteur && (
                          <>
                              <button onClick={() => onEditIdea(idea)} className="text-gray-400 hover:text-indigo-600" title="Edit Idea">
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleDelete(idea.id)} className="text-gray-400 hover:text-red-600" title="Delete Idea">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                          </>
                      )}
                  </div>
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