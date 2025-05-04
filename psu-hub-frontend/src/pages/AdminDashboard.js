// psu-hub-frontend/src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  Stack,
  Divider,
  LinearProgress,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon
} from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, ChartTooltip, Legend);

export default function AdminDashboard() {
  const [quickStats, setQuickStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes, tasksRes, announcementsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/admin/recent-activity'),
          api.get('/admin/daily-tasks'),
          api.get('/admin/announcements')
        ]);

        setQuickStats(statsRes.data.data);
        setRecentActivity(activityRes.data.data);
        setDailyTasks(tasksRes.data.data);
        setAnnouncements(announcementsRes.data.data);
      } catch (err) {
        toast.error('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderDonutChart = (attended, registered) => {
    const data = {
      labels: ['Attended', 'Not Attended'],
      datasets: [
        {
          data: [attended, registered - attended],
          backgroundColor: ['#4caf50', '#f44336'],
          hoverBackgroundColor: ['#388e3c', '#d32f2f']
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Overview of system activities and statistics
        </Typography>
      </Box>

      {/* Quick Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <EventIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="div">
                    {quickStats?.totalEvents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="div">
                    {quickStats?.approvedEvents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Events
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="div">
                    {quickStats?.totalAttendance || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Attendance
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="div">
                    {quickStats?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="Recent Activity"
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <NotificationsIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              {recentActivity.length ? (
                <List>
                  {recentActivity.map((activity) => (
                    <ListItem
                      key={activity.id}
                      secondaryAction={
                        <Stack direction="row" spacing={1} alignItems="center">
                          {activity.attended !== undefined &&
                            activity.registered !== undefined &&
                            renderDonutChart(activity.attended, activity.registered)}
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/manage-events?eventId=${activity.referenceId}`);
                            }}
                          >
                            View
                          </Button>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={activity.message}
                        secondary={new Date(activity.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center">
                  No recent activity available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Tasks Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="Daily Tasks"
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <AssignmentIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              {dailyTasks.length ? (
                <List>
                  {dailyTasks.map((task) => (
                    <ListItem
                      key={task.id}
                      secondaryAction={
                        !task.done && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CheckBoxIcon />}
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
                        )
                      }
                    >
                      <ListItemIcon>
                        {task.done ? (
                          <CheckBoxIcon color="success" />
                        ) : (
                          <CheckBoxOutlineBlankIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={task.message}
                        sx={{
                          textDecoration: task.done ? 'line-through' : 'none',
                          color: task.done ? 'text.secondary' : 'text.primary'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center">
                  No tasks for today. Good job!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Announcements Section */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader
              title="Announcements"
              avatar={
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <NotificationsIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              {announcements.length ? (
                <List>
                  {announcements.map((ann) => (
                    <ListItem key={ann.id}>
                      <ListItemIcon>
                        <NotificationsIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={ann.message}
                        secondary={new Date(ann.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center">
                  No announcements
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
