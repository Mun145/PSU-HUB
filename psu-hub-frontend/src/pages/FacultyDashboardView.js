// src/pages/FacultyDashboardView.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import EventCard from '../components/EventCard';

export default function FacultyDashboardView({ events, setEvents }) {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showPast, setShowPast] = useState(false);

  const getFilteredEvents = () => {
    let filtered = events.filter((event) => {
      const statusMatch =
        filterStatus === 'all' ? true : event.status === filterStatus;
      const query = searchQuery.trim().toLowerCase();
      const searchMatch =
        query === '' ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query);
      return statusMatch && searchMatch;
    });

    if (showPast) {
      filtered = filtered.filter((e) => {
        const d = e.startDate || e.date;
        return new Date(d) < new Date();
      });
    } else {
      filtered = filtered.filter((e) => {
        const d = e.startDate || e.date;
        return new Date(d) >= new Date();
      });
    }

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
      const updated = events.map((ev) =>
        ev.id === event.id ? { ...ev, isRegistered: true } : ev
      );
      setEvents(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering');
    }
  };

  const handleUnregister = async (event) => {
    try {
      await api.delete(`/events/${event.id}/unregister`);
      toast.success('Unregistered successfully');
      const updated = events.map((ev) =>
        ev.id === event.id ? { ...ev, isRegistered: false } : ev
      );
      setEvents(updated);
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
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
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
                  onView={(evt) => navigate(`/event/${evt.id}`)}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                  isRegistered={event.isRegistered}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}
