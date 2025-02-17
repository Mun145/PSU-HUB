// psu-hub-frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
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
import NotificationPanel from './components/NotificationPanel';

function App() {
  return (
    <NotificationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar />
          <div style={{ margin: '20px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/pending-events" element={<PendingEvents />} />
              <Route path="/scan-attendance" element={<ScanAttendance />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/certificate" element={<Certificate />} />
            </Routes>
          </div>
          <NotificationPanel />
        </Router>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;
