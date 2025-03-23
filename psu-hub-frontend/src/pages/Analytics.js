import React, { useEffect, useState } from 'react';
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
  Fade
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import EventCard from '../components/EventCard';

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

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [eventAnalytics, setEventAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('date');

  // Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Advanced
  const [advancedData, setAdvancedData] = useState(null);
  const [advStart, setAdvStart] = useState(null);
  const [advEnd, setAdvEnd] = useState(null);

  useEffect(() => {
    api.get('/analytics/overview')
      .then((res) => setOverview(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Error fetching overview'));

    api.get('/analytics/events')
      .then((res) => setEventAnalytics(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Error fetching events'))
      .finally(() => setLoading(false));

    fetchAdvancedAnalytics();
  }, []);

  const fetchAdvancedAnalytics = (start = null, end = null) => {
    let url = '/analytics/advanced';
    if (start && end) {
      url += `?startDate=${start}&endDate=${end}`;
    }
    api.get(url)
      .then((res) => setAdvancedData(res.data.data))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching advanced analytics');
      });
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Filter & sort
  const filteredEvents = eventAnalytics.filter((event) => {
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

  // CSV & Excel Export
  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
  };

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
      toast.info('No overview data to export.');
    }
  };

  const handleExportOverviewExcel = () => {
    if (overview) {
      exportToExcel([overview], 'overview_data.xlsx');
    } else {
      toast.info('No overview data to export.');
    }
  };

  const handleOpenDetails = (eventItem) => {
    api.get(`/analytics/events/${eventItem.id}`)
      .then((res) => {
        setSelectedEvent(res.data.data);
        setDetailsOpen(true);
        setTabValue(0);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Error fetching details'));
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

  // Overview chart data
  const overviewChartData = {
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
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub - Analytics</title>
        <meta name="description" content="View overall and event-specific analytics on PSU Hub." />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Overall Statistics
          </Typography>
          {overview ? (
            <Box sx={{ mt: 2, height: 350 }}>
              <Bar
                data={overviewChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
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

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={advStart}
                onChange={(v) => setAdvStart(v)}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={advEnd}
                onChange={(v) => setAdvEnd(v)}
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
              {advancedData.topEvents?.length ? (
                <ul>
                  {advancedData.topEvents.map((evt) => (
                    <li key={evt.id}>
                      {evt.title} — Attendance: <strong>{evt.attendanceCount}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>No top events found.</Typography>
              )}

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Total Attendance in Range:
              </Typography>
              <Typography>
                {advancedData.totalRangeAttendance || 0} attendances
              </Typography>
            </Box>
          ) : (
            <Typography>No advanced analytics available.</Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filter & Sort
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <TextField
              label="Search by Title"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl variant="outlined">
              <InputLabel>Status Filter</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                renderValue={(sel) => sel.join(', ')}
                sx={{ minWidth: 150 }}
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <DatePicker
                  label="Start Date"
                  value={dateRange[0]}
                  onChange={(nv) => setDateRange([nv, dateRange[1]])}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange[1]}
                  onChange={(nv) => setDateRange([dateRange[0], nv])}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Box>
            </LocalizationProvider>
            <FormControl variant="outlined">
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
            <Button
              variant="outlined"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Sort: Oldest First' : 'Sort: Newest First'}
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Event Analytics</Typography>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {sortedEvents.length ? (
                sortedEvents.map((evt) => (
                  <Grid item xs={12} sm={6} md={4} key={evt.id}>
                    <EventCard event={evt} onView={() => handleOpenDetails(evt)} showStatus />
                  </Grid>
                ))
              ) : (
                <Typography sx={{ mt: 2 }}>No events match the criteria.</Typography>
              )}
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* Details Modal */}
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
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Attendees" />
                <Tab label="Survey Feedback" />
              </Tabs>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Date: {selectedEvent.date
                    ? new Date(selectedEvent.date).toLocaleDateString()
                    : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Location: {selectedEvent.location || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Attendee Count: {selectedEvent.attendeeCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                  Status: {selectedEvent.status || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {selectedEvent.description}
                </Typography>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                {selectedEvent.Attendances?.length ? (
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
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="small" onClick={() => {
                        if (selectedEvent && selectedEvent.Attendances) {
                          const exportData = selectedEvent.Attendances.map((att) => ({
                            Name: att.User ? att.User.name : 'Unknown',
                            Email: att.User ? att.User.email : 'N/A'
                          }));
                          exportToCSV(exportData, 'attendees.csv');
                        }
                      }}>
                        Export CSV
                      </Button>
                      <Button variant="outlined" size="small" onClick={() => {
                        if (selectedEvent && selectedEvent.Attendances) {
                          const exportData = selectedEvent.Attendances.map((att) => ({
                            Name: att.User ? att.User.name : 'Unknown',
                            Email: att.User ? att.User.email : 'N/A'
                          }));
                          exportToExcel(exportData, 'attendees.xlsx');
                        }
                      }}>
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
                  Survey feedback not implemented yet.
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
