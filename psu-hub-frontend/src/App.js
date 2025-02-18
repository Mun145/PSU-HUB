// psu-hub-frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import theme from './theme';
import { NotificationProvider } from './contexts/NotificationContext';
import Home from './pages/Home';
import Register from './components/Register';
import Login from './components/Login';
import CreateEvent from './components/CreateEvent';
import PendingEvents from './pages/PendingEvents';
import ScanAttendance from './pages/ScanAttendance';
import Dashboard from './pages/Dashboard';
import Survey from './pages/Survey';
import Analytics from './pages/Analytics';
import Certificate from './pages/Certificate';
import Profile from './pages/Profile';
import NotificationsPage from './pages/NotificationsPage';

const drawerWidth = 240;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState('light');

  const handleToggle = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const userRole = localStorage.getItem('role');

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          PSU Hub
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/login">
          <ListItemText primary="Login" />
        </ListItem>
        <ListItem button component={Link} to="/register">
          <ListItemText primary="Register" />
        </ListItem>
        {(userRole === 'admin' || userRole === 'psu_admin') && (
          <ListItem button component={Link} to="/dashboard">
            <ListItemText primary="Dashboard" />
          </ListItem>
        )}
        {userRole === 'admin' && (
          <>
            <ListItem button component={Link} to="/create-event">
              <ListItemText primary="Create Event" />
            </ListItem>
            <ListItem button component={Link} to="/analytics">
              <ListItemText primary="Analytics" />
            </ListItem>
          </>
        )}
        {userRole === 'psu_admin' && (
          <ListItem button component={Link} to="/pending-events">
            <ListItemText primary="Pending Events" />
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <NotificationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex' }}>
            {/* AppBar */}
            <AppBar
              position="fixed"
              sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { sm: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                  PSU Hub
                </Typography>
                <FormControlLabel
                  control={<Switch checked={mode === 'dark'} onChange={handleToggle} />}
                  label="Dark Mode"
                />
              </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Box
              component="nav"
              sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
              aria-label="mailbox folders"
            >
              {/* Mobile Drawer */}
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                  display: { xs: 'block', sm: 'none' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
              >
                {drawer}
              </Drawer>
              {/* Desktop Drawer */}
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
              >
                {drawer}
              </Drawer>
            </Box>

            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${drawerWidth}px)` },
              }}
            >
              <Toolbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/pending-events" element={<PendingEvents />} />
                <Route path="/scan-attendance" element={<ScanAttendance />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/survey" element={<Survey />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/certificate" element={<Certificate />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;
