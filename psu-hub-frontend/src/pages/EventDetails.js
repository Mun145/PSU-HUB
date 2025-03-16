// src/pages/EventDetails.js
import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Button, Box, CircularProgress } from '@mui/material';
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
    api.get(`/events/${id}`)
      .then((res) => {
        // If using sendSuccess, data might be in res.data.data. If not, adjust accordingly.
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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>{event.title}</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{event.description}</Typography>
        <Typography variant="body2">
          Date: {new Date(event.date).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">Location: {event.location}</Typography>
        <Typography variant="body2">Status: {event.status}</Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => navigate(`/scan-attendance?eventId=${event.id}`)}
          >
            Mark Attendance
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(`/survey?eventId=${event.id}`)}
          >
            Take Survey
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}



export default EventDetails;
