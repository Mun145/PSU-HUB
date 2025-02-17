// psu-hub-frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';

// --- REGISTER chart.js scales & components ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('published');
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);

    // Fetch events
    axios
      .get('http://localhost:3001/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        setLoading(false);
      });

    // If Admin, also fetch analytics
    if (userRole === 'admin') {
      axios
        .get('http://localhost:3001/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setAnalytics(res.data))
        .catch((err) => console.error('Error fetching analytics:', err));
    }
  }, [token, userRole]);

  const publishEvent = (eventId) => {
    axios
      .patch(
        `http://localhost:3001/api/events/publish/${eventId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        toast.success('Event published successfully');
        window.location.reload();
      })
      .catch((err) => {
        toast.error('Error publishing event: ' + err.response?.data?.message);
      });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // 1) Faculty Dashboard
  if (userRole === 'faculty') {
    const filteredEvents = events.filter((e) => e.status === filterStatus);

    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Faculty Dashboard
        </Typography>

        {/* Filter for event status */}
        <FormControl variant="outlined" sx={{ minWidth: 120, mt: 2 }}>
          <InputLabel id="filter-label">Status</InputLabel>
          <Select
            labelId="filter-label"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
          </Select>
        </FormControl>

        {filteredEvents.length === 0 ? (
          <Typography sx={{ mt: 2 }}>No events found.</Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography variant="body2">{event.description}</Typography>
                  <Typography>
                    Date: {new Date(event.date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );
  }

  // 2) Admin Dashboard
  if (userRole === 'admin') {
    const awaitingPublish = events.filter((e) => e.status === 'approved');

    // Create chart data
    const chartData = {
      labels: analytics
        ? ['Total Events', 'Approved Events', 'Attendance', 'Users']
        : [],
      datasets: [
        {
          label: 'Analytics',
          data: analytics
            ? [
                analytics.totalEvents,
                analytics.approvedEvents,
                analytics.totalAttendance,
                analytics.totalUsers,
              ]
            : [],
          fill: false,
          backgroundColor: 'rgb(75, 192, 192)',
          borderColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    };

    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Events Awaiting Publishing
        </Typography>
        {awaitingPublish.length === 0 ? (
          <Typography>No events awaiting publishing.</Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {awaitingPublish.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography variant="body2">{event.description}</Typography>
                  <Typography>
                    Date: {new Date(event.date).toLocaleDateString()}
                  </Typography>
                  <Typography>Status: {event.status}</Typography>
                  <Button
                    variant="contained"
                    onClick={() => publishEvent(event.id)}
                    sx={{ mt: 1 }}
                  >
                    Publish Event
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Typography variant="h6" sx={{ mt: 4 }}>
          Analytics Overview
        </Typography>
        {analytics ? (
          <Box sx={{ maxWidth: '600px', mt: 2 }}>
            {/* unique key to avoid reuse of same canvas */}
            <Line key="adminAnalyticsChart" data={chartData} />
          </Box>
        ) : (
          <Typography>Loading analytics...</Typography>
        )}
      </Container>
    );
  }

  // 3) PSU_Admin Dashboard
  if (userRole === 'psu_admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Board Member Dashboard
        </Typography>
        <Typography>
          Please use the Pending Events page to approve or reject events.
        </Typography>
      </Container>
    );
  }

  // Unknown role
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography>Unknown role</Typography>
    </Container>
  );
}

export default Dashboard;
