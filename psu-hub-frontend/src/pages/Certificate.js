// src/pages/Certificate.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

const Certificate = () => {
  const location = useLocation();
  const certificateData = location.state;

  return (
    <>
      <Helmet>
        <title>PSU Hub - Certificate</title>
        <meta name="description" content="View or print your certificate from PSU Hub." />
      </Helmet>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {certificateData ? (
            <>
              <Typography variant="h4" gutterBottom>
                Certificate of Attendance
              </Typography>
              <Typography variant="body1">
                This certifies that <strong>{certificateData.name}</strong> has attended the event{' '}
                <strong>{certificateData.eventTitle}</strong> on{' '}
                <strong>{new Date(certificateData.date).toLocaleDateString()}</strong>.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary">
                  Print Certificate
                </Button>
              </Box>
            </>
          ) : (
            <Typography>No certificate data available.</Typography>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Certificate;
