// src/pages/Analytics.js
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Collapse,
  Fade
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import { styled } from '@mui/material/styles';
import Papa from 'papaparse';
import * as XLSX from 'xlsx'; // Actively used to avoid grayed-out import
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Styled Card
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)'
  },
  boxShadow: theme.shadows[3]
}));

// Status color
const StatusLabel = styled(Typography)(({ status }) => {
  let color;
  switch (status?.toLowerCase()) {
    case 'pending':
      color = 'orange';
      break;
    case 'published':
      color = 'green';
      break;
    case 'rejected':
      color = 'red';
      break;
    default:
      color = 'gray';
  }
  return { color, fontWeight: 'bold' };
});

// Tab Panel
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

function Analytics() {
  // Overview data
  const [overview, setOverview] = useState(null);
  // Event analytics array
  const [eventAnalytics, setEventAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('date');

  // Modal & expansions
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Advanced analytics
  const [advancedData, setAdvancedData] = useState(null);
  const [advStart, setAdvStart] = useState(null);
  const [advEnd, setAdvEnd] = useState(null);

  // 1) On mount, fetch overview + events + advanced (optionally)
  useEffect(() => {
    // Overview
    api.get('/analytics/overview')
      .then((res) => setOverview(res.data.data))
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Error fetching overview analytics')
      );

    // Event analytics
    api.get('/analytics/events')
      .then((res) => setEventAnalytics(res.data.data))
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Error fetching event analytics')
      )
      .finally(() => setLoading(false));

    // Optionally fetch advanced analytics right away
    fetchAdvancedAnalytics();
  }, []);

  // 2) Fetch advanced analytics (top events, date-range attendance, etc.)
  const fetchAdvancedAnalytics = (start = null, end = null) => {
    let url = '/analytics/advanced';
    if (start && end) {
      url += `?startDate=${start}&endDate=${end}`;
    }
    api.get(url)
      .then((res) => {
        setAdvancedData(res.data.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching advanced analytics');
      });
  };

  // 3) Filter
  const filteredEvents = eventAnalytics.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter.length === 0 ||
      statusFilter.includes(event.status?.toLowerCase());
    const eventDate = event.date ? new Date(event.date) : null;
    const [start, end] = dateRange;
    const matchesDate =
      (!start || (eventDate && eventDate >= start)) &&
      (!end || (eventDate && eventDate <= end));
    return matchesSearch && matchesStatus && matchesDate;
  });

  // 4) Sort
  const sortedEvents = filteredEvents.sort((a, b) => {
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

  // 5) Export Helpers
  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
  };

  // Use XLSX from top-level import
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, filename);
  };

  const handleExportOverviewCSV = () => {
    if (overview) {
      exportToCSV([overview], 'overview_data.csv');
    } else {
      toast.info('No overview data available to export.');
    }
  };

  const handleExportOverviewExcel = () => {
    if (overview) {
      exportToExcel([overview], 'overview_data.xlsx');
    } else {
      toast.info('No overview data available to export.');
    }
  };

  const handleExportAttendeesCSV = () => {
    if (selectedEvent && selectedEvent.Attendances) {
      const exportData = selectedEvent.Attendances.map((att) => ({
        Name: att.User ? att.User.name : 'Unknown',
        Email: att.User ? att.User.email : 'N/A'
      }));
      exportToCSV(exportData, 'attendees.csv');
    } else {
      toast.info('No attendee data available to export.');
    }
  };

  const handleExportAttendeesExcel = () => {
    if (selectedEvent && selectedEvent.Attendances) {
      const exportData = selectedEvent.Attendances.map((att) => ({
        Name: att.User ? att.User.name : 'Unknown',
        Email: att.User ? att.User.email : 'N/A'
      }));
      exportToExcel(exportData, 'attendees.xlsx');
    } else {
      toast.info('No attendee data available to export.');
    }
  };

  // 6) Modal
  const handleOpenDetails = (eventItem) => {
    api.get(`/analytics/events/${eventItem.id}`)
      .then((res) => {
        setSelectedEvent(res.data.data);
        setDetailsOpen(true);
        setTabValue(0);
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Error fetching event details')
      );
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setDetailsOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Expand/collapse card
  const toggleCardExpansion = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  // Truncate helper
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // 7) If loading
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // 8) Overview Chart
  const overviewChartData = {
    labels: ['Total Events', 'Approved Events', 'Attendance', 'Users'],
    datasets: [
      {
        label: 'Overall Statistics',
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
  };

  // 9) Advanced analytics: top events, range attendance
  const handleAdvancedSearch = () => {
    if (advStart && advEnd) {
      fetchAdvancedAnalytics(advStart.toISOString(), advEnd.toISOString());
    } else {
      fetchAdvancedAnalytics(); // no date range
    }
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub - Analytics</title>
        <meta name="description" content="View overall and event-specific analytics on PSU Hub." />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Overview
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleExportOverviewCSV}>
            Export CSV
          </Button>
          <Button variant="outlined" onClick={handleExportOverviewExcel}>
            Export Excel
          </Button>
        </Box>

        {/* Overview Stats */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6">Overall Statistics</Typography>
          {overview ? (
            <Box sx={{ mt: 2 }}>
              <Bar
                data={overviewChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Overall Analytics' }
                  }
                }}
              />
            </Box>
          ) : (
            <Typography>No overview data available.</Typography>
          )}
        </Paper>

        {/* ADVANCED ANALYTICS SECTION */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={advStart}
                onChange={(newVal) => setAdvStart(newVal)}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={advEnd}
                onChange={(newVal) => setAdvEnd(newVal)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
            <Button variant="contained" onClick={handleAdvancedSearch}>
              Apply
            </Button>
          </Box>
          {advancedData ? (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Top Events (by attendance):
              </Typography>
              {advancedData.topEvents && advancedData.topEvents.length > 0 ? (
                <ul>
                  {advancedData.topEvents.map((evt) => (
                    <li key={evt.id}>
                      {evt.title} — Attendance: <strong>{evt.attendanceCount}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>No top events data found.</Typography>
              )}

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Total Attendance in Range:
              </Typography>
              <Typography>{advancedData.totalRangeAttendance || 0} attendances</Typography>

              {/* Example: Export top events to Excel using XLSX */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (advancedData.topEvents) {
                      exportToExcel(advancedData.topEvents, 'top_events.xlsx');
                    } else {
                      toast.info('No top events data to export.');
                    }
                  }}
                >
                  Export Top Events (Excel)
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography>No advanced data loaded.</Typography>
          )}
        </Paper>

        {/* FILTERING & SORTING FOR EVENTANALYTICS */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Search by Event Title"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  multiple
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {['pending', 'published', 'rejected'].map((status) => (
                    <MenuItem key={status} value={status}>
                      <Checkbox checked={statusFilter.indexOf(status) > -1} />
                      <ListItemText
                        primary={status.charAt(0).toUpperCase() + status.slice(1)}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <DatePicker
                    label="Start Date"
                    value={dateRange[0]}
                    onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                  <DatePicker
                    label="End Date"
                    value={dateRange[1]}
                    onChange={(newValue) => setDateRange([dateRange[0], newValue])}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Box>
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Sort by Date: Oldest First' : 'Sort by Date: Newest First'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* EVENT CARDS */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Event Analytics</Typography>
          {sortedEvents.length > 0 ? (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {sortedEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <StyledCard>
                    {event.imageUrl && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={event.imageUrl}
                        alt="Event image"
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6">{event.title}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {truncateText(event.description, 100)}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        Date:{' '}
                        {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Location: {event.location || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Organizer: {event.organizer || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Attendees: {event.attendeeCount || 0}
                      </Typography>
                      <StatusLabel variant="body2" status={event.status} sx={{ mt: 1 }}>
                        Status: {event.status || 'N/A'}
                      </StatusLabel>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenDetails(event)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => toggleCardExpansion(event.id)}
                      >
                        {expandedCardId === event.id ? 'Hide Info' : 'More Info'}
                      </Button>
                    </CardActions>
                    <Collapse in={expandedCardId === event.id} timeout="auto" unmountOnExit>
                      <CardContent>
                        <Typography variant="body2">
                          Detailed Info:{' '}
                          {event.longDescription || 'No additional details.'}
                        </Typography>
                      </CardContent>
                    </Collapse>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ mt: 2 }}>No event analytics available.</Typography>
          )}
        </Paper>
      </Container>

      {/* Event Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent dividers>
          {selectedEvent ? (
            <>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="Event details tabs">
                <Tab label="Overview" />
                <Tab label="Attendees" />
                <Tab label="Survey Feedback" />
              </Tabs>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Date:{' '}
                  {selectedEvent.date
                    ? new Date(selectedEvent.date).toLocaleDateString()
                    : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Location: {selectedEvent.location || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Organizer: {selectedEvent.organizer || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Attendee Count: {selectedEvent.attendeeCount || 0}
                </Typography>
                <StatusLabel variant="body2" status={selectedEvent.status} sx={{ mt: 1 }}>
                  Status: {selectedEvent.status || 'N/A'}
                </StatusLabel>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {selectedEvent.description}
                </Typography>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                {selectedEvent.Attendances && selectedEvent.Attendances.length > 0 ? (
                  <Box>
                    {selectedEvent.Attendances.map((att) => (
                      <Box
                        key={att.id}
                        sx={{ mb: 1, borderBottom: '1px solid #ccc', pb: 1 }}
                      >
                        <Typography variant="body2">
                          {att.User ? att.User.name : 'Unknown'} (
                          {att.User ? att.User.email : 'N/A'})
                        </Typography>
                      </Box>
                    ))}
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button variant="outlined" size="small" onClick={handleExportAttendeesCSV}>
                        Export CSV
                      </Button>
                      <Button variant="outlined" size="small" onClick={handleExportAttendeesExcel}>
                        Export Excel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography>No attendee details available.</Typography>
                )}
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <Typography variant="body2">
                  Survey feedback details are not implemented yet.
                </Typography>
              </TabPanel>
            </>
          ) : (
            <Typography>Loading event data...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Analytics;
