import React, { useState, useEffect } from 'react';
import { apiService } from './api/apiService';
import { LoginPage } from './components/LoginPage';
import { AppLayout } from './components/AppLayout';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const userData = await apiService.getCurrentUser(storedToken);
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          handleLogout();
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleLoginSuccess = async (newToken) => {
    localStorage.setItem('authToken', newToken);
    setIsLoading(true);
    try {
        const userData = await apiService.getCurrentUser(newToken);
        setUser(userData);
        setToken(newToken);
    } catch (error) {
        handleLogout();
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Application...</div>;
  }

  return (
    <div id="root">
      <Toaster position="bottom-right" /> {/* <-- 2. Add the Toaster component here */}
      {user ? (
        <AppLayout token={token} user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
