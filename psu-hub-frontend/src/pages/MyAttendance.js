// src/pages/MyAttendance.js
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, CircularProgress,
  Box, Button
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { toast }   from 'react-toastify';
import api         from '../api/axiosInstance';
import EventCard   from '../components/EventCard';
import fullUrl from '../utils/fullUrl';

export default function MyAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading,            setLoading]          = useState(true);
  const  navigate = useNavigate();                // ← SPA navigation

  /* ───────────── fetch once on mount ───────────── */
  useEffect(() => {
    api.get('/attendance/user')
       .then(res => setAttendanceRecords(res.data.data))
       .catch(err => toast.error(
         err.response?.data?.message || 'Error fetching attendance records'
       ))
       .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );

  return (
    <>
      <Helmet>
        <title>PSU Hub – My Attendance</title>
        <meta name="description" content="View your attendance records on PSU Hub." />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>My Attendance</Typography>

        {attendanceRecords.length === 0 ? (
          <Typography>No attendance records found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {attendanceRecords.map(record => (
              <Grid item xs={12} sm={6} md={4} key={record.id}>
                <EventCard
                  event={record.Event}
                  showStatus={false}
                  /* open read‑only details in new tab */
                  onCardClick={() => window.open(`/event/${record.Event.id}`, '_blank')}

                  /* extra buttons rendered under the card */
                  extra={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* SURVEY — only if attended & not yet done */}
                      {record.attended && !record.surveyCompleted && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();                   // <—— no card click
                            navigate(`/survey?eventId=${record.Event.id}`);
                          }}
                        >
                          Survey
                        </Button>
                      )}
                  
                      {/* CERTIFICATE — only if URL present */}
                      {(record.certificateUrl || record.fileUrl) && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();                   // <—— no card click
                            const url = fullUrl(record.certificateUrl || record.fileUrl);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          Certificate
                        </Button>
                      )}
                    </Box>
                  }
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}
