// src/components/AdminEventsTab.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import EventCard from './EventCard';

export default function AdminEventsTab({
  list = [],
  isAwaiting = false,
  refetchEvents,
  tabLabel
}) {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);

  // For the separate QR Code dialog
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const navigate = useNavigate();

  // Bulk selection
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

  // Publish
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
          .catch((err) =>
            toast.error(err.response?.data?.message || 'Error publishing event')
          )
      );
    await Promise.all(promises);
    refetchEvents();
    setSelectedEvents([]);
  };

  // Bulk delete
  const bulkDelete = async () => {
    const promises = list
      .filter((ev) => selectedEvents.includes(ev.id))
      .map((ev) =>
        api
          .delete(`/events/${ev.id}`)
          .then(() => toast.success(`Deleted: ${ev.title}`))
          .catch((err) =>
            toast.error(err.response?.data?.message || 'Error deleting event')
          )
      );
    await Promise.all(promises);
    refetchEvents();
    setSelectedEvents([]);
  };

  // "Preview" modal
  const handlePreview = (ev) => {
    setPreviewEvent(ev);
    setPreviewOpen(true);
  };
  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewEvent(null);
  };

  // QR dialog
  const handleOpenQrDialog = () => {
    setQrDialogOpen(true);
  };
  const handleCloseQrDialog = () => {
    setQrDialogOpen(false);
  };

  const handleDownloadQR = () => {
    if (!previewEvent || !previewEvent.qr_code) return;
    const link = document.createElement('a');
    link.href = previewEvent.qr_code;
    // e.g. "MyEvent_qr.png"
    link.download = `${previewEvent.title.replace(/\s+/g, '_')}_qr.png`;
    link.click();
  };

  if (!list.length) {
    return <Typography>No {tabLabel.toLowerCase()} events.</Typography>;
  }

  return (
    <>
      {/* Bulk actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={toggleSelectAll}>
          {allSelected ? 'Unselect All' : 'Select All'}
        </Button>
        {isAwaiting && (
          <Button
            variant="contained"
            disabled={selectedEvents.length === 0}
            onClick={bulkPublish}
          >
            Bulk Publish
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          disabled={selectedEvents.length === 0}
          onClick={bulkDelete}
        >
          Bulk Delete
        </Button>
      </Box>

      {/* The event grid */}
      <Grid container spacing={2}>
        {list.map((ev) => {
          const checked = selectedEvents.includes(ev.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Box sx={{ position: 'relative' }}>
                {/* The bulk-select checkbox */}
                <Checkbox
                  checked={checked}
                  onChange={() => handleSelectEvent(ev.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(255,255,255,0.7)'
                  }}
                />
                <EventCard
                  event={ev}
                  onCardClick={handlePreview} // entire card is clickable => open preview
                  onEdit={() => navigate(`/edit-event/${ev.id}`)}
                  onDelete={async () => {
                    try {
                      await api.delete(`/events/${ev.id}`);
                      toast.success(`Deleted: ${ev.title}`);
                      refetchEvents();
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message || 'Error deleting event'
                      );
                    }
                  }}
                  onPublish={(event) => publishEvent(event.id)}
                  showStatus
                />
                {isAwaiting && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => publishEvent(ev.id)}
                    sx={{ mt: 1 }}
                  >
                    Publish
                  </Button>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Main preview modal */}
      <Dialog open={previewOpen} onClose={closePreview} maxWidth="sm" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent dividers>
          {previewEvent ? (
            <>
              {previewEvent.imageUrl && (
                <Box
                  component="img"
                  src={previewEvent.imageUrl}
                  alt="Event Preview"
                  sx={{ width: '100%', mb: 2, borderRadius: 1 }}
                />
              )}

              <Typography variant="h6" sx={{ mb: 1 }}>
                {previewEvent.title}
              </Typography>

              {/* Start/End date */}
              {previewEvent.startDate && (
                <Typography variant="body2">
                  Start: {new Date(previewEvent.startDate).toLocaleDateString()}
                </Typography>
              )}
              {previewEvent.endDate && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  End: {new Date(previewEvent.endDate).toLocaleDateString()}
                </Typography>
              )}

              <Typography variant="body2" sx={{ mb: 1 }}>
                Status: {previewEvent.status}
              </Typography>

              {previewEvent.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {previewEvent.description}
                </Typography>
              )}
            </>
          ) : (
            <Typography>No event selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {/* Show "QR Code" button if the event has a qr_code */}
          {previewEvent?.qr_code && (
            <Button variant="outlined" onClick={handleOpenQrDialog}>
              QR Code
            </Button>
          )}
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Secondary QR Code dialog */}
      <Dialog open={qrDialogOpen} onClose={handleCloseQrDialog}>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent dividers sx={{ textAlign: 'center' }}>
          {previewEvent?.qr_code ? (
            <Box>
              <Box
                component="img"
                src={previewEvent.qr_code}
                alt="QR Code"
                sx={{ width: '250px', mb: 2 }}
              />
              <Typography variant="body2">
                This QR is for event: {previewEvent.title}
              </Typography>
            </Box>
          ) : (
            <Typography>No QR code available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {previewEvent?.qr_code && (
            <Button variant="outlined" onClick={handleDownloadQR}>
              Download
            </Button>
          )}
          <Button onClick={handleCloseQrDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
