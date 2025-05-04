// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Stack,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  Alert,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { Helmet } from 'react-helmet';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikTextField from '../components/FormikTextField';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch profile on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axiosInstance.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.data && res.data.data) {
          setProfile(res.data.data);
        } else if (res.data.user) {
          // fallback if your response is structured differently
          setProfile(res.data.user);
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching profile');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 3 }} />
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3].map((index) => (
              <Grid item xs={12} key={index}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          No profile data found. Please try logging in again.
        </Alert>
      </Container>
    );
  }

  const handleToggleEdit = () => {
    setEditMode(!editMode);
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub - My Profile</title>
      </Helmet>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <PersonIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                My Profile
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
              >
                Manage your personal information
              </Typography>
            </Box>
          </Stack>

          {!editMode ? (
            // Read-only mode
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={profile.profilePicture}
                    alt="Profile"
                    sx={{
                      width: 120,
                      height: 120,
                      border: `4px solid ${theme.palette.primary.main}`,
                      boxShadow: 2
                    }}
                  />
                  <IconButton
                    onClick={handleToggleEdit}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'background.paper'
                      }
                    }}
                  >
                    <EditIcon color="primary" />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={3}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <PersonIcon color="action" />
                          <Typography variant="h6">Name</Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ pl: 4 }}>
                          {profile.name}
                        </Typography>
                      </Box>

                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <EmailIcon color="action" />
                          <Typography variant="h6">Email</Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ pl: 4 }}>
                          {profile.email}
                        </Typography>
                      </Box>

                      {profile.contact && (
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <PhoneIcon color="action" />
                            <Typography variant="h6">Contact Info</Typography>
                          </Stack>
                          <Typography variant="body1" sx={{ pl: 4 }}>
                            {profile.contact}
                          </Typography>
                        </Box>
                      )}

                      {profile.bio && (
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <DescriptionIcon color="action" />
                            <Typography variant="h6">Bio</Typography>
                          </Stack>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              pl: 4,
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.6
                            }}
                          >
                            {profile.bio}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            // Edit mode with Formik
            <Formik
              initialValues={{
                name: profile.name || '',
                bio: profile.bio || '',
                contact: profile.contact || ''
              }}
              onSubmit={(values, { setSubmitting }) => {
                const token = localStorage.getItem('token');
                const formData = new FormData();
                formData.append('name', values.name);
                formData.append('bio', values.bio);
                formData.append('contact', values.contact);

                if (values.profileImageFile) {
                  formData.append('profileImage', values.profileImageFile);
                }

                axiosInstance.put('/users/profile-with-image', formData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                  }
                })
                  .then((res) => {
                    toast.success('Profile updated successfully');
                    setProfile((prev) => ({
                      ...prev,
                      ...values,
                      profilePicture: res.data.data.profilePicture
                    }));
                    setEditMode(false);
                  })
                  .catch((err) => {
                    toast.error(err.response?.data?.message || 'Error updating profile');
                  })
                  .finally(() => setSubmitting(false));
              }}
            >
              {({ handleSubmit, setFieldValue, isSubmitting }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          src={profile.profilePicture}
                          alt="Profile"
                          sx={{
                            width: 120,
                            height: 120,
                            border: `4px solid ${theme.palette.primary.main}`,
                            boxShadow: 2
                          }}
                        />
                        <label htmlFor="profile-image-upload">
                          <Input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setFieldValue('profileImageFile', e.target.files[0]);
                              }
                            }}
                          />
                          <IconButton
                            component="span"
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              backgroundColor: 'background.paper',
                              '&:hover': {
                                backgroundColor: 'background.paper'
                              }
                            }}
                          >
                            <AddAPhotoIcon color="primary" />
                          </IconButton>
                        </label>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <FormikTextField 
                        name="name" 
                        label="Name"
                        InputProps={{
                          startAdornment: (
                            <PersonIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormikTextField 
                        name="contact" 
                        label="Contact Info"
                        InputProps={{
                          startAdornment: (
                            <PhoneIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormikTextField 
                        name="bio" 
                        label="Bio" 
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
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={2}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          fullWidth={isMobile}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => setEditMode(false)}
                          fullWidth={isMobile}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          )}
        </Paper>
      </Container>
    </>
  );
}

export default Profile;
