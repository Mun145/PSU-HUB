// psu-hub-frontend/src/pages/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import { Container, CircularProgress, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { Navigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';

// Sub-dashboards
import FacultyDashboardView from './FacultyDashboardView';
import PSUAdminDashboardView from './PSUAdminDashboardView';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const userRole = user ? user.role : null;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Socket connection
  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('newEvent', (data) => {
      toast.info(`New event added: ${data.title}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch events
  useEffect(() => {
    setLoading(true);
    api.get('/events')
      .then((res) => setEvents(res.data.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Error fetching events'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!userRole) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Please log in to see your dashboard.</Typography>
      </Container>
    );
  }

  // If admin, redirect to the new Admin Dashboard (/admin-dashboard)
  if (userRole === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (userRole === 'faculty') {
    return <FacultyDashboardView events={events} setEvents={setEvents} />;
  }

  if (userRole === 'psu_admin') {
    return <PSUAdminDashboardView events={events} setEvents={setEvents} />;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography>Unknown role: {userRole}</Typography>
    </Container>
  );
}
