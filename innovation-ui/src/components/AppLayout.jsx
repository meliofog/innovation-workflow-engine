import React, { useState } from 'react';
import { IdeasPage } from './IdeasPage';
import { MyTasksPage } from './MyTasksPage';
import { IdeaModal } from './IdeaModal';
import { DashboardPage } from './DashboardPage';
import { IdeaDetailsModal } from './IdeaDetailsModal';
import { UserManagementPage } from './UserManagementPage';
import {
  Squares2X2Icon,
  LightBulbIcon,
  CheckCircleIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon, // refresh
} from '@heroicons/react/24/outline';

export const AppLayout = ({ token, user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState(null);
  const [viewingIdeaId, setViewingIdeaId] = useState(null);

  const [ideasKey, setIdeasKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [taskIdeaNameFilter, setTaskIdeaNameFilter] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState('');

  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [userCreateTick, setUserCreateTick] = useState(0); // drives opening create-user modal

  const isEmetteur = user?.groups?.includes('EM');
  const isCQ = user?.groups?.includes('CQ');
  const isCSI = user?.groups?.includes('CSI');
  const isDEV = user?.groups?.includes('DEV');
  const isAdmin = user?.groups?.includes('camunda-admin');

  const handleSaveIdea = () => {
    setShowIdeaModal(false);
    setIdeaToEdit(null);
    setIdeasKey((prev) => prev + 1);
  };

  const handleOpenNewIdeaModal = () => {
    setIdeaToEdit(null);
    setShowIdeaModal(true);
  };

  const handleOpenEditIdeaModal = (idea) => {
    setIdeaToEdit(idea);
    setShowIdeaModal(true);
  };

  const NavButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setCurrentPage(id)}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition
        ${currentPage === id
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  const RolePill = ({ children }) => (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
      {children}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <LightBulbIcon className="h-6 w-6 text-indigo-600" />
                <h1 className="text-lg sm:text-xl font-extrabold text-indigo-600 tracking-tight">
                  Innovation Workflow
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <NavButton id="dashboard" label="Dashboard" icon={Squares2X2Icon} />
                <NavButton id="ideas" label="Ideas" icon={LightBulbIcon} />
                <NavButton id="tasks" label="Tasks" icon={CheckCircleIcon} />
                {isAdmin && <NavButton id="users" label="Users" icon={UsersIcon} />}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {isEmetteur && <RolePill>EM</RolePill>}
                {isAdmin && <RolePill>Admin</RolePill>}
                {isCQ && <RolePill>CQ</RolePill>}
                {isCSI && <RolePill>CSI</RolePill>}
                {isDEV && <RolePill>DEV</RolePill>}
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user.username}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile nav row */}
          <div className="sm:hidden pb-3 flex items-center gap-2">
            <NavButton id="dashboard" label="Dashboard" icon={Squares2X2Icon} />
            <NavButton id="ideas" label="Ideas" icon={LightBulbIcon} />
            <NavButton id="tasks" label="Tasks" icon={CheckCircleIcon} />
            {isAdmin && <NavButton id="users" label="Users" icon={UsersIcon} />}
          </div>
        </div>
      </nav>

      <main className="py-8 sm:py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header + toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              {currentPage === 'dashboard' && (
                <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
              )}
              {currentPage === 'ideas' && (
                <h2 className="text-2xl font-semibold text-gray-900">Submitted Ideas</h2>
              )}
              {currentPage === 'tasks' && (
                <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
              )}
              {currentPage === 'users' && (
                <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
              )}
            </div>

            {/* Dashboard toolbar */}
            {currentPage === 'dashboard' && (
              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDashboardRefreshKey((k) => k + 1)}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            )}

            {/* Ideas toolbar */}
            {currentPage === 'ideas' && (
              <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full sm:w-56 pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option>EN_ATTENTE_PREQUALIFICATION</option>
                  <option>EN_COURS_DE_QUALIFICATION</option>
                  <option>POC_EN_COURS</option>
                  <option>EN_DEVELOPPEMENT</option>
                  <option>REALISEE</option>
                  <option>REJETEE</option>
                  <option>ARCHIVEE</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="block w-full sm:w-40 pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md"
                >
                  <option value="">All Priorities</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                {(isEmetteur || isAdmin) && (
                  <button
                    onClick={handleOpenNewIdeaModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap"
                  >
                    + Submit New Idea
                  </button>
                )}
              </div>
            )}

            {/* Tasks toolbar */}
            {currentPage === 'tasks' && (
              <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
                <select
                  value={taskTypeFilter}
                  onChange={(e) => setTaskTypeFilter(e.target.value)}
                  className="block w-full sm:w-64 pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md"
                >
                  <option value="">All Task Types</option>
                  <option value="Activity_10rvc7h">Priorisation / Filtrage</option>
                  <option value="Activity_0tg41vr">Qualifier l'idée</option>
                  <option value="Activity_1oplie6">Saisir conclusion POC</option>
                  <option value="Activity_1cgibts">Constitution de l'équipe</option>
                  <option value="Activity_1npl4tr">Travailler sur le business model</option>
                  <option value="Activity_0a8a9ls">Présentation MVP</option>
                  <option value="Activity_0ajhb6g">Traiter les idées ajournées</option>
                  <option value="Activity_0bqn3dl">Elaboration Business plan</option>
                </select>

                <input
                  type="text"
                  value={taskIdeaNameFilter}
                  onChange={(e) => setTaskIdeaNameFilter(e.target.value)}
                  className="block w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm"
                  placeholder="Search by Idea Name..."
                />
              </div>
            )}

            {/* Users toolbar — header owns the Create button */}
            {currentPage === 'users' && (
              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  onClick={() => setUserCreateTick((t) => t + 1)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap"
                >
                  + Add New User
                </button>
              </div>
            )}
          </div>

          {/* Pages */}
          {currentPage === 'dashboard' && (
            <DashboardPage
              token={token}
              user={user}
              onNavigate={setCurrentPage}
              refreshKey={dashboardRefreshKey}
            />
          )}

          {currentPage === 'ideas' && (
            <IdeasPage
              key={ideasKey}
              token={token}
              user={user}
              onEditIdea={handleOpenEditIdeaModal}
              onViewIdea={setViewingIdeaId}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
            />
          )}

          {currentPage === 'tasks' && (
            <MyTasksPage
              token={token}
              user={user}
              ideaNameFilter={taskIdeaNameFilter}
              taskTypeFilter={taskTypeFilter}
            />
          )}

          {currentPage === 'users' && isAdmin && (
            <UserManagementPage token={token} createTick={userCreateTick} />
          )}
        </div>
      </main>

      {/* Footer (sticky) */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Innovation Workflow</span>
          <span className="hidden sm:inline">Built with Spring Boot & React</span>
        </div>
      </footer>

      {/* Modals */}
      {showIdeaModal && (
        <IdeaModal
          token={token}
          ideaToEdit={ideaToEdit}
          onClose={() => {
            setShowIdeaModal(false);
            setIdeaToEdit(null);
          }}
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
