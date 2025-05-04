// src/pages/EventDetails.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Button,
  Stack,
  Grid,
  Divider,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import { Helmet } from 'react-helmet';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => {
        const fetched = res.data.data || res.data;
        setEvent(fetched);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching event');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ mb: 3, borderRadius: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((index) => (
              <Grid item xs={12} key={index}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Event not found. The event may have been removed or you may not have permission to view it.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const startDateStr = event.startDate
    ? new Date(event.startDate).toLocaleDateString()
    : null;
  const endDateStr = event.endDate
    ? new Date(event.endDate).toLocaleDateString()
    : null;

  return (
    <>
      <Helmet>
        <title>PSU Hub – {event.title}</title>
      </Helmet>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Image */}
        {event.imageUrl && (
          <Box
            sx={{
              width: '100%',
              height: { xs: 200, sm: 300 },
              background: `url(${event.imageUrl}) center/cover no-repeat`,
              borderRadius: 2,
              mb: 3,
              boxShadow: 2
            }}
          />
        )}

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <EventIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                {event.title}
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
              >
                Event Details
              </Typography>
            </Box>
          </Stack>

          {/* Event Status */}
          <Alert 
            severity={event.status === 'published' ? 'success' : 'info'} 
            icon={<InfoIcon />}
            sx={{ mb: 3 }}
          >
            Status: {event.status || 'N/A'}
          </Alert>

          {/* Basic Info */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon color="action" />
                <Typography variant="body1">
                  {startDateStr && endDateStr 
                    ? `${startDateStr} - ${endDateStr}`
                    : startDateStr || 'No date set'}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon color="action" />
                <Typography variant="body1">
                  {event.location || 'Location not specified'}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SchoolIcon color="action" />
                <Typography variant="body1">
                  {event.academicYear ? `Academic Year: ${event.academicYear}` : 'No academic year set'}
                </Typography>
              </Stack>
            </Grid>
            {event.totalHours && (
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon color="action" />
                  <Typography variant="body1">
                    Total Hours: {event.totalHours}
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <DescriptionIcon color="action" />
              <Typography variant="h6">Description</Typography>
            </Stack>
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}
            >
              {event.description}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mt: 4 }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              fullWidth={isMobile}
            >
              Back to Dashboard
            </Button>
            {event.hasCertificate && (
              <Button
                variant="contained"
                color="primary"
                fullWidth={isMobile}
              >
                View Certificate
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </>
  );
}

export default EventDetails;
