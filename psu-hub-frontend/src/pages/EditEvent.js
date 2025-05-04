import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
  Container, 
  Paper, 
  Typography, 
  Button, 
  TextField,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormControlLabel, 
  Checkbox, 
  CircularProgress,
  Box,
  Stack,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
  Alert,
  IconButton,
  Skeleton
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import FormikTextField from '../components/FormikTextField';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((index) => (
        <Grid item xs={12} key={index}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          {renderLoadingSkeleton()}
        </Paper>
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
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper 
            sx={{ 
              p: 4,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <EditIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }}
                >
                  Edit Event
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                >
                  Update the details of your event
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mb: 3 }}>
              All fields marked with * are required. Make sure to provide accurate information for better event management.
            </Alert>

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
                setSubmitting(true);
                try {
                  const payload = {
                    ...values,
                    startDate: values.startDate ? values.startDate.toISOString() : null,
                    endDate:   values.endDate   ? values.endDate.toISOString()   : null,
                    hasCertificate: values.hasCertificate
                  };
                  await api.put(`/events/${id}`, payload);
                  toast.success('Event updated successfully');
                  navigate('/dashboard');
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Update failed');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ handleSubmit, values, setFieldValue }) => (
                <Form>
                  <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Basic Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <FormikTextField 
                        name="title" 
                        label="Event Title"
                        InputProps={{
                          startAdornment: (
                            <EventIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormikTextField 
                        name="description" 
                        label="Description" 
                        multiline 
                        rows={4}
                        InputProps={{
                          startAdornment: (
                            <DescriptionIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormikTextField 
                        name="location" 
                        label="Location"
                        InputProps={{
                          startAdornment: (
                            <LocationOnIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    {/* Date and Time */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Date and Time
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Start Date"
                        value={values.startDate}
                        onChange={(v) => setFieldValue('startDate', v)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <EventIcon color="action" sx={{ mr: 1 }} />
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="End Date"
                        value={values.endDate}
                        onChange={(v) => setFieldValue('endDate', v)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <EventIcon color="action" sx={{ mr: 1 }} />
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Additional Information */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Additional Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Academic Year"
                        fullWidth
                        value={values.academicYear}
                        onChange={(e) => setFieldValue('academicYear', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <SchoolIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Participation Category</InputLabel>
                        <Select
                          value={values.participationCategory}
                          label="Participation Category"
                          onChange={(e) => setFieldValue('participationCategory', e.target.value)}
                          startAdornment={
                            <CategoryIcon color="action" sx={{ mr: 1 }} />
                          }
                        >
                          <MenuItem value="P">Participation Only (P)</MenuItem>
                          <MenuItem value="PAE">Planned & Actively Engaged (PAE)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Total Hours"
                        type="number"
                        fullWidth
                        value={values.totalHours}
                        onChange={(e) => setFieldValue('totalHours', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.hasCertificate}
                            onChange={(e) => setFieldValue('hasCertificate', e.target.checked)}
                            icon={<CardGiftcardIcon />}
                            checkedIcon={<CardGiftcardIcon color="primary" />}
                          />
                        }
                        label="Issue certificates for this event"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowBackIcon />}
                          onClick={() => navigate('/dashboard')}
                          fullWidth
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary"
                          fullWidth
                          disabled={submitting}
                        >
                          {submitting ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Update Event'
                          )}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Paper>
        </Container>
      </LocalizationProvider>
    </>
  );
}
