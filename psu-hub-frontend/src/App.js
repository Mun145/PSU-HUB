// src/App.js
import React, { useState, useContext, Suspense } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import {
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
  ListItemButton,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { AuthContext } from './contexts/AuthContext';
import { useThemeContext } from './contexts/ThemeContext';
import navItems from './config/navItems';
import ProtectedRoute from './routes/ProtectedRoute';

// Lazy imports
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const CreateEvent = React.lazy(() => import('./pages/CreateEvent'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PendingEvents = React.lazy(() => import('./pages/PendingEvents'));
const ScanAttendance = React.lazy(() => import('./pages/ScanAttendance'));
const Survey = React.lazy(() => import('./pages/Survey'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Certificate = React.lazy(() => import('./pages/Certificate'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const Profile = React.lazy(() => import('./pages/Profile'));
const EditEvent = React.lazy(() => import('./pages/EditEvent'));
const EventDetails = React.lazy(() => import('./pages/EventDetails'));
const MyAttendance = React.lazy(() => import('./pages/MyAttendance'));
const NotAuthorized = React.lazy(() => import('./pages/NotAuthorized'));

const drawerWidth = 240;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useThemeContext();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRole = user ? user.role : null;

  // Render nav items except for profile
  const renderNavItems = () => {
    return navItems
      .filter((item) => {
        if (!userRole) {
          return item.roles.includes(null);
        }
        return item.roles.includes(userRole);
      })
      .map((item) => {
        if (item.label === 'Profile') {
          // We skip "Profile" so it won't appear in the drawer
          return null;
        }
        if (item.label === 'Logout') {
          return (
            <ListItem disablePadding key={item.label}>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        }
        return (
          <ListItem disablePadding key={item.label}>
            <ListItemButton component={Link} to={item.path}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        );
      });
  };

  // Drawer content
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          PSU Hub
        </Typography>
      </Toolbar>
      <Divider />
      <List>{renderNavItems()}</List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            PSU Hub
          </Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
            label="Dark Mode"
          />

{user && (
  <Box sx={{ ml: 2 }}>
    {user.profilePicture ? (
      <IconButton
        color="inherit"
        onClick={() => navigate('/profile')}
        sx={{ p: 0 }}
      >
        <Box
          component="img"
          src={user.profilePicture}
          alt="User Avatar"
          sx={{
            width: 32,
            height: 32,
            objectFit: 'cover',
            borderRadius: '50%'
          }}
        />
      </IconButton>
    ) : (
      <IconButton
        color="inherit"
        onClick={() => navigate('/profile')}
      >
        <PersonIcon />
      </IconButton>
    )}
  </Box>
)}

        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={userRole ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/notifications" element={<ProtectedRoute element={<NotificationsPage />} />} />
            <Route path="/my-attendance" element={<ProtectedRoute element={<MyAttendance />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} roles={['faculty', 'admin', 'psu_admin']} />} />
            <Route path="/create-event" element={<ProtectedRoute element={<CreateEvent />} roles={['admin']} />} />
            <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} roles={['admin']} />} />
            <Route path="/pending-events" element={<ProtectedRoute element={<PendingEvents />} roles={['psu_admin']} />} />
            <Route path="/scan-attendance" element={<ProtectedRoute element={<ScanAttendance />} />} />
            <Route path="/survey" element={<ProtectedRoute element={<Survey />} />} />
            <Route path="/certificate" element={<ProtectedRoute element={<Certificate />} />} />
            <Route path="/edit-event/:id" element={<ProtectedRoute element={<EditEvent />} />} />
            <Route path="/event/:id" element={<ProtectedRoute element={<EventDetails />} />} />
            <Route path="/not-authorized" element={<NotAuthorized />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Box>
    </Box>
  );
}

export default App;
