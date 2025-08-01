import React, { useState } from 'react';
import { IdeasPage } from './IdeasPage';
import { MyTasksPage } from './MyTasksPage';
import { NewIdeaModal } from './NewIdeaModal';

export const AppLayout = ({ token, user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('ideas');
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const isEmetteur = user?.groups?.includes('EM');
  const [ideasKey, setIdeasKey] = useState(0);

  const handleIdeaSubmitted = () => {
    setShowNewIdeaModal(false);
    setIdeasKey(prevKey => prevKey + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-indigo-600">Innovation Workflow</h1>
              <div className="flex space-x-4">
                  <button onClick={() => setCurrentPage('ideas')} className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === 'ideas' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>Ideas Dashboard</button>
                  <button onClick={() => setCurrentPage('tasks')} className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === 'tasks' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>Tasks</button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-600">Welcome, {user.username}!</span>
              <button onClick={onLogout} className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentPage === 'ideas' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Submitted Ideas</h2>
                {isEmetteur && (
                  <button onClick={() => setShowNewIdeaModal(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    + Submit New Idea
                  </button>
                )}
              </div>
              <IdeasPage key={ideasKey} token={token} />
            </div>
          )}
          {currentPage === 'tasks' && <MyTasksPage token={token} user={user} />}
        </div>
      </main>
      
      {showNewIdeaModal && (
        <NewIdeaModal token={token} onClose={() => setShowNewIdeaModal(false)} onIdeaSubmitted={handleIdeaSubmitted} />
      )}
    </div>
  );
};
