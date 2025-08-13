// A centralized service to handle all API calls
export const apiService = {
  login: async (username, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  getCurrentUser: async (token) => {
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
  getIdeas: async (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    
    const response = await fetch(`/api/ideas?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch ideas');
    return response.json();
  },
  submitIdea: async (token, ideaData) => {
    const response = await fetch('/api/ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ideaData),
    });
    if (!response.ok) throw new Error('Failed to submit idea');
    return response.json();
  },
  // This is the single, correct method for fetching all of a user's tasks
  getMyTasks: async (token, ideaName = '') => {
    const params = new URLSearchParams();
    if (ideaName) params.append('ideaName', ideaName);

    const response = await fetch(`/api/tasks?${params.toString()}`, { 
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },
  claimTask: async (token, taskId) => {
    const response = await fetch(`/api/tasks/${taskId}/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to claim task');
  },
  unclaimTask: async (token, taskId) => {
    const response = await fetch(`/api/tasks/${taskId}/unclaim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to unclaim task');
  },
  completeTask: async (token, taskId, variables) => {
    const response = await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(variables),
    });
    if (!response.ok) throw new Error('Failed to complete task');
  },
  prioritizeIdea: async (token, processInstanceId, priority) => {
      const response = await fetch(`/api/ideas/${processInstanceId}/prioritize`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ priority })
      });
      if (!response.ok) throw new Error('Failed to set priority');
      return response.json();
  },
  getDocumentsForProcessInstance: async (token, processInstanceId) => {
    const response = await fetch(`/api/process-instances/${processInstanceId}/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },
  uploadDocument: async (token, processInstanceId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/process-instances/${processInstanceId}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload document');
    return response.text();
  },
  getDashboardStats: async (token) => {
    const response = await fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },
  updateIdea: async (token, ideaId, ideaData) => {
    const response = await fetch(`/api/ideas/${ideaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ideaData),
    });
    if (!response.ok) throw new Error('Failed to update idea');
    return response.json();
  },
  deleteIdea: async (token, ideaId) => {
    const response = await fetch(`/api/ideas/${ideaId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete idea');
  },
  getIdeaDetails: async (token, ideaId) => {
    const response = await fetch(`/api/ideas/${ideaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch idea details');
    return response.json();
  },
  getTaskDetails: async (token, taskId) => {
    const response = await fetch(`/api/tasks/${taskId}/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch task details');
    return response.json();
  },
  // --- Team Composition (for the specific task) ---
  getAllUsersForTask: async (token) => {
    const response = await fetch('/api/developpements/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  setDevelopmentTeam: async (token, processInstanceId, teamData) => {
    const response = await fetch(`/api/developpements/process-instances/${processInstanceId}/equipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) throw new Error('Failed to set team');
  },
   // --- User Management (for Admin Page) ---
   getAllUsersForAdmin: async (token) => {
    const response = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  getAllGroups: async (token) => {
    const response = await fetch('/api/users/groups', {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
  },
  // NEW: Get the groups for a specific user
  getUserGroups: async (token, userId) => {
    const response = await fetch(`/api/users/${userId}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch user's groups");
    return response.json();
  },
  createUser: async (token, userData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  updateUser: async (token, userId, userData) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteUser: async (token, userId) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  updateUserGroups: async (token, userId, groupIds) => {
    const response = await fetch(`/api/users/${userId}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(groupIds),
    });
    if (!response.ok) throw new Error("Failed to update user's groups");
  },
};