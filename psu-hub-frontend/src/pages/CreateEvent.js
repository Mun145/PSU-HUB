// src/pages/CreateEvent.js
import React, { useState } from 'react';
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
  MenuItem
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Start/End Date
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Additional fields
  const [academicYear, setAcademicYear] = useState('');
  const [participationCategory, setParticipationCategory] = useState('P');
  const [totalHours, setTotalHours] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);

      if (startDate) {
        formData.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        formData.append('endDate', endDate.toISOString());
      }
      formData.append('academicYear', academicYear);
      formData.append('participationCategory', participationCategory);
      formData.append('totalHours', totalHours);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.post('/events/create-with-image', formData);
      toast.success(res.data.message || 'Event created successfully');

      // Reset
      setTitle('');
      setDescription('');
      setLocation('');
      setStartDate(null);
      setEndDate(null);
      setAcademicYear('');
      setParticipationCategory('P');
      setTotalHours('');
      setImageFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating event');
    }
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub - Create Event</title>
        <meta name="description" content="Create a new event on PSU Hub." />
      </Helmet>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h5" gutterBottom>
              Create Event
            </Typography>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <TextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
              <TextField
                label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
              <FormControl>
                <InputLabel>Participation Category</InputLabel>
                <Select
                  value={participationCategory}
                  onChange={(e) => setParticipationCategory(e.target.value)}
                  label="Participation Category"
                >
                  <MenuItem value="P">Participation Only (P)</MenuItem>
                  <MenuItem value="PAE">Planned & Actively Engaged (PAE)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Total Hours"
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
              />
              <div>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Image (optional):
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </div>
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Create Event
              </Button>
            </form>
          </Paper>
        </Container>
      </LocalizationProvider>
    </>
  );
};

export default CreateEvent;
