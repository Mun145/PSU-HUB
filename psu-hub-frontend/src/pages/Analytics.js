//psu-hub-frontend/src/pages/Analytics.js
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Fade,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReplayIcon from '@mui/icons-material/Replay';
import DownloadIcon from '@mui/icons-material/Download';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SurveyFeedbackPanel from '../components/SurveyFeedbackPanel';
import EventCard from '../components/EventCard';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Constants for better maintainability
const STATUS_COLORS = {
  published: 'success',
  pending: 'warning',
  rejected: 'error'
};

const STATUS_OPTIONS = ['pending', 'published', 'rejected'];

// Reusable TabPanel component for the detail modal
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </Box>
  );
}

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to calculate percentage
const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

export default function Analytics() {
  // Overview and event analytics data
  const [overview, setOverview] = useState(null);
  const [eventAnalytics, setEventAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('date');

  // Detail modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Advanced analytics
  const [advancedData, setAdvancedData] = useState(null);
  const [advStart, setAdvStart] = useState(null);
  const [advEnd, setAdvEnd] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [overviewRes, eventsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/events')
        ]);

        setOverview(overviewRes.data.data);
        setEventAnalytics(eventsRes.data.data);
        
        // Initial advanced analytics
        fetchAdvancedAnalytics();
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching analytics data');
        toast.error(err.response?.data?.message || 'Error fetching analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAdvancedAnalytics = useCallback(async (start = null, end = null) => {
    try {
      let url = '/analytics/advanced';
      if (start && end) {
        url += `?startDate=${start}&endDate=${end}`;
      }
      const res = await api.get(url);
      setAdvancedData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching advanced analytics');
    }
  }, []);

  // Memoized filtered and sorted events
  const filteredEvents = useMemo(() => {
    return eventAnalytics.filter((event) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = event.title.toLowerCase().includes(q);

      const statusOk =
        statusFilter.length === 0 ||
        statusFilter.includes(event.status?.toLowerCase());

      const eventDate = event.date ? new Date(event.date) : null;
      const [start, end] = dateRange;
      const matchesDate =
        (!start || (eventDate && eventDate >= start)) &&
        (!end || (eventDate && eventDate <= end));

      return matchesSearch && statusOk && matchesDate;
    });
  }, [eventAnalytics, searchQuery, statusFilter, dateRange]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'status') {
        const statusOrder = { pending: 1, published: 2, rejected: 3 };
        const orderA = statusOrder[a.status?.toLowerCase()] || 99;
        const orderB = statusOrder[b.status?.toLowerCase()] || 99;
        return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      }
      return 0;
    });
  }, [filteredEvents, sortBy, sortOrder]);

  // Memoized chart data
  const overviewChartData = useMemo(() => ({
    labels: ['Total Events', 'Approved Events', 'Attendance', 'Users'],
    datasets: [
      {
        label: 'Overall Stats',
        data: overview
          ? [
              overview.totalEvents,
              overview.approvedEvents,
              overview.totalAttendance,
              overview.totalUsers
            ]
          : [],
        backgroundColor: ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f'],
        borderColor: ['#1565c0', '#2e7d32', '#f9a825', '#c62828'],
        borderWidth: 1
      }
    ]
  }), [overview]);

  // Event handlers
  const handleOpenDetails = async (eventItem) => {
    try {
      setLoadingDetails(true);
      const res = await api.get(`/analytics/events/${eventItem.id}`);
      setSelectedEvent(res.data.data);
      setDetailsOpen(true);
      setTabValue(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching event details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setDetailsOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAdvancedSearch = () => {
    if (advStart && advEnd) {
      fetchAdvancedAnalytics(advStart.toISOString(), advEnd.toISOString());
    } else {
      fetchAdvancedAnalytics();
    }
  };

  // Export functions
  const exportToCSV = useCallback((data, filename) => {
    try {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Error exporting to CSV');
    }
  }, []);

  const exportToExcel = useCallback((data, filename) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, filename);
    } catch (err) {
      toast.error('Error exporting to Excel');
    }
  }, []);

  const handleExportOverviewCSV = useCallback(() => {
    if (overview) {
      exportToCSV([overview], 'overview_data.csv');
    } else {
      toast.info('No overview data to export');
    }
  }, [overview, exportToCSV]);

  const handleExportOverviewExcel = useCallback(() => {
    if (overview) {
      exportToExcel([overview], 'overview_data.xlsx');
    } else {
      toast.info('No overview data to export');
    }
  }, [overview, exportToExcel]);

  // Loading state
  if (loading) {
    return (
      <Container sx={{ 
        mt: 4, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" icon={<ErrorOutlineIcon />}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>PSU Hub - Analytics</title>
        <meta name="description" content="View overall and event-specific analytics on PSU Hub." />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Page Title with minimal design */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 500,
            letterSpacing: '-0.5px',
            mb: 1
          }}>
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and analyze event performance and engagement
          </Typography>
        </Box>

        {/* ========== TOP ROW: KPI Cards with minimal design ========== */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Total Events', value: overview?.totalEvents ?? 0, icon: <EventIcon /> },
            { label: 'Approved Events', value: overview?.approvedEvents ?? 0, icon: <CheckCircleIcon /> },
            { label: 'Total Attendance', value: overview?.totalAttendance ?? 0, icon: <PeopleIcon /> },
            { label: 'Total Users', value: overview?.totalUsers ?? 0, icon: <PersonIcon /> }
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary'
                }}>
                  {item.icon}
                  <Typography variant="body2">
                    {item.label}
                  </Typography>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 500,
                    lineHeight: 1.2
                  }}
                >
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ========== NEXT ROW: Overview Chart + Advanced Analytics ========== */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* OVERVIEW CHART CARD with minimal design */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Overview Chart
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={handleExportOverviewCSV}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={handleExportOverviewExcel}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ p: 2.5, flexGrow: 1 }}>
                <Box sx={{ height: 300, position: 'relative' }}>
                  {overview ? (
                    <Bar
                      data={overviewChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { 
                            position: 'top',
                            labels: {
                              font: {
                                size: 12
                              }
                            }
                          },
                          title: { display: false }
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography color="text.secondary">
                        No overview data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* ADVANCED ANALYTICS CARD with minimal design */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Box sx={{ 
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                  Advanced Analytics
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  '& .MuiTextField-root': {
                    minWidth: 200
                  }
                }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={advStart}
                      onChange={(v) => setAdvStart(v)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          size="small"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1
                            }
                          }}
                        />
                      )}
                    />
                    <DatePicker
                      label="End Date"
                      value={advEnd}
                      onChange={(v) => setAdvEnd(v)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          size="small"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1
                            }
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <Button
                    variant="contained"
                    onClick={handleAdvancedSearch}
                    sx={{ 
                      alignSelf: 'flex-end',
                      borderRadius: 1,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
              <Box sx={{ p: 2.5 }}>
                {advancedData ? (
                  <Box sx={{ 
                    '& > *': { mb: 3 },
                    '& ul': { 
                      pl: 2,
                      '& li': { mb: 1.5 }
                    }
                  }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1.5 }}>
                        Top Events (by attendance)
                      </Typography>
                      {advancedData.topEvents?.length ? (
                        <ul>
                          {advancedData.topEvents.map((evt) => (
                            <li key={evt.id}>
                              <Typography>
                                <strong>{evt.title}</strong> — {evt.attendanceCount} attendees
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography color="text.secondary">No top events found</Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1.5 }}>
                        Total Attendance in Range
                      </Typography>
                      <Typography variant="h5">
                        {advancedData.totalRangeAttendance || 0} attendances
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: 200
                  }}>
                    <Typography color="text.secondary">
                      No advanced analytics available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ========== FILTER & SORT SECTION with minimal design ========== */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2.5, 
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
            Filter & Sort Events
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            '& .MuiTextField-root, & .MuiFormControl-root': {
              minWidth: 200
            }
          }}>
            <TextField
              label="Search by Title"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />

            <FormControl variant="outlined" size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                renderValue={(sel) => sel.join(', ')}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              >
                {['pending', 'published', 'rejected'].map((st) => (
                  <MenuItem key={st} value={st}>
                    <Checkbox checked={statusFilter.indexOf(st) > -1} />
                    <ListItemText primary={st} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={dateRange[0]}
                  onChange={(nv) => setDateRange([nv, dateRange[1]])}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      size="small"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1
                        }
                      }}
                    />
                  )}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange[1]}
                  onChange={(nv) => setDateRange([dateRange[0], nv])}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      size="small"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </LocalizationProvider>

            <FormControl variant="outlined" size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              sx={{ 
                borderRadius: 1,
                textTransform: 'none'
              }}
            >
              {sortOrder === 'asc' ? 'Sort: Oldest First' : 'Sort: Newest First'}
            </Button>
          </Box>
        </Paper>

        {/* ========== EVENT LIST SECTION with minimal design ========== */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
            Event Analytics
          </Typography>
          <Grid container spacing={2}>
            {sortedEvents.length ? (
              sortedEvents.map((evt) => (
                <Grid item xs={12} sm={6} md={4} key={evt.id}>
                  <EventCard
                    event={evt}
                    onCardClick={(theEvt) => handleOpenDetails(theEvt)}
                    showStatus
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  color: 'text.secondary'
                }}>
                  <Typography>
                    No events match the criteria
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Container>

      {/* ========== DETAILS MODAL with minimal design ========== */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 500,
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 2.5
        }}>
          Event Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          {selectedEvent ? (
            <>
              {/* ---------- TABS with minimal design ---------- */}
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                sx={{ 
                  mb: 3,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500
                  }
                }}
              >
                <Tab label="Overview" />
                <Tab label={`Registered (${selectedEvent.Registrations?.length || 0})`} />
                <Tab label={`Attendees (${selectedEvent.Attendances?.length || 0})`} />
                <Tab label="Survey Feedback" />
              </Tabs>

              {/* ---------- OVERVIEW ---------- */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  {/* Event Basic Info */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ 
                      p: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        Event Information
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Title
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.title}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Date & Time
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.date
                              ? new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Location
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvent.location || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip 
                            label={selectedEvent.status || 'N/A'} 
                            color={
                              selectedEvent.status?.toLowerCase() === 'published' ? 'success' :
                              selectedEvent.status?.toLowerCase() === 'pending' ? 'warning' :
                              selectedEvent.status?.toLowerCase() === 'rejected' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Attendance Statistics */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ 
                      p: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        Attendance Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                              {selectedEvent.Registrations?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Registrations
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                              {selectedEvent.Attendances?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Attendance
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                              {selectedEvent.Registrations?.length ? 
                                Math.round((selectedEvent.Attendances?.length / selectedEvent.Registrations?.length) * 100) : 0}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Attendance Rate
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                              {selectedEvent.Registrations?.length ? 
                                selectedEvent.Registrations?.length - (selectedEvent.Attendances?.length || 0) : 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              No-Shows
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Registration vs Attendance Chart */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ 
                      p: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        Registration vs Attendance
                      </Typography>
                      <Box sx={{ height: 300, position: 'relative' }}>
                        <Pie
                          data={{
                            labels: ['Registered', 'Attended'],
                            datasets: [{
                              data: [
                                selectedEvent.Registrations?.length || 0,
                                selectedEvent.Attendances?.length || 0
                              ],
                              backgroundColor: [
                                'rgba(54, 162, 235, 0.6)',
                                'rgba(75, 192, 192, 0.6)'
                              ],
                              borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(75, 192, 192, 1)'
                              ],
                              borderWidth: 1
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom'
                              }
                            }
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Additional Statistics */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ 
                      p: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        Additional Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                              {selectedEvent.capacity || '∞'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Event Capacity
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                              {selectedEvent.Registrations?.length ? 
                                Math.round((selectedEvent.Registrations?.length / (selectedEvent.capacity || 1)) * 100) : 0}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Capacity Utilization
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                              {selectedEvent.SurveySummary?.responseCount || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Survey Responses
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                              {selectedEvent.SurveySummary?.averageRating ? 
                                selectedEvent.SurveySummary.averageRating.toFixed(1) : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Average Rating
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Event Description */}
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                        Description
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedEvent.description || 'No description available'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* ---------- REGISTERED (all sign-ups) ---------- */}
              <TabPanel value={tabValue} index={1}>
                {selectedEvent.Registrations?.length ? (
                  selectedEvent.Registrations.map((reg) => (
                    <Box
                      key={reg.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid #eee',
                        py: 1
                      }}
                    >
                      {/* name + email */}
                      <Typography sx={{ flexGrow: 1 }}>
                        {reg.User?.name || 'Unknown'} ({reg.User?.email || 'N/A'})
                      </Typography>

                      {/* Already attended → show grey chip */}
                      {reg.attended ? (
                        <Chip
                          label="✓ Attended"
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        /* Not yet attended → show button */
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={async () => {
                            try {
                              const resp = await api.patch(
                                `/admin/registrations/${reg.id}/mark-attended`,
                                { attended: true }
                              );
                              /* refresh modal with updated event */
                              setSelectedEvent(() => resp.data.data);
                              toast.success('Attendance marked');
                            } catch {
                              toast.error('Could not update');
                            }
                          }}
                        >
                          Mark attended
                        </Button>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography>No registrations yet.</Typography>
                )}
              </TabPanel>

              {/* ---------- ATTENDEES ---------- */}
              <TabPanel value={tabValue} index={2}>
                {selectedEvent.Attendances?.length ? (
                  selectedEvent.Attendances.map((att) => (
                    <Box
                      key={att.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid #eee',
                        py: 1,
                      }}
                    >
                      {/* -------- name + email -------- */}
                      <Typography sx={{ flexGrow: 1 }}>
                        {att.User?.name || 'Unknown'} ({att.User?.email || 'N/A'})
                      </Typography>

                      {/* -------- actions -------- */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Download certificate (if already issued) */}
                        {att.Certificate?.fileUrl && (
                          <IconButton
                            size="small"
                            title="Open certificate"
                            onClick={() => window.open(att.Certificate.fileUrl, '_blank')}
                          >
                            <PictureAsPdfIcon fontSize="small" />
                          </IconButton>
                        )}

                        {/* Undo attendance (admin only) */}
                        {!att.Certificate?.fileUrl && (
                          <Checkbox
                            checked
                            onChange={async () => {
                              try {
                                const resp = await api.patch(
                                  `/admin/registrations/${att.id}/mark-attended`,
                                  { attended: false },
                                );
                                // refresh local event data with the server response
                                setSelectedEvent(() => resp.data.data);
                                toast.success('Attendance reverted');
                              } catch {
                                toast.error('Could not update');
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography>No one has attended yet.</Typography>
                )}
              </TabPanel>

                           {/* ---------- SURVEY FEEDBACK ---------- */}
                           <TabPanel value={tabValue} index={3}>
                {/* 
                  SurveyFeedbackPanel already handles “no data” cases 
                  and shows a friendly message, so no extra ternary needed. 
                */}
                <SurveyFeedbackPanel summary={selectedEvent.SurveySummary} />
              </TabPanel>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDetails}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

