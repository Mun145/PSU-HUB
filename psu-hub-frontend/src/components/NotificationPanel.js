// psu-hub-frontend/src/components/NotificationPanel.js
import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const NotificationPanel = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div style={{ position: 'fixed', top: '70px', right: '20px', zIndex: 1000 }}>
      {notifications.map((n) => (
        <Card key={n.id} sx={{ mb: 1 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">{n.message}</Typography>
            <IconButton size="small" onClick={() => removeNotification(n.id)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationPanel;
