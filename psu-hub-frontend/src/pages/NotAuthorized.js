// src/pages/NotAuthorized.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotAuthorized = () => {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>PSU Hub - Not Authorized</title>
        <meta name="description" content="You do not have permission to view this page." />
      </Helmet>
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          403 - Not Authorized
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You do not have permission to view this page.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Container>
    </>
  );
};

export default NotAuthorized;
