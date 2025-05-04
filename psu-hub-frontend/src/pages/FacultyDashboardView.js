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
  Skeleton,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import EventCard from '../components/EventCard';

export default function FacultyDashboardView({ events, setEvents }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);

  /* ───────────────────────────────── STATE ───────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [range, setRange] = useState('all');  // all | upcoming | past

  /* ─────────────────────────────── FETCH DATA ────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/events/faculty');
        setEvents(res.data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching faculty events');
      } finally {
        setLoading(false);
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
  const register = async ev => {
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

  /* ───────────────────────────────── UI ──────────────────────────────────── */
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1"
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          Faculty Dashboard
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Manage and view your events
        </Typography>
      </Box>

      <Paper 
        sx={{ 
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        {/* ───── Toolbar ───── */}
        <Stack 
          direction={isMobile ? "column" : "row"} 
          spacing={2} 
          sx={{ mb: 3 }}
        >
          <TextField
            label="Search events"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="small"
            fullWidth={isMobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 140 }}>
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

          <ToggleButtonGroup
            exclusive
            color="primary"
            size="small"
            value={range}
            onChange={(e, val) => val && setRange(val)}
            sx={{ 
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              '& .MuiToggleButton-root': {
                flex: isMobile ? '1 1 auto' : 'none'
              }
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="upcoming">Upcoming</ToggleButton>
            <ToggleButton value="past">Past</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* ───── Results ───── */}
        {loading ? (
          renderLoadingSkeleton()
        ) : filteredEvents.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body1">
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'There are no events matching your current filters'}
            </Typography>
          </Box>
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
