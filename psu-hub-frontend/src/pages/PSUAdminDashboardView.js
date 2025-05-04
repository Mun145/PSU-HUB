//pages/PSUAdminDashboardView.js
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  Skeleton,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import EventCard from '../components/EventCard';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export default function PSUAdminDashboardView({ events, setEvents }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Skeleton variant="rectangular" height={140} />
            <Box sx={{ pt: 2 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        sx={{ 
          p: 4, 
          mb: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <PendingActionsIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            >
              Board Member Dashboard
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
            >
              Review and manage pending events
            </Typography>
          </Box>
        </Stack>

        <Alert 
          severity="info" 
          sx={{ 
            mt: 2,
            '& .MuiAlert-icon': { alignItems: 'center' }
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="body2">
              Approve events that meet university guidelines
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <CancelOutlinedIcon color="error" />
            <Typography variant="body2">
              Reject events that don't meet requirements
            </Typography>
          </Stack>
        </Alert>
      </Paper>

      <Paper 
        sx={{ 
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        {loading ? (
          renderLoadingSkeleton()
        ) : pendingEvents.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}
          >
            <PendingActionsIcon sx={{ fontSize: 60, mb: 2, color: 'action.disabled' }} />
            <Typography variant="h6" gutterBottom>
              No Pending Events
            </Typography>
            <Typography variant="body1">
              There are currently no events awaiting approval
            </Typography>
          </Box>
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
