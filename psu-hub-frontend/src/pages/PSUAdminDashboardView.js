//pages/PSUAdminDashboardView.js
import React from 'react';
import { Container, Typography, Paper, Grid } from '@mui/material';
import EventCard from '../components/EventCard';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

export default function PSUAdminDashboardView({ events, setEvents }) {
  // Filter pending events for PSU Admin
  const pendingEvents = events.filter((e) => e.status === 'pending');

  // Approve
  const handleApprove = async (event) => {
    try {
      await api.patch(`/events/approve/${event.id}`);
      toast.success(`Event "${event.title}" approved`);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === event.id ? { ...ev, status: 'approved' } : ev))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving event');
    }
  };

  // Reject
  const handleReject = async (event) => {
    try {
      await api.patch(`/events/reject/${event.id}`);
      toast.success(`Event "${event.title}" rejected`);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === event.id ? { ...ev, status: 'rejected' } : ev))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rejecting event');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Board Member Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Below are pending events. You can approve or reject each one.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {pendingEvents.length === 0 ? (
          <Typography>No pending events.</Typography>
        ) : (
          <Grid container spacing={3}>
            {pendingEvents.map((ev) => (
              <Grid item xs={12} sm={6} md={4} key={ev.id}>
                <EventCard
                  event={ev}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  showStatus
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}
