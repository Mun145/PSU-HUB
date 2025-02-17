// psu-hub-frontend/src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const userRole = localStorage.getItem('role');
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          PSU Hub
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/login">Login</Button>
        <Button color="inherit" component={Link} to="/register">Register</Button>
        {(userRole === 'admin' || userRole === 'psu_admin') && (
          <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        )}
        {userRole === 'admin' && (
          <>
            <Button color="inherit" component={Link} to="/create-event">Create Event</Button>
            <Button color="inherit" component={Link} to="/analytics">Analytics</Button>
          </>
        )}
        {userRole === 'psu_admin' && (
          <Button color="inherit" component={Link} to="/pending-events">Pending Events</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
