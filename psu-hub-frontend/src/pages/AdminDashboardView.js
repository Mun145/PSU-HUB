//pages/AdminDashboardView.js
import React, { useState } from 'react';
import { Container, Typography, Button, Box, Tabs, Tab, Collapse, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import AdminEventsTab from '../components/AdminEventsTab';

export default function AdminDashboardView({ events, refetchEvents, analytics }) {
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
  if (analytics) {
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

  const chartKey = analytics
    ? `chartKey-${analytics.totalEvents}-${analytics.approvedEvents}-${analytics.totalAttendance}-${analytics.totalUsers}`
    : 'no-analytics';

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>All:</strong> {allEvents.length} &nbsp;|&nbsp;
          <strong>Awaiting:</strong> {awaitingCount} &nbsp;|&nbsp;
          <strong>Published:</strong> {publishedCount} &nbsp;|&nbsp;
          <strong>Drafts:</strong> {draftCount}
        </Typography>
        <Button variant="outlined" onClick={handleToggleAnalytics} sx={{ mt: 1 }}>
          {collapseAnalytics ? 'Hide Detailed Stats' : 'Show Detailed Stats'}
        </Button>
        <Collapse in={collapseAnalytics} unmountOnExit mountOnEnter>
          {analytics ? (
            <Box sx={{ width: '100%', height: 420, mt: 2 }}>
              <Line key={chartKey} data={chartData} options={chartOptions} />
            </Box>
          ) : (
            <Typography sx={{ mt: 2 }}>No analytics data.</Typography>
          )}
        </Collapse>
      </Paper>

      <Tabs
        value={adminTab}
        onChange={handleAdminTabChange}
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="All" />
        <Tab label="Awaiting" />
        <Tab label="Published" />
        <Tab label="Drafts" />
        <Tab label="Analytics" />
      </Tabs>

      {adminTab !== 4 && (
        <Paper sx={{ p: 3 }}>
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
        </Paper>
      )}

      {adminTab === 4 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography>Analytics are shown in the collapsible section above.</Typography>
        </Paper>
      )}
    </Container>
  );
}
