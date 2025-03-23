import React, { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  CardActions,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';

import {
  LocationOn as LocationOnIcon,
  CalendarMonth as CalendarMonthIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon
} from '@mui/icons-material';

/**
 * Helper to get a short month abbreviation from a Date object
 */
function getShortMonth(date) {
  return date.toLocaleString('default', { month: 'short' });
}

/**
 * BIG EventCard
 * 
 * Props:
 *   - event: { id, title, description, status, imageUrl, startDate, endDate,
 *              location, academicYear, ... }
 *   - onView, onEdit, onDelete, onApprove, onReject, onPublish, onRegister, onUnregister
 *   - isRegistered (bool)
 *   - showStatus (bool)
 */
export default function EventCard({
  event,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onPublish,
  onRegister,
  onUnregister,
  isRegistered = false,
  showStatus = true
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // For share menu
  const [shareAnchor, setShareAnchor] = useState(null);
  const handleShareClick = (e) => setShareAnchor(e.currentTarget);
  const handleShareClose = () => setShareAnchor(null);

  const handleShareCopyLink = () => {
    const link = `${window.location.origin}/event/${event.id}`;
    navigator.clipboard.writeText(link);
    handleShareClose();
  };
  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/share?url=${encodeURIComponent(
        window.location.origin + '/event/' + event.id
      )}`
    );
    handleShareClose();
  };
  const handleShareFacebook = () => {
    window.open(
      `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.origin + '/event/' + event.id
      )}`
    );
    handleShareClose();
  };

  // Create a date bubble if there's a startDate
  let dayBubble = null;
  if (event.startDate) {
    const start = new Date(event.startDate);
    dayBubble = {
      day: start.getDate(),
      month: getShortMonth(start)
    };
  }

  /**
   * Map status to MUI chip color:
   *  - published  => success
   *  - approved   => info
   *  - pending    => warning
   *  - rejected   => error
   *  - draft      => default
   */
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
    // Increase the height to make it bigger
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: event.imageUrl
      ? `url(${event.imageUrl}) center/cover no-repeat`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  // Make the card bigger & symmetrical
  const cardStyle = {
    width: isSmallScreen ? 320 : 360,
    minHeight: 420,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    mb: 3, // extra space beneath
    '&:hover': {
      boxShadow: 4,
      transform: 'translateY(-2px)',
      transition: 'all 0.2s'
    }
  };

  // Format date range
  const startString = event.startDate
    ? new Date(event.startDate).toLocaleDateString()
    : null;
  const endString = event.endDate
    ? new Date(event.endDate).toLocaleDateString()
    : null;

  return (
    <Card sx={cardStyle} elevation={3}>
      {/* TOP BOX (image or gradient) */}
      <Box sx={topBoxStyle}>
        {/* Date bubble on top-left */}
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

        {/* Status chip on top-right */}
        {getStatusChip(event.status)}
      </Box>

      {/* BODY */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {event.title}
        </Typography>

        {/* Date range / location chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {startString && endString && (
            <Chip
              icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
              label={`${startString} - ${endString}`}
              variant="outlined"
            />
          )}
          {!endString && startString && (
            <Chip
              icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
              label={startString}
              variant="outlined"
            />
          )}
          {event.location && (
            <Chip
              icon={<LocationOnIcon sx={{ fontSize: 18 }} />}
              label={event.location}
              variant="outlined"
            />
          )}
          {event.academicYear && (
            <Chip label={`AY ${event.academicYear}`} variant="outlined" />
          )}
        </Box>

        {/* Description */}
        {event.description && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            {event.description}
          </Typography>
        )}
      </Box>

      {/* ACTIONS */}
      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Box>
          {/* PSU Admin: Approve/Reject if event.status === 'pending' */}
          {onApprove && onReject && event.status?.toLowerCase() === 'pending' && (
            <>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => onApprove(event)}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => onReject(event)}
              >
                Reject
              </Button>
            </>
          )}

          {/* Admin: Publish if event.status === 'approved' */}
          {onPublish && event.status?.toLowerCase() === 'approved' && (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => onPublish(event)}
            >
              Publish
            </Button>
          )}

          {/* Faculty: Register/Unregister */}
          {onRegister && !isRegistered && (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => onRegister(event)}
            >
              Register
            </Button>
          )}
          {onUnregister && isRegistered && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onUnregister(event)}
            >
              Unregister
            </Button>
          )}
        </Box>

        <Box>
          {onView && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => onView(event)}
              sx={{ mr: 1 }}
            >
              View
            </Button>
          )}
          {onEdit && (
            <IconButton
              color="primary"
              size="small"
              onClick={() => onEdit(event)}
              sx={{ mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              color="error"
              size="small"
              onClick={() => onDelete(event)}
              sx={{ mr: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}

          {/* Share arrow & menu */}
          <IconButton size="small" onClick={handleShareClick}>
            <ShareIcon fontSize="small" />
          </IconButton>
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
  );
}
