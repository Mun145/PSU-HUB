// src/pages/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import { Container, CircularProgress, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import api from '../api/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';

// Sub-dashboards
import AdminDashboardView from './AdminDashboardView';
import FacultyDashboardView from './FacultyDashboardView';
import PSUAdminDashboardView from './PSUAdminDashboardView';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const userRole = user ? user.role : null;

  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Socket
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001');
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('newEvent', (data) => {
      console.log('New event added:', data);
      toast.info(`New event added: ${data.title}`);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    api.get('/events')
      .then((res) => {
        setEvents(res.data.data || []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching events');
      })
      .finally(() => setLoading(false));

    if (userRole === 'admin') {
      api.get('/analytics/overview')
        .then((res) => {
          setAnalytics(res.data.data);
        })
        .catch((err) => {
          console.error('Error fetching analytics:', err);
        });
    }
  }, [userRole]);

  const refetchEvents = () => {
    setLoading(true);
    api.get('/events')
      .then((res) => {
        setEvents(res.data.data || []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching events');
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Role checks
  if (!userRole) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Please log in to see your dashboard.</Typography>
      </Container>
    );
  }

  if (userRole === 'faculty') {
    return <FacultyDashboardView events={events} setEvents={setEvents} />;
  }

  if (userRole === 'admin') {
    return (
      <AdminDashboardView
        events={events}
        setEvents={setEvents}
        analytics={analytics}
        refetchEvents={refetchEvents}
      />
    );
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

export default Dashboard;
