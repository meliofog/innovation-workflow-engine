import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';

export const IdeasPage = ({ token }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchIdeas();
  }, [token]);

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
                <div className="ml-2 flex-shrink-0 flex">
                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    idea.statut.includes('REJETEE') || idea.statut.includes('ARCHIVEE') ? 'bg-red-100 text-red-800' :
                    idea.statut.includes('VALIDEE') || idea.statut.includes('REALISEE') ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
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
                  <p>Priority: {idea.priority || 'N/A'}</p>
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