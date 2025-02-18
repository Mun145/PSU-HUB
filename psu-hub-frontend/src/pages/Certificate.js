// psu-hub-frontend/src/pages/Certificate.js
import React from 'react';
import { Container, Paper, Typography, Button, Fade } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const Certificate = () => {
  const location = useLocation();
  const { certificate } = location.state || {};

  if (!certificate) {
    toast.error("No certificate data found.");
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5">Certificate</Typography>
          <Typography>
            No certificate data available. Please complete the survey to generate your certificate.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={1000}>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Certificate of Participation
          </Typography>
          <Typography variant="body1">
            <strong>Certificate ID:</strong> {certificate.certificateId}
          </Typography>
          <Typography variant="body1">
            <strong>Event ID:</strong> {certificate.eventId}
          </Typography>
          <Typography variant="body1">
            <strong>User ID:</strong> {certificate.userId}
          </Typography>
          <Typography variant="body1">
            <strong>Issued At:</strong> {new Date(certificate.issuedAt).toLocaleString()}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {certificate.message}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.print()}
            sx={{ mt: 3 }}
          >
            Print Certificate
          </Button>
        </Paper>
      </Container>
    </Fade>
  );
};

export default Certificate;
