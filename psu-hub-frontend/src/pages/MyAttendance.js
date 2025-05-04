// src/pages/MyAttendance.js
import React, { useEffect, useState } from 'react';
import {
  Container, 
  Typography, 
  Grid, 
  CircularProgress,
  Box, 
  Button,
  Paper,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  Skeleton,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import EventCard from '../components/EventCard';
import fullUrl from '../utils/fullUrl';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function MyAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    api.get('/attendance/user')
       .then(res => setAttendanceRecords(res.data.data))
       .catch(err => toast.error(
         err.response?.data?.message || 'Error fetching attendance records'
       ))
       .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3].map((index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>PSU Hub – My Attendance</title>
        <meta name="description" content="View your attendance records on PSU Hub." />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <EventIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                My Attendance
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
              >
                View your event attendance and related activities
              </Typography>
            </Box>
          </Stack>

          {attendanceRecords.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              No attendance records found. You haven't attended any events yet.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {attendanceRecords.map(record => (
                <Grid item xs={12} sm={6} md={4} key={record.id}>
                  <EventCard
                    event={record.Event}
                    showStatus={false}
                    onCardClick={() => window.open(`/event/${record.Event.id}`, '_blank')}
                    extra={
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        {record.attended && !record.surveyCompleted && (
                          <Tooltip title="Complete event survey">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AssessmentIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/survey?eventId=${record.Event.id}`);
                              }}
                            >
                              Survey
                            </Button>
                          </Tooltip>
                        )}
                  
                        {(record.certificateUrl || record.fileUrl) && (
                          <Tooltip title="View certificate">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CardGiftcardIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = fullUrl(record.certificateUrl || record.fileUrl);
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              Certificate
                            </Button>
                          </Tooltip>
                        )}

                        <Tooltip title="Open event details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/event/${record.Event.id}`, '_blank');
                            }}
                          >
                            <OpenInNewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </>
  );
}
