// psu-hub-frontend/src/pages/NotificationsPage.js
import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationsPage = () => {
  const { notifications, clearNotifications, removeNotification } = useNotifications();

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Notifications
        </Typography>
        {notifications.length === 0 ? (
          <Typography>No notifications.</Typography>
        ) : (
          <Box>
            {notifications.map((notif) => (
              <Paper key={notif.id} elevation={2} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">{notif.message}</Typography>
                <Button variant="text" color="error" onClick={() => removeNotification(notif.id)}>Dismiss</Button>
              </Paper>
            ))}
            <Button variant="contained" color="primary" onClick={clearNotifications} sx={{ mt: 2 }}>
              Clear All
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;
