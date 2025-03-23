// src/components/AdminEventsTab.js
import React, { useState } from 'react';
import { Box, Button, Typography, Grid, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';

export default function AdminEventsTab({ list = [], isAwaiting = false, refetchEvents, tabLabel }) {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);
  const navigate = useNavigate();

  const handleSelectEvent = (id) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allSelected = list.every((ev) => selectedEvents.includes(ev.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(list.map((ev) => ev.id));
    }
  };

  const publishEvent = async (id) => {
    try {
      await api.patch(`/events/publish/${id}`);
      toast.success('Event published');
      refetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error publishing event');
    }
  };

  const bulkPublish = async () => {
    const promises = list
      .filter((ev) => selectedEvents.includes(ev.id))
      .map((ev) =>
        api
          .patch(`/events/publish/${ev.id}`)
          .then(() => toast.success(`Published: ${ev.title}`))
          .catch((err) => toast.error(err.response?.data?.message || 'Error publishing event'))
      );
    await Promise.all(promises);
    refetchEvents();
    setSelectedEvents([]);
  };

  const bulkDelete = async () => {
    const promises = list
      .filter((ev) => selectedEvents.includes(ev.id))
      .map((ev) =>
        api
          .delete(`/events/${ev.id}`)
          .then(() => toast.success(`Deleted: ${ev.title}`))
          .catch((err) => toast.error(err.response?.data?.message || 'Error deleting event'))
      );
    await Promise.all(promises);
    refetchEvents();
    setSelectedEvents([]);
  };

  const handlePreview = (ev) => {
    setPreviewEvent(ev);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewEvent(null);
  };

  if (!list.length) {
    return <Typography>No {tabLabel.toLowerCase()} events.</Typography>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={toggleSelectAll}>
          {allSelected ? 'Unselect All' : 'Select All'}
        </Button>
        {isAwaiting && (
          <Button variant="contained" disabled={selectedEvents.length === 0} onClick={bulkPublish}>
            Bulk Publish
          </Button>
        )}
        <Button variant="outlined" color="error" disabled={selectedEvents.length === 0} onClick={bulkDelete}>
          Bulk Delete
        </Button>
      </Box>
      <Grid container spacing={2}>
        {list.map((ev) => {
          const checked = selectedEvents.includes(ev.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Box sx={{ position: 'relative' }}>
                <Checkbox
                  checked={checked}
                  onChange={() => handleSelectEvent(ev.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                  }}
                />
                <EventCard
                  event={ev}
                  onPreview={handlePreview}
                  onEdit={() => navigate(`/edit-event/${ev.id}`)}
                  onDelete={async () => {
                    try {
                      await api.delete(`/events/${ev.id}`);
                      toast.success(`Deleted: ${ev.title}`);
                      refetchEvents();
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Error deleting event');
                    }
                  }}
                  showStatus={true}
                />
                {isAwaiting && (
                  <Button variant="contained" size="small" onClick={() => publishEvent(ev.id)} sx={{ mt: 1 }}>
                    Publish
                  </Button>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
      <Dialog open={previewOpen} onClose={closePreview} maxWidth="sm" fullWidth>
        <DialogTitle>Event Preview</DialogTitle>
        <DialogContent dividers>
          {previewEvent ? (
            <>
              {previewEvent.imageUrl && (
                <Box component="img" src={previewEvent.imageUrl} alt="Event Preview" sx={{ width: '100%', mb: 2 }} />
              )}
              <Typography variant="h6">{previewEvent.title}</Typography>
              <Typography sx={{ mb: 1 }}>{previewEvent.description}</Typography>
              {previewEvent.startDate && (
                <Typography>
                  Start: {new Date(previewEvent.startDate).toLocaleDateString()}
                </Typography>
              )}
              {previewEvent.endDate && (
                <Typography>
                  End: {new Date(previewEvent.endDate).toLocaleDateString()}
                </Typography>
              )}
              <Typography>Status: {previewEvent.status}</Typography>
            </>
          ) : (
            <Typography>No event selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
