import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import EventCard from '../components/EventCard';

export default function FacultyDashboardView({ events, setEvents }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showPast, setShowPast] = useState(false);

  // On mount, fetch published events with registration status
  useEffect(() => {
    fetchFacultyEvents();
    // eslint-disable-next-line
  }, []);

  const fetchFacultyEvents = async () => {
    try {
      const res = await api.get('/events/faculty');
      // This returns an array of events with an added "isRegistered" field
      setEvents(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching faculty events');
    }
  };

  const getFilteredEvents = () => {
    let filtered = events.filter((ev) => ev.status === 'published');
    const query = searchQuery.trim().toLowerCase();
    filtered = filtered.filter((ev) => {
      const inTitle = ev.title.toLowerCase().includes(query);
      const inDesc = ev.description.toLowerCase().includes(query);
      return query === '' || inTitle || inDesc;
    });
    filtered = filtered.filter((ev) => {
      const d = ev.startDate || ev.date;
      if (!d) return true;
      const dateVal = new Date(d);
      return showPast ? dateVal < new Date() : dateVal >= new Date();
    });
    filtered.sort((a, b) => {
      const aDate = new Date(a.startDate || a.date);
      const bDate = new Date(b.startDate || b.date);
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    });
    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  const handleRegister = async (event) => {
    try {
      await api.post(`/events/${event.id}/register`);
      toast.success('Registered successfully');
      fetchFacultyEvents(); // re-fetch to update registration status
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering');
    }
  };

  const handleUnregister = async (event) => {
    try {
      await api.delete(`/events/${event.id}/unregister`);
      toast.success('Unregistered successfully');
      fetchFacultyEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error unregistering');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Faculty Dashboard
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search events"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outlined" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort By Date</InputLabel>
            <Select
              value={sortOrder}
              label="Sort By Date"
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="asc">Oldest First</MenuItem>
              <MenuItem value="desc">Newest First</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant={showPast ? 'contained' : 'outlined'}
            onClick={() => setShowPast(!showPast)}
          >
            {showPast ? 'Show Upcoming' : 'Show Past'}
          </Button>
        </Box>

        {filteredEvents.length === 0 ? (
          <Typography sx={{ mt: 2 }}>No events found.</Typography>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard
                  event={event}
                  onCardClick={() => navigate(`/event/${event.id}`)}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                  isRegistered={event.isRegistered}
                  showStatus={false} // Hide status marker for faculty
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}
