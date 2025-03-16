// src/pages/PendingEventsPage.js
import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Pagination,
  Paper,
  styled,
  Typography as MuiTypography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const StatusLabel = styled(MuiTypography)(({ theme, status }) => {
  let color;
  switch (status?.toLowerCase()) {
    case 'pending':
      color = 'orange';
      break;
    case 'approved':
      color = 'green';
      break;
    case 'rejected':
      color = 'red';
      break;
    default:
      color = theme.palette.text.primary;
  }
  return { color, fontWeight: 'bold' };
});

const ITEMS_PER_PAGE = 24; // Fixed page size

const PendingEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal state for event details
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(''); // 'approve' or 'reject'
  const [selectedEventId, setSelectedEventId] = useState(null);

  const { user } = useContext(AuthContext);
  const userRole = user ? user.role : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'psu_admin') {
      navigate('/not-authorized');
      return;
    }
    setLoading(true);
    api.get('/events')
      .then((res) => {
        // Filter for pending events only
        const allEvents = res.data.data;
        const pending = allEvents.filter((e) => e.status === 'pending');
        setEvents(pending);
        setFilteredEvents(pending);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching events');
      })
      .finally(() => setLoading(false));
  }, [userRole, navigate]);

  // Filter events based on search query
  useEffect(() => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, events]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handlers for modals
  const handleOpenDetails = (event) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setDetailsOpen(false);
  };

  const handleOpenConfirm = (eventId, action) => {
    setSelectedEventId(eventId);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setSelectedEventId(null);
    setConfirmAction('');
    setConfirmOpen(false);
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'approve') {
      api.patch(`/events/approve/${selectedEventId}`)
        .then(() => {
          toast.success('Event approved successfully');
          setEvents(events.filter(event => event.id !== selectedEventId));
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Error approving event');
        });
    } else if (confirmAction === 'reject') {
      api.patch(`/events/reject/${selectedEventId}`)
        .then(() => {
          toast.success('Event rejected successfully');
          setEvents(events.filter(event => event.id !== selectedEventId));
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Error rejecting event');
        });
    }
    handleCloseConfirm();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading pending events...</Typography>
      </Container>
    );
  }

  if (!filteredEvents.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>No pending events.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pending Events
      </Typography>
      <TextField
        fullWidth
        label="Search by Title"
        variant="outlined"
        sx={{ mb: 2 }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Grid container spacing={2}>
        {paginatedEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card>
              {event.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={event.imageUrl}
                  alt="Event image"
                />
              )}
              <CardContent>
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2">{event.description}</Typography>
                <Typography>
                  Date: {new Date(event.date).toLocaleDateString()}
                </Typography>
                <StatusLabel variant="body2" status={event.status}>
                  Status: {event.status}
                </StatusLabel>
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={() => handleOpenConfirm(event.id, 'approve')}>
                  Accept
                </Button>
                <Button variant="outlined" color="error" onClick={() => handleOpenConfirm(event.id, 'reject')}>
                  Deny
                </Button>
                <Button variant="text" onClick={() => handleOpenDetails(event)}>
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={(e, page) => setCurrentPage(page)} 
            color="primary" 
          />
        </Box>
      )}

      {/* Details Modal */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent dividers>
          {selectedEvent ? (
            <>
              <Typography variant="h6">{selectedEvent.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Date: {new Date(selectedEvent.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                Location: {selectedEvent.location || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Organizer: {selectedEvent.organizer || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Attendee Count: {selectedEvent.attendeeCount || 0}
              </Typography>
              <StatusLabel variant="body2" status={selectedEvent.status} sx={{ mt: 1 }}>
                Status: {selectedEvent.status}
              </StatusLabel>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Description: {selectedEvent.description}
              </Typography>
            </>
          ) : (
            <Typography>Loading event details...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>
          {confirmAction === 'approve' ? 'Approve Event' : 'Reject Event'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmAction === 'approve' ? 'approve' : 'reject'} this event?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={handleConfirmAction} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PendingEventsPage;
