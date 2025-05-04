//pages/Home.js
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        {renderLoadingSkeleton()}
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
        <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            >
              Welcome to PSU Hub!
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              color="text.secondary"
              sx={{ maxWidth: '600px', mx: 'auto' }}
            >
              Your comprehensive platform for managing university events, tracking attendance, and engaging with the academic community.
            </Typography>
          </Box>
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
        <Typography 
          variant="h4" 
          component="h1"
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            mb: 4
          }}
        >
          Available Events
        </Typography>

        <Paper 
          sx={{ 
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          {publishedEvents.length === 0 ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 4,
                color: 'text.secondary'
              }}
            >
              <Typography variant="h6" gutterBottom>
                No published events available
              </Typography>
              <Typography variant="body1">
                Check back later for upcoming events
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {publishedEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard
                    event={event}
                    onCardClick={() => navigate(`/event/${event.id}`)}
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
