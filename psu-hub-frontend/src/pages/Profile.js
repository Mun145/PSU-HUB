// psu-hub-frontend/src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Box } from '@mui/material';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    // you could add more fields as needed
  });
  const [loading, setLoading] = useState(true);

  // Simulate fetching profile data from backend
  useEffect(() => {
    // Replace this with an API call to your backend
    setTimeout(() => {
      // Example: set profile data from local storage or a dummy user
      const dummyProfile = {
        name: 'John Doe',
        email: 'john.doe@example.com'
      };
      setProfile(dummyProfile);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Here you would send the updated profile to your backend
    toast.success('Profile updated successfully');
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          My Profile
        </Typography>
        <Box component="form" onSubmit={handleUpdate}>
          <TextField
            fullWidth
            name="name"
            label="Name"
            value={profile.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            name="email"
            label="Email"
            value={profile.email}
            onChange={handleChange}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Update Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
