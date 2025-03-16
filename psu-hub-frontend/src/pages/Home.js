// src/pages/Home.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { Container, Typography } from '@mui/material';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>PSU Hub - Home</title>
        <meta name="description" content="Welcome to PSU Hub, your platform for managing university events." />
      </Helmet>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to PSU Hub!
        </Typography>
        <Typography variant="body1">
          Manage your university events with ease.
        </Typography>
      </Container>
    </>
  );
};

export default Home;
