// src/contexts/NotificationContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Fetch persisted notifications on mount
  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching notifications');
      });
  }, []);

  function addNotification(notification) {
    setNotifications((prev) => [...prev, notification]);
  }

  function removeNotification(nid) {
    setNotifications((prev) => prev.filter((n) => n.id !== nid));
  }

  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
