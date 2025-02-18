// psu-hub-frontend/src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Select, MenuItem, FormControl } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const userRole = localStorage.getItem('role');

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          PSU Hub
        </Typography>
        <Button color="inherit" component={Link} to="/">{('home')}</Button>
        <Button color="inherit" component={Link} to="/login">{('login')}</Button>
        <Button color="inherit" component={Link} to="/register">{('register')}</Button>
        <Button color="inherit" component={Link} to="/notifications">Notifications</Button>
        {(userRole === 'admin' || userRole === 'psu_admin') && (
          <Button color="inherit" component={Link} to="/dashboard">{('dashboard')}</Button>
        )}
        {userRole === 'admin' && (
          <>
            <Button color="inherit" component={Link} to="/create-event">{('create_event')}</Button>
            <Button color="inherit" component={Link} to="/analytics">{('analytics')}</Button>
          </>
        )}
        {userRole === 'psu_admin' && (
          <Button color="inherit" component={Link} to="/pending-events">{('pending_events')}</Button>
        )}
        <FormControl variant="standard" sx={{ ml: 2, color: 'white' }}>
          <Select
            value={i18n.language}
            onChange={handleLanguageChange}
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
