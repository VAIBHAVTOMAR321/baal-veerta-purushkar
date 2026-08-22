import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    if (isRefreshingRef.current) return null;
    isRefreshingRef.current = true;

    try {
      const refreshResponse = await fetch('https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/refresh-token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token.');
      }

      const { access } = await refreshResponse.json();
      localStorage.setItem('accessToken', access);
      return access;
    } catch (error) {
      logout();
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedRefreshToken) {
      refreshAccessToken();
    }
  }, []);

  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedRefreshToken && !isRefreshingRef.current) {
        refreshAccessToken();
      }
    }, 60000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

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
    navigate('/StudentRegistration');
  };

  const authFetch = async (url, options = {}) => {
    let accessToken = localStorage.getItem('accessToken');

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const authOptions = {
      ...options,
      headers,
    };

    let response = await fetch(url, authOptions);

    if (response.status === 401 && !url.includes('/api/refresh-token/')) {
      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        throw new Error('Session expired. Please log in again.');
      }

      authOptions.headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(url, authOptions);
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

export default AuthContext;
