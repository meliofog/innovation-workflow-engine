import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import toast from 'react-hot-toast';
import {
  PencilSquareIcon,
  TrashIcon,
  EnvelopeIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

/* ===========================
   User Edit/Create Modal
   =========================== */
const UserModal = ({ user, allGroups, token, onClose, onSave }) => {
  const isEditing = !!user;
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setFormData({
        id: user.id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '', // never prefill
      });
      (async () => {
        try {
          const userGroups = await apiService.getUserGroups(token, user.id);
          setSelectedGroups(userGroups.map((g) => g.id));
        } catch (err) {
          console.error('Failed to fetch user groups:', err);
        }
      })();
    } else {
      setFormData({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });
      setSelectedGroups([]);
    }
  }, [isEditing, token, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const run = async () => {
      if (isEditing) {
        await apiService.updateUser(token, user.id, formData);
        await apiService.updateUserGroups(token, user.id, selectedGroups);
      } else {
        const newUser = await apiService.createUser(token, formData);
        await apiService.updateUserGroups(token, newUser.id, selectedGroups);
      }
    };

    toast.promise(run(), {
      loading: isEditing ? 'Updating user...' : 'Creating user...',
      success: () => {
        onSave();
        return isEditing ? 'User updated successfully!' : 'User created successfully!';
      },
      error: isEditing ? 'Failed to update user.' : 'Failed to create user.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>
          <p className="text-xs text-gray-500">Manage profile and group memberships</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="id">
                User ID
              </label>
              <div className="mt-1">
                <input
                  id="id"
                  name="id"
                  type="text"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  disabled={isEditing}
                  className="w-full rounded-md border-gray-300 bg-white disabled:bg-gray-100 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="unique-id"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <KeyIcon className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                  className="w-full rounded-md border-gray-300 pl-10 pr-10 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={isEditing ? 'Leave blank to keep current' : 'Set a password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="firstName">
                First Name
              </label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="John"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="lastName">
                Last Name
              </label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email (full width) */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <EnvelopeIcon className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="user@example.com"
                />
              </div>
            </div>
          </div>

          {/* Groups */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Groups</label>
            <div className="mt-2 border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
              {allGroups.map((group) => (
                <label
                  key={group.id}
                  htmlFor={`group-${group.id}`}
                  className="flex items-center justify-between rounded p-1 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <input
                      id={`group-${group.id}`}
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                      className="h-4 w-4 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {group.name} <span className="text-gray-400">({group.id})</span>
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ===========================
   Main User Management Page
   =========================== */
export const UserManagementPage = ({ token, createTick = 0 }) => {
  const [users, setUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, groupsData] = await Promise.all([
        apiService.getAllUsersForAdmin(token),
        apiService.getAllGroups(token),
      ]);
      setUsers(usersData);
      setAllGroups(groupsData);
    } catch (err) {
      setError('Could not fetch user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  // Open "Create New User" when header button increments createTick
  useEffect(() => {
    if (createTick > 0) {
      setSelectedUser(null);
      setShowModal(true);
    }
  }, [createTick]);

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchData();
  };

  const handleDelete = (userId) => {
    toast((t) => (
      <div className="flex flex-col items-center gap-4">
        <p className="font-semibold">Delete this user? This is permanent.</p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            onClick={() => {
              const promise = apiService.deleteUser(token, userId).then(() => fetchData());
              toast.promise(promise, {
                loading: 'Deleting user...',
                success: 'User deleted!',
                error: 'Failed to delete user.',
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
    ));
  };

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="grid gap-3">
        {loading && (
          <>
            <div className="h-20 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
            <div className="h-20 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
          </>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            No users found.
          </div>
        )}

        {!loading &&
          !error &&
          users.map((u) => (
            <div
              key={u.id}
              className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-sm text-gray-600 truncate">{u.email}</p>
                  <p className="mt-1 text-xs text-gray-400">ID: {u.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(u)}
                    className="text-gray-400 hover:text-indigo-600"
                    title="Edit"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <UserModal
          user={selectedUser}
          allGroups={allGroups}
          token={token}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
