import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', userData.access);
    localStorage.setItem('refreshToken', userData.refresh);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  const authFetch = async (url, options = {}) => {
    let accessToken = localStorage.getItem('accessToken');

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    // Let the browser set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header
    const authOptions = {
      ...options,
      headers,
    };

    let response = await fetch(url, authOptions);

    // If token is expired (401) and it's not a refresh token request itself
    if (response.status === 401 && !url.includes('/api/refresh-token/')) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        logout();
        throw new Error('Session expired. Please log in again.');
      }

      try {
        const refreshResponse = await fetch('https://mahadevaaya.com/srcproject/srcproject_backend/api/refresh-token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token.');
        }

        const { access: newAccessToken } = await refreshResponse.json();
        localStorage.setItem('accessToken', newAccessToken);

        // Retry the original request with the new token
        authOptions.headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, authOptions);
      } catch (error) {
        logout();
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    authFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;