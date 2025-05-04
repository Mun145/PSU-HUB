import React from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Fade,
  Stack,
  Divider
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle as CheckCircleIcon, Home as HomeIcon } from '@mui/icons-material';

export default function AttendanceConfirmed() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const eventId = state?.eventId;

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Fade in={true} timeout={500}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ mb: 3 }}>
              <CheckCircleIcon
                color="success"
                sx={{ fontSize: 80, mb: 2 }}
              />
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Attendance Recorded Successfully
              </Typography>
            </Box>
            
            <Stack spacing={2} divider={<Divider />}>
              <Typography variant="body1" color="text.secondary">
                {eventId ? `Event ID: #${eventId}` : 'Your attendance has been recorded'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                You may now close this tab or return to PSU-Hub
              </Typography>
              
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Return to PSU-Hub
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
}
