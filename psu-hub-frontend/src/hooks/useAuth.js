import { useState } from 'react';
import jwt_decode from 'jwt-decode';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

export function useAuth() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      return decoded;
    }
    return null;
  });

  async function login(email, password) {
    try {
      const { data } = await axiosInstance.post('/users/login', { email, password });
      localStorage.setItem('token', data.token);
      const decoded = jwt_decode(data.token);
      setUser(decoded);
      toast.success('Login successful');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out');
  }

  return { user, login, logout };
}
