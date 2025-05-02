import React, { useState } from 'react';
import {
  Container, Paper, Typography, Button, Box, CircularProgress
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import FormikTextField from '../components/FormikTextField';
import api from '../api/axiosInstance';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

export default function AttendanceLogin() {
  const { search } = useLocation();
  const navigate   = useNavigate();
  const eventId    = new URLSearchParams(search).get('eventId');

  const [doing, setDoing] = useState(false);

  if (!eventId) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6">Invalid / missing event ID.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Confirm your attendance
        </Typography>

        {doing ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Recording attendance…</Typography>
          </Box>
        ) : (
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={Yup.object({
              email: Yup.string().email('Invalid email').required('Required'),
              password: Yup.string().required('Required')
            })}
            onSubmit={async (vals) => {
              try {
                setDoing(true);
                // 1) Login
                const { data } = await api.post('/users/login', vals);
                localStorage.setItem('token', data.data.token);

                // 2) Mark attendance
                await api.post('/attendance/mark', {
                  event_id: eventId,
                  scan_time: new Date().toISOString()
                });

                toast.success('Attendance recorded!');
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
            {({ handleSubmit }) => (
              <Form onSubmit={handleSubmit} noValidate>
                <FormikTextField name="email" label="Email" fullWidth sx={{ mb: 2 }} />
                <FormikTextField name="password" label="Password" type="password" fullWidth sx={{ mb: 3 }} />
                <Button type="submit" variant="contained" fullWidth>
                  Confirm Attendance
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Paper>
    </Container>
  );
}
