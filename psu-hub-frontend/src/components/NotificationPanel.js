// NotificationPanel.js
import React from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationPanel = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <Box sx={{ position: 'fixed', top: 70, right: 20, zIndex: 9999 }}>
      {notifications.map((notif) => (
        <Paper key={notif.id} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {notif.message}
          </Typography>
          <IconButton size="small" onClick={() => removeNotification(notif.id)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      ))}
    </Box>
  );
};

export default NotificationPanel;
