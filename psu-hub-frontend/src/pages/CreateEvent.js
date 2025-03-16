// src/pages/CreateEvent.js
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Paper, Typography, Button, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState('');

  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (date) {
        formData.append('date', date.toISOString());
      }
      formData.append('location', location);

      if (imageFile) {
        formData.append('image', imageFile); 
      }

      const res = await api.post('/events/create-with-image', formData);

      toast.success(res.data.message || 'Event created successfully');
      // reset fields
      setTitle('');
      setDescription('');
      setDate(null);
      setLocation('');
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
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Create Event
            </Typography>
            <form onSubmit={handleSubmit} noValidate>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <DatePicker
                label="Event Date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
              <TextField
                label="Location"
                fullWidth
                margin="normal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              {/* For file upload (optional) */}
              <Typography variant="body2" sx={{ mt: 2 }}>
                Image (optional):
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />

              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
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
