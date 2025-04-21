// src/components/EventCard.js
import React, { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  Button,
  CardActions,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import fullUrl from '../utils/fullUrl';

/** Helper to get a short month abbreviation from a Date object */
function getShortMonth(date) {
  return date.toLocaleString('default', { month: 'short' });
}

/**
 * EventCard component
 * 
 * Props:
 *   - event: object with event details
 *   - onCardClick: function(eventObj) called when card (outside of specific buttons) is clicked
 *   - onApprove(eventObj)
 *   - onReject(eventObj)
 *   - onPublish(eventObj)
 *   - onRegister(eventObj)
 *   - onUnregister(eventObj)
 *   - onEdit(eventObj)
 *   - onDelete(eventObj)
 *   - onQRCode(eventObj): function called when "QR Code" button is clicked
 *   - isRegistered (bool)
 *   - showStatus (bool)
 */
export default function EventCard({
  event,
  onCardClick,
  onApprove,
  onReject,
  onPublish,
  onRegister,
  onUnregister,
  onEdit,
  onDelete,
  onQRCode, // NEW prop for QR Code functionality
  isRegistered = false,
  showStatus = true
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // State for share menu (using plain text instead of icons)
  const [shareAnchor, setShareAnchor] = useState(null);
  const handleShareClick = (e) => {
    e.stopPropagation(); // prevent card click
    setShareAnchor(e.currentTarget);
  };
  const handleShareClose = () => setShareAnchor(null);

  const handleShareCopyLink = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/event/${event.id}`;
    navigator.clipboard.writeText(link);
    handleShareClose();
  };
  const handleShareTwitter = (e) => {
    e.stopPropagation();
    window.open(
      `https://twitter.com/share?url=${encodeURIComponent(window.location.origin + '/event/' + event.id)}`
    );
    handleShareClose();
  };
  const handleShareFacebook = (e) => {
    e.stopPropagation();
    window.open(
      `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/event/' + event.id)}`
    );
    handleShareClose();
  };

  // Calculate date bubble from startDate
  let dayBubble = null;
  if (event.startDate) {
    const start = new Date(event.startDate);
    dayBubble = {
      day: start.getDate(),
      month: getShortMonth(start)
    };
  }

  // Map event status to a chip color
  const getStatusChip = (status) => {
    if (!status || !showStatus) return null;
    let color;
    switch (status.toLowerCase()) {
      case 'published':
        color = 'success';
        break;
      case 'approved':
        color = 'info';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'rejected':
        color = 'error';
        break;
      case 'draft':
      default:
        color = 'default';
        break;
    }
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={color}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          textTransform: 'capitalize'
        }}
      />
    );
  };

  // Top box style (image or fallback gradient)
  const topBoxStyle = {
    position: 'relative',
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: event.imageUrl
      ? `url(${event.imageUrl}) center/cover no-repeat`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  // Card style – clickable with hover effect
  const cardStyle = {
    width: isSmallScreen ? 320 : 360,
    minHeight: 420,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    mb: 3,
    cursor: onCardClick ? 'pointer' : 'default',
    '&:hover': {
      boxShadow: 4,
      transform: 'translateY(-2px)',
      transition: 'all 0.2s'
    }
  };

  // Format dates
  const startString = event.startDate
    ? new Date(event.startDate).toLocaleDateString()
    : null;
  const endString = event.endDate
    ? new Date(event.endDate).toLocaleDateString()
    : null;

  // State and handler for QR Code modal (for admins)
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const handleOpenQrModal = (e) => {
    e.stopPropagation();
    setQrModalOpen(true);
  };
  const handleCloseQrModal = () => setQrModalOpen(false);

  return (
    <>
      <Card
        sx={cardStyle}
        elevation={3}
        onClick={() => {
          if (onCardClick) onCardClick(event);
        }}
      >
        {/* Top section with image or gradient */}
        <Box sx={topBoxStyle}>
          {dayBubble && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                width: 50,
                height: 50,
                borderRadius: '8px',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333',
                boxShadow: 2
              }}
            >
              <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
                {dayBubble.day}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1 }}>
                {dayBubble.month}
              </Typography>
            </Box>
          )}
          {getStatusChip(event.status)}
        </Box>

        {/* Body content */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {startString && endString && (
              <Chip label={`${startString} - ${endString}`} variant="outlined" />
            )}
            {!endString && startString && (
              <Chip label={startString} variant="outlined" />
            )}
            {event.location && (
              <Chip label={event.location} variant="outlined" />
            )}
            {event.academicYear && (
              <Chip label={`AY ${event.academicYear}`} variant="outlined" />
            )}
          </Box>
          {event.description && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {event.description}
            </Typography>
          )}
        </Box>

        {/* Action buttons */}
        <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
          <Box>
            {onApprove && onReject && event.status?.toLowerCase() === 'pending' && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(event);
                  }}
                  sx={{ mr: 1 }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(event);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {onPublish && event.status?.toLowerCase() === 'approved' && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(event);
                }}
              >
                Publish
              </Button>
            )}
            {onRegister && !isRegistered && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister(event);
                }}
              >
                Register
              </Button>
            )}
            {onUnregister && isRegistered && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnregister(event);
                }}
              >
                Unregister
              </Button>
            )}
          </Box>

          <Box>
            {onEdit && (
              <Button
                variant="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event);
                }}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event);
                }}
                sx={{ mr: 1 }}
              >
                Delete
              </Button>
            )}
            {/* New QR Code button: Only show if onQRCode prop is provided */}
            {onQRCode && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenQrModal}
                sx={{ mr: 1 }}
              >
                QR Code
              </Button>
            )}
            {/* Share button using text */}
            <Button
              variant="outlined"
              size="small"
              onClick={handleShareClick}
            >
              Share
            </Button>
            <Menu
              anchorEl={shareAnchor}
              open={Boolean(shareAnchor)}
              onClose={handleShareClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleShareCopyLink}>Copy Link</MenuItem>
              <MenuItem onClick={handleShareTwitter}>Share to Twitter</MenuItem>
              <MenuItem onClick={handleShareFacebook}>Share to Facebook</MenuItem>
            </Menu>
          </Box>
        </CardActions>
      </Card>

      {/* QR Code Modal (only if QR Code button is clicked) */}
      <Dialog open={qrModalOpen} onClose={handleCloseQrModal}>
        <DialogTitle>QR Code for {event.title}</DialogTitle>
        <DialogContent>
          {event.qr_code ? (
            <Box
              component="img"
              src={fullUrl(event.qr_code)} 
              alt="QR Code"
              sx={{ width: '100%', maxWidth: 300, mx: 'auto' }}
            />
          ) : (
            <Typography>No QR Code available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // Download QR Code image
              if (event.qr_code) {
                const link = document.createElement('a');
                link.href     = fullUrl(event.qr_code);
                link.download = `${event.title.replace(/\s+/g, '_')}_qr.png`;
                link.click();
              }
            }}
          >
            Download QR Code
          </Button>
          <Button onClick={handleCloseQrModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
