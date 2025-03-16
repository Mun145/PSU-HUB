// src/pages/EditEvent.js
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Paper, Typography, Button, TextField } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import FormikTextField from '../components/FormikTextField';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then((res) => {
        const event = res.data;
        event.date = event.date ? new Date(event.date) : null;
        setInitialData(event);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching event data');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading event data...</Typography>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>PSU Hub - Edit Event</title>
        <meta name="description" content="Edit an existing event on PSU Hub." />
      </Helmet>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Edit Event</Typography>
            <Formik
              enableReinitialize
              initialValues={
                initialData || {
                  title: '',
                  description: '',
                  date: null,
                  location: ''
                }
              }
              validationSchema={Yup.object({
                title: Yup.string().required('Title is required'),
                description: Yup.string().required('Description is required'),
                date: Yup.date().nullable().required('Date is required'),
                location: Yup.string().required('Location is required')
              })}
              onSubmit={async (values) => {
                try {
                  const payload = {
                    ...values,
                    date: values.date ? values.date.toISOString() : null
                  };
                  const { data } = await api.put(`/events/${id}`, payload);
                  toast.success(data.message || 'Event updated successfully');
                  navigate('/dashboard');
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Error updating event');
                }
              }}
            >
              {({ handleSubmit, values, setFieldValue, errors, touched }) => (
                <Form onSubmit={handleSubmit} noValidate>
                  <FormikTextField name="title" label="Title" />
                  <FormikTextField name="description" label="Description" multiline rows={4} />
                  <DatePicker
                    label="Event Date"
                    value={values.date}
                    onChange={(newValue) => setFieldValue('date', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        error={touched.date && Boolean(errors.date)}
                        helperText={touched.date && errors.date}
                      />
                    )}
                  />
                  <FormikTextField name="location" label="Location" />
                  <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Update Event
                  </Button>
                </Form>
              )}
            </Formik>
          </Paper>
        </Container>
      </LocalizationProvider>
    </>
  );
};

export default EditEvent;
