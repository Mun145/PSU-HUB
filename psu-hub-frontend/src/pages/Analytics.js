//psu-hub-frontend/src/pages/Analytics.js
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
  Fade,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip    
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReplayIcon       from '@mui/icons-material/Replay';

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

export default function Analytics() {
  // Overview and event analytics data
  const [overview, setOverview] = useState(null);
  const [eventAnalytics, setEventAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Advanced analytics
  const [advancedData, setAdvancedData] = useState(null);
  const [advStart, setAdvStart] = useState(null);
  const [advEnd, setAdvEnd] = useState(null);

  useEffect(() => {
    // Fetch overview analytics
    api.get('/analytics/overview')
      .then((res) => setOverview(res.data.data))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching overview');
      });

    // Fetch event analytics
    api.get('/analytics/events')
      .then((res) => setEventAnalytics(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Error fetching events'))
      .finally(() => setLoading(false));

    // Initial advanced analytics
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

  // Filter & sort (front-end only)
  const filteredEvents = eventAnalytics.filter((event) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = event.title.toLowerCase().includes(q);

    const statusOk =
      statusFilter.length === 0 ||
      statusFilter.includes(event.status?.toLowerCase());

    // NOTE: If your actual DB uses startDate/endDate instead of event.date, adapt accordingly.
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

  // CSV & Excel Export Helpers
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

  // Open detail modal
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

  // Bar chart data for overview
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

  // Example action to demonstrate CardActions usage
  const handleRefreshOverview = () => {
    // Simple re-fetch of the overview data
    api.get('/analytics/overview')
      .then((res) => {
        setOverview(res.data.data);
        toast.success('Overview refreshed!');
      })
      .catch((err) => toast.error('Error refreshing overview'));
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub - Analytics</title>
        <meta name="description" content="View overall and event-specific analytics on PSU Hub." />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Page Title */}
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>

        {/* ========== TOP ROW: KPI Cards ========== */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Total Events
              </Typography>
              <Typography variant="h5">
                {overview?.totalEvents ?? 0}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Approved Events
              </Typography>
              <Typography variant="h5">
                {overview?.approvedEvents ?? 0}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Total Attendance
              </Typography>
              <Typography variant="h5">
                {overview?.totalAttendance ?? 0}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Total Users
              </Typography>
              <Typography variant="h5">
                {overview?.totalUsers ?? 0}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* ========== NEXT ROW: Overview Chart + Advanced Analytics ========== */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* OVERVIEW CHART CARD */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h6">Overview Chart</Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={handleExportOverviewCSV}
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleExportOverviewExcel}
                    >
                      Export Excel
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ mt: 2, height: 300 }}>
                  {overview ? (
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
                  ) : (
                    <Typography sx={{ mt: 2 }}>No overview data available.</Typography>
                  )}
                </Box>
              </CardContent>

              {/* CardActions example */}
              <CardActions sx={{ p: 2 }}>
              <IconButton size="small" onClick={handleRefreshOverview} title="Refresh">
  <ReplayIcon fontSize="small" />
</IconButton>

                {/* You can add more actions here if desired */}
              </CardActions>
            </Card>
          </Grid>

          {/* ADVANCED ANALYTICS CARD */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Advanced Analytics
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={advStart}
                      onChange={(v) => setAdvStart(v)}
                      renderInput={(params) => (
                        <TextField {...params} sx={{ minWidth: 120 }} />
                      )}
                    />
                    <DatePicker
                      label="End Date"
                      value={advEnd}
                      onChange={(v) => setAdvEnd(v)}
                      renderInput={(params) => (
                        <TextField {...params} sx={{ minWidth: 120 }} />
                      )}
                    />
                  </LocalizationProvider>
                  <Button
                    variant="contained"
                    onClick={handleAdvancedSearch}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Filter
                  </Button>
                </Box>
                {advancedData ? (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Top Events (by attendance):
                    </Typography>
                    {advancedData.topEvents?.length ? (
                      <ul>
                        {advancedData.topEvents.map((evt) => (
                          <li key={evt.id}>
                            <strong>{evt.title}</strong> — {evt.attendanceCount} attendees
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography>No top events found.</Typography>
                    )}

                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      Total Attendance in Range:
                    </Typography>
                    <Typography>
                      {advancedData.totalRangeAttendance || 0} attendances
                    </Typography>
                  </>
                ) : (
                  <Typography>No advanced analytics available.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ========== FILTER & SORT SECTION ========== */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filter &amp; Sort Events
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <TextField
              label="Search by Title"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <FormControl variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                renderValue={(sel) => sel.join(', ')}
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

            <FormControl variant="outlined" sx={{ minWidth: 120 }}>
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

        {/* ========== EVENT LIST SECTION ========== */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Event Analytics
          </Typography>
          <Grid container spacing={3}>
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
              <Typography sx={{ mt: 2 }}>
                No events match the criteria.
              </Typography>
            )}
          </Grid>
        </Paper>
      </Container>

      {/* ========== DETAILS MODAL ========== */}
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
              {/* ---------- TABS ---------- */}
<Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
  <Tab label="Overview" />
  <Tab label={`Registered (${selectedEvent.Registrations?.length || 0})`} />
  <Tab label={`Attendees (${selectedEvent.Attendances?.length || 0})`} />
  <Tab label="Survey Feedback" />
</Tabs>

{/* ---------- OVERVIEW ---------- */}
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


{/* ---------- SURVEY ---------- */}
<TabPanel value={tabValue} index={3}>
  {selectedEvent.SurveySummary ? (
    <pre style={{ whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(selectedEvent.SurveySummary, null, 2)}
    </pre>
  ) : (
    <Typography>No survey data yet.</Typography>
  )}
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
