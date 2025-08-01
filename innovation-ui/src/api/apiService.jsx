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
    getIdeas: async (token) => {
      const response = await fetch('/api/ideas', {
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
    getMyTasks: async (token) => {
      const response = await fetch('/api/tasks', {
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
    
    // NEW: Get documents using the processInstanceId
    getDocumentsForProcessInstance: async (token, processInstanceId) => {
      const response = await fetch(`/api/process-instances/${processInstanceId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  
    // UPDATED to use the new process instance endpoint
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
    // NEW: Update an existing idea
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

    // NEW: Delete an idea
    deleteIdea: async (token, ideaId) => {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete idea');
    },
    // NEW: Get full details for a single idea, including documents
    getIdeaDetails: async (token, ideaId) => {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch idea details');
      return response.json();
    },
  };