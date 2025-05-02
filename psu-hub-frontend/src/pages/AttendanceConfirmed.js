import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AttendanceConfirmed() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const eventId   = state?.eventId;

  return (
    <Container sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Attendance Recorded 🎉
      </Typography>
      <Typography sx={{ mb: 4 }}>
        {eventId ? `For event #${eventId}` : ''}
        <br />
        You may close this tab.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go to PSU-Hub
      </Button>
    </Container>
  );
}
