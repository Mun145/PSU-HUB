// src/pages/NotificationsPage.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        setNotifications(res.data.data || res.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching notifications');
      });
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Notifications</Typography>
      {notifications.length === 0 ? (
        <Typography>No notifications</Typography>
      ) : (
        <List>
          {notifications.map((n) => (
            <ListItem key={n.id}>
              <ListItemText primary={n.message} secondary={n.timestamp} />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}

export default NotificationsPage;
