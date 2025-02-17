// psu-hub-frontend/src/pages/Certificate.js
import React from 'react';
import { Container, Paper, Typography, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const Certificate = () => {
  const location = useLocation();
  const { certificate } = location.state || {};

  if (!certificate) {
    toast.error("No certificate data found.");
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4">Certificate</Typography>
          <Typography>No certificate data available. Please complete the survey to generate your certificate.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Certificate of Participation</Typography>
        <Typography><strong>Certificate ID:</strong> {certificate.certificateId}</Typography>
        <Typography><strong>Event ID:</strong> {certificate.eventId}</Typography>
        <Typography><strong>User ID:</strong> {certificate.userId}</Typography>
        <Typography><strong>Issued At:</strong> {new Date(certificate.issuedAt).toLocaleString()}</Typography>
        <Typography>{certificate.message}</Typography>
        <Button variant="contained" onClick={() => window.print()} sx={{ mt: 2 }}>Print Certificate</Button>
      </Paper>
    </Container>
  );
};

export default Certificate;
