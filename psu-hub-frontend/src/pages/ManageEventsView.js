// psu-hub-frontend/src/pages/ManageEventsView.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Collapse,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Publish as PublishIcon,
  Drafts as DraftsIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import AdminEventsTab from '../components/AdminEventsTab';
import api from '../api/axiosInstance';
  
export default function ManageEventsView({
  events: initialEvents = [],
  refetchEvents: parentRefetch = () => {},
  analytics = {}
}) {
  // Local state for events
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);

  // Function to fetch events from backend
  const fetchEvents = () => {
    setLoading(true);
    api.get('/events')
      .then((res) => {
        setEvents(res.data.data || []);
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
      })
      .finally(() => setLoading(false));
  };

  // If no events are passed in, fetch them on mount
  useEffect(() => {
    if (!initialEvents.length) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Allow parent to refetch events if needed
  const refetchEvents = () => {
    fetchEvents();
    parentRefetch();
  };

  const [adminTab, setAdminTab] = useState(0); // 0=All, 1=Awaiting, 2=Published, 3=Drafts, 4=Analytics
  const [collapseAnalytics, setCollapseAnalytics] = useState(false);

  const allEvents = events;
  const draftCount = allEvents.filter((e) => e.status === 'draft').length;
  const awaitingCount = allEvents.filter((e) => e.status === 'approved').length;
  const publishedCount = allEvents.filter((e) => e.status === 'published').length;

  const draftEvents = allEvents.filter((e) => e.status === 'draft');
  const awaitingEvents = allEvents.filter((e) => e.status === 'approved');
  const publishedEvents = allEvents.filter((e) => e.status === 'published');

  const handleToggleAnalytics = () => {
    setCollapseAnalytics(!collapseAnalytics);
  };

  const handleAdminTabChange = (e, newVal) => {
    setAdminTab(newVal);
  };

  let chartData = null;
  if (analytics && Object.keys(analytics).length) {
    chartData = {
      labels: ['Total Events', 'Approved Events', 'Attendance', 'Users'],
      datasets: [
        {
          label: 'Analytics',
          data: [
            analytics.totalEvents,
            analytics.approvedEvents,
            analytics.totalAttendance,
            analytics.totalUsers,
          ],
          fill: false,
          backgroundColor: 'rgba(25, 118, 210, 0.7)',
          borderColor: 'rgba(25, 118, 210, 0.3)',
        },
      ],
    };
  }

  const chartKey = analytics && Object.keys(analytics).length
    ? `chartKey-${analytics.totalEvents}-${analytics.approvedEvents}-${analytics.totalAttendance}-${analytics.totalUsers}`
    : 'no-analytics';

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Manage Events
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      icon={<EventIcon />}
                      label={`All: ${allEvents.length}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`Awaiting: ${awaitingCount}`}
                      color="warning"
                      variant="outlined"
                    />
                    <Chip
                      icon={<PublishIcon />}
                      label={`Published: ${publishedCount}`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      icon={<DraftsIcon />}
                      label={`Drafts: ${draftCount}`}
                      color="default"
                      variant="outlined"
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Tooltip title={collapseAnalytics ? "Hide Analytics" : "Show Analytics"}>
                    <IconButton
                      onClick={handleToggleAnalytics}
                      color="primary"
                      sx={{ 
                        transition: 'transform 0.3s',
                        transform: collapseAnalytics ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    >
                      {collapseAnalytics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>

              <Collapse in={collapseAnalytics} unmountOnExit mountOnEnter>
                <Box sx={{ width: '100%', height: 420, mt: 3 }}>
                  {chartData ? (
                    <Line key={chartKey} data={chartData} options={chartOptions} />
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      color: 'text.secondary'
                    }}>
                      <AnalyticsIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography>No analytics data available</Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>

          <Paper elevation={3} sx={{ borderRadius: 2 }}>
            <Tabs
              value={adminTab}
              onChange={handleAdminTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 'medium'
                }
              }}
            >
              <Tab icon={<EventIcon />} label="All" />
              <Tab icon={<CheckCircleIcon />} label="Awaiting" />
              <Tab icon={<PublishIcon />} label="Published" />
              <Tab icon={<DraftsIcon />} label="Drafts" />
              <Tab icon={<AnalyticsIcon />} label="Analytics" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {adminTab !== 4 && (
                <>
                  {adminTab === 0 && (
                    <AdminEventsTab list={allEvents} refetchEvents={refetchEvents} tabLabel="All" />
                  )}
                  {adminTab === 1 && (
                    <AdminEventsTab list={awaitingEvents} isAwaiting refetchEvents={refetchEvents} tabLabel="Awaiting" />
                  )}
                  {adminTab === 2 && (
                    <AdminEventsTab list={publishedEvents} refetchEvents={refetchEvents} tabLabel="Published" />
                  )}
                  {adminTab === 3 && (
                    <AdminEventsTab list={draftEvents} refetchEvents={refetchEvents} tabLabel="Drafts" />
                  )}
                </>
              )}

              {adminTab === 4 && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: 200,
                  color: 'text.secondary'
                }}>
                  <BarChartIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography>Analytics are shown in the collapsible section above</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
}
