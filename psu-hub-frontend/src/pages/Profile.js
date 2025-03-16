// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button
} from '@mui/material';
import { Helmet } from 'react-helmet';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikTextField from '../components/FormikTextField';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

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
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">No profile data found.</Typography>
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
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>My Profile</Typography>

          {!editMode ? (
            // Read-only mode
            <>
              {profile.profilePicture && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    component="img"
                    src={profile.profilePicture}
                    alt="Profile"
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                </Box>
              )}
              <Typography variant="h6">Name:</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profile.name}
              </Typography>

              <Typography variant="h6">Email:</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profile.email}
              </Typography>

              {profile.contact && (
                <>
                  <Typography variant="h6">Contact Info:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {profile.contact}
                  </Typography>
                </>
              )}

              {profile.bio && (
                <>
                  <Typography variant="h6">Bio:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {profile.bio}
                  </Typography>
                </>
              )}

              <Button
                variant="outlined"
                onClick={handleToggleEdit}
                fullWidth
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </>
          ) : (
            // Edit mode with Formik
            // In the "edit mode" portion of Profile.js

<Formik
  initialValues={{
    name: profile.name || '',
    bio: profile.bio || '',
    contact: profile.contact || ''
  }}
  onSubmit={(values, { setSubmitting }) => {
    const token = localStorage.getItem('token');

    // We'll use FormData to send the file
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('bio', values.bio);
    formData.append('contact', values.contact);

    // If the user selected a file
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
        toast.success(res.data.message || 'Profile updated');
        // Update local state
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
{({ handleSubmit, setFieldValue }) => (
  <Form onSubmit={handleSubmit} noValidate>
    <FormikTextField name="name" label="Name" />
    <FormikTextField name="bio" label="Bio" multiline rows={3} />
    <FormikTextField name="contact" label="Contact Info" />

    {/* File input */}
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          setFieldValue('profileImageFile', e.target.files[0]);
        }
      }}
    />

    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Save
      </Button>
      <Button
        type="button"
        variant="outlined"
        color="error"
        fullWidth
        onClick={() => setEditMode(false)}
      >
        Cancel
      </Button>
    </Box>
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
