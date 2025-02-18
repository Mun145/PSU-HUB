// psu-hub-frontend/src/pages/Analytics.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';
// If you want to keep toast notifications for errors, uncomment this line:
import { toast } from 'react-toastify';

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3001/api/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setAnalyticsData(response.data);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Error fetching analytics';
        setError(msg);
        // If you want a toast notification, uncomment this line:
        toast.error(`Error: ${msg}`);
      });
  }, [token]);

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container>
        <Typography variant="h6">Loading analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Analytics Dashboard</Typography>
      <Typography variant="body1">
        Total Events: {analyticsData.totalEvents}<br />
        Approved Events: {analyticsData.approvedEvents}<br />
        Total Attendance: {analyticsData.totalAttendance}<br />
        Total Registered Users: {analyticsData.totalUsers}
      </Typography>
    </Container>
  );
}

export default Analytics;
