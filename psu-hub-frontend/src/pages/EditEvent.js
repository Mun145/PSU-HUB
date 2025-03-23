// src/pages/EditEvent.js
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Paper, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
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
        const event = res.data.data;
        if (event.startDate) event.startDate = new Date(event.startDate);
        if (event.endDate) event.endDate = new Date(event.endDate);
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
              initialValues={{
                title: initialData?.title || '',
                description: initialData?.description || '',
                location: initialData?.location || '',
                academicYear: initialData?.academicYear || '',
                participationCategory: initialData?.participationCategory || 'P',
                startDate: initialData?.startDate || null,
                endDate: initialData?.endDate || null,
                totalHours: initialData?.totalHours || ''
              }}
              validationSchema={Yup.object({
                title: Yup.string().required('Title is required'),
                description: Yup.string().required('Description is required'),
                location: Yup.string().required('Location is required')
              })}
              onSubmit={async (values) => {
                try {
                  const payload = {
                    ...values,
                    startDate: values.startDate ? values.startDate.toISOString() : null,
                    endDate: values.endDate ? values.endDate.toISOString() : null
                  };
                  const res = await api.put(`/events/${id}`, payload);
                  toast.success(res.data.message || 'Event updated successfully');
                  navigate('/dashboard');
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Error updating event');
                }
              }}
            >
              {({ handleSubmit, values, setFieldValue, errors, touched }) => (
                <Form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FormikTextField name="title" label="Title" />
                  <FormikTextField name="description" label="Description" multiline rows={4} />
                  <FormikTextField name="location" label="Location" />
                  <TextField
                    label="Academic Year"
                    fullWidth
                    margin="normal"
                    name="academicYear"
                    value={values.academicYear}
                    onChange={(e) => setFieldValue('academicYear', e.target.value)}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="participationCategory-label">Participation Category</InputLabel>
                    <Select
                      labelId="participationCategory-label"
                      name="participationCategory"
                      value={values.participationCategory}
                      label="Participation Category"
                      onChange={(e) => setFieldValue('participationCategory', e.target.value)}
                    >
                      <MenuItem value="P">Participation Only (P)</MenuItem>
                      <MenuItem value="PAE">Planned & Actively Engaged (PAE)</MenuItem>
                    </Select>
                  </FormControl>
                  <DatePicker
                    label="Start Date"
                    value={values.startDate}
                    onChange={(newValue) => setFieldValue('startDate', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                  <DatePicker
                    label="End Date"
                    value={values.endDate}
                    onChange={(newValue) => setFieldValue('endDate', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                  <TextField
                    label="Total Hours"
                    type="number"
                    fullWidth
                    margin="normal"
                    name="totalHours"
                    value={values.totalHours}
                    onChange={(e) => setFieldValue('totalHours', e.target.value)}
                  />
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
