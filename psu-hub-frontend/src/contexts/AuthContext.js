// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import jwt_decode from 'jwt-decode';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    toast.info('Logged out');
  }, []);

  const scheduleTokenExpiryCheck = useCallback((token) => {
    try {
      const decoded = jwt_decode(token);
      if (decoded.exp) {
        const expTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeout = expTime - currentTime;
        if (timeout > 0) {
          setTimeout(() => {
            toast.info('Session expired');
            logout();
          }, timeout);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Error decoding token for expiry check:', error);
    }
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwt_decode(storedToken);
        setUser(decoded);
        setToken(storedToken);
        scheduleTokenExpiryCheck(storedToken);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
  }, [scheduleTokenExpiryCheck]);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('/users/login', { email, password });
      const { token } = res.data.data; // Adjust if your token is in res.data or res.data.data
      localStorage.setItem('token', token);
      const decoded = jwt_decode(token);
      setUser(decoded);
      setToken(token);
      scheduleTokenExpiryCheck(token);
      toast.success('Login successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
