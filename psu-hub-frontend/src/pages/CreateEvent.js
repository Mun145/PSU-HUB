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
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Stack,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AdminHelperChatbot from '../components/AdminHelperChatbot';


const CreateEvent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Start/End Date
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Additional fields
  const [academicYear, setAcademicYear] = useState('');
  const [participationCategory, setParticipationCategory] = useState('P');
  const [totalHours, setTotalHours] = useState('');
  const [hasCertificate, setHasCertificate] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      formData.append('hasCertificate', hasCertificate ? 'true' : 'false');

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
      setHasCertificate(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub - Create Event</title>
        <meta name="description" content="Create a new event on PSU Hub." />
      </Helmet>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <EventIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }}
                >
                  Create New Event
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                >
                  Fill in the details below to create your event
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mb: 3 }}>
              All fields marked with * are required. Make sure to provide accurate information for better event management.
            </Alert>

            <form onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                {/* Image Upload Section */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      backgroundColor: 'background.default',
                      borderStyle: 'dashed'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      {imagePreview ? (
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            image={imagePreview}
                            alt="Event preview"
                            sx={{ 
                              maxHeight: 200,
                              borderRadius: 1
                            }}
                          />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'background.paper',
                              '&:hover': {
                                backgroundColor: 'background.paper'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Click to upload event image
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Card>
                </Grid>

                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <EventIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <DescriptionIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    fullWidth
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
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
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
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
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
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    fullWidth
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
                      value={participationCategory}
                      onChange={(e) => setParticipationCategory(e.target.value)}
                      label="Participation Category"
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
                    value={totalHours}
                    onChange={(e) => setTotalHours(e.target.value)}
                    fullWidth
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
                        checked={hasCertificate}
                        onChange={(e) => setHasCertificate(e.target.checked)}
                        icon={<CardGiftcardIcon />}
                        checkedIcon={<CardGiftcardIcon color="primary" />}
                      />
                    }
                    label="Issue certificates for this event"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ 
                      py: 1.5,
                      mt: 2
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </LocalizationProvider>
      <AdminHelperChatbot openOnMount={true} proactiveMessage="Hi there! Need help planning this event? Ask me about best dates, current trends, or anything else." />

    </>
  );
};

export default CreateEvent;
