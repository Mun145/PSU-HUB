// src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, FormControl, Select, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const userRole = localStorage.getItem('role');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          PSU Hub
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        {user ? (
          <>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
            {/* Additional links based on role */}
            {userRole === 'admin' && (
              <>
                <Button color="inherit" component={Link} to="/create-event">
                  Create Event
                </Button>
                <Button color="inherit" component={Link} to="/analytics">
                  Analytics
                </Button>
              </>
            )}
            {userRole === 'psu_admin' && (
              <Button color="inherit" component={Link} to="/pending-events">
                Pending Events
              </Button>
            )}
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/profile">
              Profile
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        )}
        {/* Example language selection placeholder */}
        <FormControl variant="standard" sx={{ ml: 2, color: 'white' }}>
          <Select
            value="en"
            sx={{
              color: 'white',
              '& .MuiSvgIcon-root': { color: 'white' }
            }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">عربي</MenuItem>
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
