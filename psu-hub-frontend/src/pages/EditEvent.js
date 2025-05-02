import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
  Container, Paper, Typography, Button, TextField,
  FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, CircularProgress
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import FormikTextField from '../components/FormikTextField';

export default function EditEvent() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading,     setLoading]     = useState(true);

  /* ── fetch once ─────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        const ev = data.data;
        if (ev.startDate) ev.startDate = new Date(ev.startDate);
        if (ev.endDate)   ev.endDate   = new Date(ev.endDate);
        setInitialData(ev);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching event');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!initialData) return null;

  /* ── UI ─────────────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>PSU Hub – Edit Event</title>
      </Helmet>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Edit Event</Typography>

            <Formik
              enableReinitialize
              initialValues={{
                title: initialData.title,
                description: initialData.description,
                location: initialData.location,
                academicYear: initialData.academicYear || '',
                participationCategory: initialData.participationCategory || 'P',
                startDate: initialData.startDate,
                endDate:   initialData.endDate,
                totalHours: initialData.totalHours || '',
                hasCertificate: !!initialData.hasCertificate
              }}
              validationSchema={Yup.object({
                title:       Yup.string().required('Required'),
                description: Yup.string().required('Required'),
                location:    Yup.string().required('Required')
              })}
              onSubmit={async (values) => {
                try {
                  const payload = {
                    ...values,
                    // serialise correctly for backend
                    startDate: values.startDate ? values.startDate.toISOString() : null,
                    endDate:   values.endDate   ? values.endDate.toISOString()   : null,
                    hasCertificate: values.hasCertificate   // boolean
                  };
                  await api.put(`/events/${id}`, payload);
                  toast.success('Event updated');
                  navigate('/dashboard');
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Update failed');
                }
              }}
            >
              {({ handleSubmit, values, setFieldValue }) => (
                <Form
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <FormikTextField name="title"       label="Title" />
                  <FormikTextField name="description" label="Description" multiline rows={4} />
                  <FormikTextField name="location"    label="Location" />

                  <TextField
                    label="Academic Year"
                    fullWidth
                    value={values.academicYear}
                    onChange={(e) => setFieldValue('academicYear', e.target.value)}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Participation Category</InputLabel>
                    <Select
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
                    onChange={(v) => setFieldValue('startDate', v)}
                    renderInput={(p) => <TextField {...p} fullWidth />}
                  />
                  <DatePicker
                    label="End Date"
                    value={values.endDate}
                    onChange={(v) => setFieldValue('endDate', v)}
                    renderInput={(p) => <TextField {...p} fullWidth />}
                  />

                  <TextField
                    label="Total Hours"
                    type="number"
                    fullWidth
                    value={values.totalHours}
                    onChange={(e) => setFieldValue('totalHours', e.target.value)}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.hasCertificate}
                        onChange={(e) => setFieldValue('hasCertificate', e.target.checked)}
                      />
                    }
                    label="Issue certificates for this event"
                  />

                  <Button type="submit" variant="contained" sx={{ mt: 2 }}>
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
}
