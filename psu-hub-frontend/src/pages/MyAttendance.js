// src/pages/MyAttendance.js
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

const MyAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/user')
      .then((res) => {
        // Use res.data.data since your backend wraps data in { data: ... }
        setAttendanceRecords(res.data.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching attendance records');
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

  return (
    <>
      <Helmet>
        <title>PSU Hub - My Attendance</title>
        <meta name="description" content="View your attendance records on PSU Hub." />
      </Helmet>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Attendance
        </Typography>
        {attendanceRecords.length === 0 ? (
          <Typography>No attendance records found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {attendanceRecords.map((record) => (
              <Grid item xs={12} sm={6} md={4} key={record.id}>
                <Paper sx={{ p: 2 }}>
                  {/* Because you're including the Event model, you can display record.Event.title */}
                  <Typography variant="h6">
                    {record.Event ? record.Event.title : 'Unknown Event'}
                  </Typography>
                  <Typography variant="body2">
                    Date: {new Date(record.scan_time).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default MyAttendance;
