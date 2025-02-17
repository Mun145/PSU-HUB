// psu-hub-frontend/src/pages/Home.js
import React from 'react';
import { Container, Paper, Typography } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to PSU Hub
        </Typography>
        <Typography variant="body1">
          PSU Hub is your centralized platform for managing community service events at PSU.
          Register, log in, create events, view analytics, and more.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Home;
