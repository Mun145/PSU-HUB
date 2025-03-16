// src/hooks/useNotificationsSocket.js
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNotifications } from '../contexts/NotificationContext';

// Option A: environment variable or fallback to same domain
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin;

export default function useNotificationsSocket() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Connect to the socket server
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to notifications server');
    });

    socket.on('newNotification', (data) => {
      addNotification(data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notifications server');
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification]);

  return;
}
