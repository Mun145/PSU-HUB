// src/pages/EventDetails.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => {
        // If using sendSuccess, data might be in res.data.data:
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
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Event not found.</Typography>
      </Container>
    );
  }

  // Format dates if they exist
  const startDateStr = event.startDate
    ? new Date(event.startDate).toLocaleDateString()
    : null;
  const endDateStr = event.endDate
    ? new Date(event.endDate).toLocaleDateString()
    : null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Optional Hero Image */}
      {event.imageUrl && (
        <Box
          sx={{
            width: '100%',
            height: 300,
            background: `url(${event.imageUrl}) center/cover no-repeat`,
            borderRadius: 2,
            mb: 2
          }}
        />
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {event.title}
        </Typography>

        {/* Basic Info Row (Date, location, academic year) */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {startDateStr && endDateStr && (
            <Chip label={`${startDateStr} - ${endDateStr}`} variant="outlined" />
          )}
          {/* If there's only a startDate (no endDate) */}
          {!endDateStr && startDateStr && (
            <Chip label={startDateStr} variant="outlined" />
          )}
          {event.location && (
            <Chip label={event.location} variant="outlined" />
          )}
          {event.academicYear && (
            <Chip label={`AY ${event.academicYear}`} variant="outlined" />
          )}
        </Box>

        {/* Description */}
        <Typography variant="body1" sx={{ mb: 2 }}>
          {event.description}
        </Typography>

        {/* Additional fields example: totalHours */}
        {event.totalHours && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Total Hours: {event.totalHours}
          </Typography>
        )}

        {/* Status */}
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Status: {event.status || 'N/A'}
        </Typography>

        {/* 
          If you had a "Survey" or "Register" button, you could place it below.
          Here we just show a "Back to Dashboard" for convenience.
        */}
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default EventDetails;
