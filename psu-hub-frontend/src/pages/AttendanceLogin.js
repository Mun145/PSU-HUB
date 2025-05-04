import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  Fade
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import FormikTextField from '../components/FormikTextField';
import api from '../api/axiosInstance';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

export default function AttendanceLogin() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const eventId = new URLSearchParams(search).get('eventId');
  const [doing, setDoing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!eventId) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Invalid or missing event ID. Please check the URL and try again.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          startIcon={<EventIcon />}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Fade in={true} timeout={500}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
            }
            title={
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                Confirm Attendance
              </Typography>
            }
            subheader="Please login to confirm your attendance"
          />
          <CardContent>
            {doing ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                  Recording your attendance...
                </Typography>
              </Box>
            ) : (
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={Yup.object({
                  email: Yup.string()
                    .email('Please enter a valid email address')
                    .required('Email is required'),
                  password: Yup.string()
                    .required('Password is required')
                    .min(6, 'Password must be at least 6 characters')
                })}
                onSubmit={async (vals) => {
                  try {
                    setDoing(true);
                    const { data } = await api.post('/users/login', vals);
                    localStorage.setItem('token', data.data.token);

                    await api.post('/attendance/mark', {
                      event_id: eventId,
                      scan_time: new Date().toISOString()
                    });

                    toast.success('Attendance recorded successfully!');
                    navigate('/attendance-confirmed', {
                      state: { eventId }
                    });
                  } catch (err) {
                    toast.error(
                      err.response?.data?.message || 'Login or attendance failed'
                    );
                    setDoing(false);
                  }
                }}
              >
                {({ handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit} noValidate>
                    <Stack spacing={3}>
                      <FormikTextField
                        name="email"
                        label="Email Address"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormikTextField
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting}
                        sx={{
                          py: 1.5,
                          mt: 2,
                          backgroundColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      >
                        Confirm Attendance
                      </Button>
                    </Stack>
                  </Form>
                )}
              </Formik>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
}
