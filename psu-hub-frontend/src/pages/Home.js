import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';

export default function Home() {
  const { user } = useContext(AuthContext);
  const userRole = user ? user.role : null;
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === 'faculty') {
      setLoading(true);
      api.get('/events')
        .then((res) => {
          const allEvents = res.data.data || [];
          const pubs = allEvents.filter((ev) => ev.status === 'published');
          setPublishedEvents(pubs);
        })
        .catch((err) => toast.error(err.response?.data?.message || 'Error fetching events'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userRole]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (userRole !== 'faculty') {
    return (
      <>
        <Helmet>
          <title>PSU Hub - Home</title>
          <meta name="description" content="Welcome to PSU Hub, your platform for university events." />
        </Helmet>
        <Container sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to PSU Hub!
          </Typography>
          <Typography variant="body1">
            Manage your university events with ease.
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>PSU Hub - Home</title>
      </Helmet>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Events
        </Typography>

        <Paper sx={{ p: 3 }}>
          {publishedEvents.length === 0 ? (
            <Typography>No published events available right now.</Typography>
          ) : (
            <Grid container spacing={3}>
              {publishedEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard
                    event={event}
                    // The "View" will go to your single-event page, but we've removed "Mark Attendance".
                    onView={() => navigate(`/event/${event.id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </>
  );
}
