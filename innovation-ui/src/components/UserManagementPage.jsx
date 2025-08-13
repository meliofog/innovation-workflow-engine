import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import toast from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// --- User Edit/Create Modal ---
const UserModal = ({ user, allGroups, token, onClose, onSave }) => {
    const [formData, setFormData] = useState({ /* ... */ });
    const [selectedGroups, setSelectedGroups] = useState([]);
    
    const isEditing = user !== null;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: '', // Don't pre-fill password
            });
            
            // --- THIS IS THE FIX ---
            // Fetch the user's current groups when the modal opens in edit mode
            const fetchUserGroups = async () => {
                try {
                    const userGroups = await apiService.getUserGroups(token, user.id);
                    setSelectedGroups(userGroups.map(g => g.id));
                } catch (error) {
                    console.error("Failed to fetch user groups:", error);
                }
            };
            fetchUserGroups();
        }
    }, [user, isEditing, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGroupChange = (groupId) => {
        setSelectedGroups(prev => 
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const promise = isEditing 
            ? apiService.updateUser(token, user.id, formData).then(() => apiService.updateUserGroups(token, user.id, selectedGroups))
            : apiService.createUser(token, formData).then(newUser => apiService.updateUserGroups(token, newUser.id, selectedGroups));

        toast.promise(promise, {
            loading: isEditing ? 'Updating user...' : 'Creating user...',
            success: () => {
                onSave();
                return isEditing ? 'User updated successfully!' : 'User created successfully!';
            },
            error: isEditing ? 'Failed to update user.' : 'Failed to create user.',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Create New User'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... Form fields for id, firstName, lastName, email, password ... */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* User ID (disabled when editing) */}
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-700">User ID</label>
                            <input type="text" name="id" id="id" value={formData.id} onChange={handleChange} required disabled={isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 disabled:bg-gray-100"/>
                        </div>
                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        {/* First & Last Name */}
                        <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required className="..."/>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required className="..."/>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="sm:col-span-2 ..."/>
                    </div>
                    {/* Group Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Groups</label>
                        <div className="mt-2 border rounded-md p-2 h-32 overflow-y-auto space-y-1">
                            {allGroups.map(group => (
                                <div key={group.id} className="flex items-center">
                                    <input id={`group-${group.id}`} type="checkbox" checked={selectedGroups.includes(group.id)} onChange={() => handleGroupChange(group.id)} className="h-4 w-4 rounded"/>
                                    <label htmlFor={`group-${group.id}`} className="ml-3 text-sm text-gray-700">{group.name} ({group.id})</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                            {isEditing ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main User Management Page ---
export const UserManagementPage = ({ token }) => {
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

  useEffect(() => {
    fetchData();
  }, [token]);

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
    fetchData(); // Refresh the user list
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
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => handleOpenModal()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          + Add New User
        </button>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
            {loading && <li className="p-4 text-center">Loading users...</li>}
            {error && <li className="p-4 text-center text-red-600">{error}</li>}
            {!loading && users.map((user) => (
                <li key={user.id}>
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div>
                            <p className="text-md font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex space-x-4">
                            <button onClick={() => handleOpenModal(user)} className="text-gray-400 hover:text-indigo-600"><PencilSquareIcon className="h-5 w-5"/></button>
                            <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
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