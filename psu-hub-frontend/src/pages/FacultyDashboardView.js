// src/pages/FacultyDashboardView.js
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
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import EventCard from '../components/EventCard';

export default function FacultyDashboardView({ events, setEvents }) {
  const navigate = useNavigate();

  /* ───────────────────────────────── STATE ───────────────────────────────── */
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortOrder,   setSortOrder]     = useState('asc');
  const [range,       setRange]         = useState('all');  // all | upcoming | past

  /* ─────────────────────────────── FETCH DATA ────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/events/faculty');
        // backend already adds isRegistered
        setEvents(res.data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching faculty events');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────────────────────── FILTER & SORT ────────────────────────────── */
  const filteredEvents = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return (events || [])
      .filter(ev => ev.status === 'published')
      .filter(ev => {
        if (!q) return true;
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q)
        );
      })
      .filter(ev => {
        /* range filter */
        const d = new Date(ev.startDate || ev.date);
        if (Number.isNaN(+d)) return true;          // weird / missing date
        const today = new Date();
        if (range === 'upcoming') return d >= today;
        if (range === 'past')     return d <  today;
        return true; // 'all'
      })
      .sort((a, b) => {
        const ad = new Date(a.startDate || a.date);
        const bd = new Date(b.startDate || b.date);
        return sortOrder === 'asc' ? ad - bd : bd - ad;
      });
  }, [events, searchQuery, range, sortOrder]);

  /* ───────────────────────── REGISTER / UNREGISTER ───────────────────────── */
  const register   = async ev => {
    try {
      await api.post(`/events/${ev.id}/register`);
      toast.success('Registered successfully');
      ev.isRegistered = true;  // quick UI feedback
      setEvents([...events]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering');
    }
  };

  const unregister = async ev => {
    try {
      await api.delete(`/events/${ev.id}/unregister`);
      toast.success('Unregistered successfully');
      ev.isRegistered = false;
      setEvents([...events]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error unregistering');
    }
  };

  /* ───────────────────────────────── UI ──────────────────────────────────── */
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Faculty Dashboard
      </Typography>

      <Paper sx={{ p: 3 }}>
        {/* ───── Toolbar ───── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search events"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="small"
          />
          <Button variant="outlined" onClick={() => setSearchQuery('')}>
            Clear
          </Button>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort by date</InputLabel>
            <Select
              value={sortOrder}
              label="Sort by date"
              onChange={e => setSortOrder(e.target.value)}
            >
              <MenuItem value="asc">Oldest first</MenuItem>
              <MenuItem value="desc">Newest first</MenuItem>
            </Select>
          </FormControl>

          {/* NEW range selector */}
          <ToggleButtonGroup
            exclusive
            color="primary"
            size="small"
            value={range}
            onChange={(e, val) => val && setRange(val)}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="upcoming">Upcoming</ToggleButton>
            <ToggleButton value="past">Past</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* ───── Results ───── */}
        {filteredEvents.length === 0 ? (
          <Typography sx={{ mt: 2 }}>No events found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents.map(ev => (
              <Grid item xs={12} sm={6} md={4} key={ev.id}>
                <EventCard
                  event={ev}
                  onCardClick={() => navigate(`/event/${ev.id}`)}
                  onRegister={register}
                  onUnregister={unregister}
                  isRegistered={ev.isRegistered}
                  showStatus={false}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}
