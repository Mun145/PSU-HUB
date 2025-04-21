// psu-hub-frontend/src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  // States for dynamic content
  const [quickStats, setQuickStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Fetch quick stats from analytics endpoint
    api.get('/analytics/overview')
      .then((res) => setQuickStats(res.data.data))
      .catch((err) => {
        toast.error('Error fetching admin dashboard stats');
      });

    // Fetch recent activity from new endpoint
    api.get('/admin/recent-activity')
      .then((res) => setRecentActivity(res.data.data))
      .catch((err) => {
        toast.error('Error fetching recent activity');
      });

    // Fetch daily tasks from new endpoint
    api.get('/admin/daily-tasks')
      .then((res) => setDailyTasks(res.data.data))
      .catch((err) => {
        toast.error('Error fetching daily tasks');
      });

    // Fetch announcements from new endpoint
    api.get('/admin/announcements')
      .then((res) => setAnnouncements(res.data.data))
      .catch((err) => {
        toast.error('Error fetching announcements');
      });
  }, []);

  // Render a small donut chart for attendance ratio
  const renderDonutChart = (attended, registered) => {
    const data = {
      labels: ['Attended', 'Not Attended'],
      datasets: [
        {
          data: [attended, registered - attended],
          backgroundColor: ['#388e3c', '#d32f2f'],
          hoverBackgroundColor: ['#2e7d32', '#c62828']
        }
      ]
    };
    const options = {
      cutout: '70%',
      plugins: {
        legend: { display: false }
      },
      maintainAspectRatio: false
    };
    return (
      <Box sx={{ width: 60, height: 60 }}>
        <Doughnut data={data} options={options} />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Quick Stats Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Stats
        </Typography>
        {quickStats ? (
          <Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Total Events:</strong> {quickStats.totalEvents}
            </Typography>
            <Typography variant="body2">
              <strong>Approved Events:</strong> {quickStats.approvedEvents}
            </Typography>
            <Typography variant="body2">
              <strong>Total Attendance:</strong> {quickStats.totalAttendance}
            </Typography>
            <Typography variant="body2">
              <strong>Total Users:</strong> {quickStats.totalUsers}
            </Typography>
          </Box>
        ) : (
          <Typography>Loading stats...</Typography>
        )}
      </Paper>

      {/* Recent Activity Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        {recentActivity.length ? (
          recentActivity.map((activity) => (
            <Box
              key={activity.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #ddd',
                py: 1
              }}
            >
              <Box>
                <Typography variant="body2">
                  {activity.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {activity.attended !== undefined &&
                activity.registered !== undefined &&
                renderDonutChart(activity.attended, activity.registered)}
              <Button
                variant="text"
                size="small"
                onClick={() =>
                  window.location.href = `/manage-events?eventId=${activity.referenceId}`
                }
              >
                View
              </Button>
            </Box>
          ))
        ) : (
          <Typography>No recent activity available.</Typography>
        )}
      </Paper>

      {/* Daily Tasks Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Daily Tasks
        </Typography>
        {dailyTasks.length ? (
          dailyTasks.map((task) => (
            <Box
              key={task.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}
            >
              <Typography variant="body1">
                {task.done ? '✅' : '⬜'} {task.message}
              </Typography>
              {!task.done && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setDailyTasks((prev) =>
                      prev.map((t) =>
                        t.id === task.id ? { ...t, done: true } : t
                      )
                    )
                  }
                >
                  Mark Done
                </Button>
              )}
            </Box>
          ))
        ) : (
          <Typography>No tasks for today. Good job!</Typography>
        )}
      </Paper>

      {/* Announcements Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Announcements
        </Typography>
        {announcements.length ? (
          announcements.map((ann) => (
            <Typography key={ann.id} variant="body1" sx={{ mb: 1 }}>
              - {ann.message}
            </Typography>
          ))
        ) : (
          <Typography>No announcements.</Typography>
        )}
      </Paper>
    </Container>
  );
}
