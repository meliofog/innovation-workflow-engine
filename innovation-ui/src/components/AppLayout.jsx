import React, { useState } from 'react';
import { IdeasPage } from './IdeasPage';
import { MyTasksPage } from './MyTasksPage';
import { IdeaModal } from './IdeaModal';
import { DashboardPage } from './DashboardPage';
import { IdeaDetailsModal } from './IdeaDetailsModal';
import { UserManagementPage } from './UserManagementPage';

export const AppLayout = ({ token, user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState(null);
  const [viewingIdeaId, setViewingIdeaId] = useState(null);
  const [ideasKey, setIdeasKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [taskIdeaNameFilter, setTaskIdeaNameFilter] = useState('');

  const isEmetteur = user?.groups?.includes('EM');
  const isAdmin = user?.groups?.includes('camunda-admin');

  const handleSaveIdea = () => {
    setShowIdeaModal(false);
    setIdeaToEdit(null);
    setIdeasKey(prevKey => prevKey + 1);
  };

  const handleOpenNewIdeaModal = () => {
    setIdeaToEdit(null);
    setShowIdeaModal(true);
  };
  
  const handleOpenEditIdeaModal = (idea) => {
    setIdeaToEdit(idea);
    setShowIdeaModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-indigo-600">Innovation Workflow</h1>
              <div className="flex space-x-4">
                  <button onClick={() => setCurrentPage('dashboard')} className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>Dashboard</button>
                  <button onClick={() => setCurrentPage('ideas')} className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === 'ideas' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>Ideas</button>
                  <button onClick={() => setCurrentPage('tasks')} className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === 'tasks' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>Tasks</button>
                  {isAdmin && (
                    <button onClick={() => setCurrentPage('users')} className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === 'users' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>Users</button>
                  )}
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
          <div className="flex justify-between items-center mb-6">
            <div>
              {currentPage === 'dashboard' && <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>}
              {currentPage === 'ideas' && <h2 className="text-2xl font-semibold text-gray-900">Submitted Ideas</h2>}
              {currentPage === 'tasks' && <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>}
              {currentPage === 'users' && <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>}
            </div>
            
            {currentPage === 'ideas' && (
              <div className="flex items-center space-x-4">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                  <option value="">All Statuses</option>
                  <option>EN_ATTENTE_PREQUALIFICATION</option>
                  <option>EN_COURS_DE_QUALIFICATION</option>
                  <option>POC_EN_COURS</option>
                  <option>EN_DEVELOPPEMENT</option>
                  <option>REALISEE</option>
                  <option>REJETEE</option>
                  <option>ARCHIVEE</option>
                </select>
                 <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                  <option value="">All Priorities</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                {/* --- THIS IS THE FIX --- */}
                {/* Show the button if the user is an Emetteur OR an Admin */}
                {(isEmetteur || isAdmin) && (
                  <button onClick={handleOpenNewIdeaModal} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                    + Submit New Idea
                  </button>
                )}
              </div>
            )}

            {currentPage === 'tasks' && (
               <input
                  type="text"
                  value={taskIdeaNameFilter}
                  onChange={(e) => setTaskIdeaNameFilter(e.target.value)}
                  className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="Search by Idea Name..."
                />
            )}
          </div>

          {currentPage === 'dashboard' && <DashboardPage token={token} user={user} onNavigate={setCurrentPage} />}
          {currentPage === 'ideas' && 
            <IdeasPage 
              key={ideasKey} 
              token={token} 
              user={user} 
              onEditIdea={handleOpenEditIdeaModal}
              onViewIdea={setViewingIdeaId}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
            />
          }
          {currentPage === 'tasks' && <MyTasksPage token={token} user={user} ideaNameFilter={taskIdeaNameFilter} />}
          {currentPage === 'users' && isAdmin && <UserManagementPage token={token} />}
        </div>
      </main>
      
      {showIdeaModal && (
        <IdeaModal 
          token={token}
          ideaToEdit={ideaToEdit}
          onClose={() => { setShowIdeaModal(false); setIdeaToEdit(null); }} 
          onSave={handleSaveIdea} 
        />
      )}

      {viewingIdeaId && (
        <IdeaDetailsModal
          token={token}
          ideaId={viewingIdeaId}
          onClose={() => setViewingIdeaId(null)}
        />
      )}
    </div>
  );
};