// src/pages/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  TextField,
  Tabs,
  Tab,
  Checkbox,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const { user } = useContext(AuthContext);
  const userRole = user ? user.role : null;
  const navigate = useNavigate();

  // Shared
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Faculty
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('published');
  const [showPast, setShowPast] = useState(false);

  // Admin
  const [adminTab, setAdminTab] = useState(0); // 0=Drafts, 1=Awaiting, 2=Published, 3=Analytics
  const [selectedEvents, setSelectedEvents] = useState([]); // for bulk actions
  const [collapseAnalytics, setCollapseAnalytics] = useState(false); // collapsible analytics
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);

  // Socket.io
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001');
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('newEvent', (data) => {
      console.log('New event added:', data);
      toast.info(`New event added: ${data.title}`);
      // Optionally re-fetch events
      // api.get('/events').then((res) => setEvents(res.data.data));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch events & analytics
  useEffect(() => {
    setLoading(true);
    api.get('/events')
      .then((res) => {
        const allEvents = res.data.data;
        setEvents(allEvents);
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        toast.error(err.response?.data?.message || 'Error fetching events');
      })
      .finally(() => setLoading(false));

    if (userRole === 'admin') {
      api.get('/analytics/overview')
        .then((res) => {
          setAnalytics(res.data.data);
        })
        .catch((err) => console.error('Error fetching analytics:', err));
    }
  }, [userRole]);

  // Admin: tab change
  const handleAdminTabChange = (event, newValue) => {
    setAdminTab(newValue);
    setSelectedEvents([]); // reset selections
  };

  // Admin: draft events, awaiting, published
  const draftEvents = events.filter((e) => e.status === 'draft');
  const awaitingPublish = events.filter((e) => e.status === 'approved');
  const publishedEvents = events.filter((e) => e.status === 'published');

  // Bulk actions: select/unselect events
  const handleSelectEvent = (eventId) => {
    setSelectedEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const allSelected = (list) => {
    // return true if all list items are in selectedEvents
    return list.every((ev) => selectedEvents.includes(ev.id));
  };

  const toggleSelectAll = (list) => {
    if (allSelected(list)) {
      // unselect all
      setSelectedEvents((prev) =>
        prev.filter((id) => !list.some((ev) => ev.id === id))
      );
    } else {
      // select all
      const newIds = list.map((ev) => ev.id);
      setSelectedEvents((prev) => [...new Set([...prev, ...newIds])]);
    }
  };

  // Bulk publish
  const bulkPublish = (list) => {
    list.forEach((ev) => {
      if (selectedEvents.includes(ev.id)) {
        publishEvent(ev.id);
      }
    });
    setSelectedEvents([]);
  };

  // Bulk delete
  const bulkDelete = (list) => {
    list.forEach((ev) => {
      if (selectedEvents.includes(ev.id)) {
        api.delete(`/events/${ev.id}`)
          .then(() => {
            toast.success(`Event deleted: ${ev.title}`);
          })
          .catch((err) => {
            toast.error(err.response?.data?.message || 'Error deleting event');
          });
      }
    });
    window.location.reload();
  };

  // Basic publish function
  const publishEvent = (id) => {
    api.patch(`/events/publish/${id}`)
      .then(() => {
        toast.success('Event published successfully');
        window.location.reload();
      })
      .catch((err) => {
        toast.error('Error publishing event: ' + (err.response?.data?.message || err.message));
      });
  };

  // Preview
  const handlePreview = (ev) => {
    setPreviewEvent(ev);
    setPreviewOpen(true);
  };
  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewEvent(null);
  };

  // Admin: summary stats
  const totalDraft = draftEvents.length;
  const totalAwaiting = awaitingPublish.length;
  const totalPublished = publishedEvents.length;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // ===================== FACULTY =====================
  if (userRole === 'faculty') {
    // Filter & sort for faculty
    const getFilteredEvents = () => {
      let filtered = events.filter((event) => {
        const statusMatch = (filterStatus === 'all') || (event.status === filterStatus);
        const query = searchQuery.trim().toLowerCase();
        const searchMatch =
          query === '' ||
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query);
        return statusMatch && searchMatch;
      });
      if (showPast) {
        filtered = filtered.filter((e) => new Date(e.date) < new Date());
      } else {
        filtered = filtered.filter((e) => new Date(e.date) >= new Date());
      }
      if (sortOrder === 'asc') {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      return filtered;
    };
    const filteredEvents = getFilteredEvents();

    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Faculty Dashboard</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Search events"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outlined" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort By Date</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Sort By Date"
            >
              <MenuItem value="asc">Oldest First</MenuItem>
              <MenuItem value="desc">Newest First</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant={showPast ? 'contained' : 'outlined'}
            onClick={() => setShowPast(!showPast)}
          >
            {showPast ? 'Show Upcoming' : 'Show Past'}
          </Button>
        </Box>

        {filteredEvents.length === 0 ? (
          <Typography sx={{ mt: 2 }}>No events found.</Typography>
        ) : (
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mt: { xs: 1, md: 2 } }}
          >
            {filteredEvents.map((event) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={event.id}
                sx={{ display: 'flex', alignItems: 'stretch' }}
              >
                <Card
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
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
                    <Typography variant="body2">{event.description}</Typography>
                    <Typography>
                      Date: {new Date(event.date).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {event.isRegistered ? (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          api.delete(`/events/${event.id}/unregister`)
                            .then(() => {
                              toast.success('Unregistered successfully');
                              event.isRegistered = false;
                              setEvents([...events]);
                            })
                            .catch((err) => {
                              toast.error(err.response?.data?.message || 'Error unregistering');
                            });
                        }}
                      >
                        Unregister
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() => {
                          api.post(`/events/${event.id}/register`)
                            .then(() => {
                              toast.success('Registered successfully');
                              event.isRegistered = true;
                              setEvents([...events]);
                            })
                            .catch((err) => {
                              toast.error(err.response?.data?.message || 'Error registering');
                            });
                        }}
                      >
                        Register
                      </Button>
                    )}
                    <Button variant="text" onClick={() => navigate(`/event/${event.id}`)}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );
  }

  // ===================== ADMIN =====================
  if (userRole === 'admin') {
    // Quick summary stats
    const draftCount = events.filter((e) => e.status === 'draft').length;
    const awaitingCount = events.filter((e) => e.status === 'approved').length;
    const publishedCount = events.filter((e) => e.status === 'published').length;

    // Collapsible Analytics
    const handleToggleAnalytics = () => {
      setCollapseAnalytics(!collapseAnalytics);
    };

    // adminTab => 0=Drafts, 1=Awaiting, 2=Published, 3=Analytics
    const handleAdminTabChange = (e, newVal) => {
      setAdminTab(newVal);
      setSelectedEvents([]); // reset
    };

    const draftEvents = events.filter((e) => e.status === 'draft');
    const awaitingPublish = events.filter((e) => e.status === 'approved');
    const publishedEvents = events.filter((e) => e.status === 'published');

    // Bulk Actions
    const handleSelectEvent = (eventId) => {
      setSelectedEvents((prev) =>
        prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      );
    };
    const allSelected = (list) => list.every((ev) => selectedEvents.includes(ev.id));
    const toggleSelectAll = (list) => {
      if (allSelected(list)) {
        setSelectedEvents((prev) => prev.filter((id) => !list.some((ev) => ev.id === id)));
      } else {
        const newIds = list.map((ev) => ev.id);
        setSelectedEvents((prev) => [...new Set([...prev, ...newIds])]);
      }
    };

    const bulkPublish = (list) => {
      list.forEach((ev) => {
        if (selectedEvents.includes(ev.id)) {
          api.patch(`/events/publish/${ev.id}`)
            .then(() => {
              toast.success(`Published: ${ev.title}`);
            })
            .catch((err) => {
              toast.error(err.response?.data?.message || 'Error publishing event');
            });
        }
      });
      window.location.reload();
    };

    const bulkDelete = (list) => {
      list.forEach((ev) => {
        if (selectedEvents.includes(ev.id)) {
          api.delete(`/events/${ev.id}`)
            .then(() => {
              toast.success(`Deleted: ${ev.title}`);
            })
            .catch((err) => {
              toast.error(err.response?.data?.message || 'Error deleting event');
            });
        }
      });
      window.location.reload();
    };

    const handlePreview = (ev) => {
      setPreviewEvent(ev);
      setPreviewOpen(true);
    };
    const closePreview = () => {
      setPreviewOpen(false);
      setPreviewEvent(null);
    };

    // chart data
    let chartData = null;
    if (analytics) {
      chartData = {
        labels: ['Total Events', 'Approved Events', 'Attendance', 'Users'],
        datasets: [
          {
            label: 'Analytics',
            data: [
              analytics.totalEvents,
              analytics.approvedEvents,
              analytics.totalAttendance,
              analytics.totalUsers
            ],
            fill: false,
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgba(75, 192, 192, 0.2)'
          }
        ]
      };
    }

    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

        {/* Quick Stats */}
        <Typography sx={{ mt: 2 }}>
          Drafts: {draftCount} | Awaiting: {awaitingCount} | Published: {publishedCount}
        </Typography>

        {/* Collapsible analytics */}
        <Button
          variant="outlined"
          onClick={handleToggleAnalytics}
          sx={{ mt: 1, mb: 2 }}
        >
          {collapseAnalytics ? 'Hide Detailed Stats' : 'Show Detailed Stats'}
        </Button>
        <Collapse in={collapseAnalytics}>
          {analytics ? (
            <Box sx={{ maxWidth: '600px', mb: 2 }}>
              <Line data={chartData} />
            </Box>
          ) : (
            <Typography>No analytics data.</Typography>
          )}
        </Collapse>

        {/* Tabs for Drafts, Awaiting, Published, Analytics */}
        <Tabs value={adminTab} onChange={handleAdminTabChange} sx={{ mb: 2 }}>
          <Tab label="Drafts" />
          <Tab label="Awaiting" />
          <Tab label="Published" />
          <Tab label="Analytics" />
        </Tabs>

        {adminTab === 0 && (
          <AdminEventsTab
            list={draftEvents}
            selectedEvents={selectedEvents}
            setSelectedEvents={setSelectedEvents}
            toggleSelectAll={toggleSelectAll}
            allSelected={allSelected}
            handleSelectEvent={handleSelectEvent}
            bulkPublish={bulkPublish}
            bulkDelete={bulkDelete}
            handlePreview={handlePreview}
            navigate={navigate}
            tabLabel="Drafts"
          />
        )}
        {adminTab === 1 && (
          <AdminEventsTab
            list={awaitingPublish}
            selectedEvents={selectedEvents}
            setSelectedEvents={setSelectedEvents}
            toggleSelectAll={toggleSelectAll}
            allSelected={allSelected}
            handleSelectEvent={handleSelectEvent}
            bulkPublish={bulkPublish}
            bulkDelete={bulkDelete}
            handlePreview={handlePreview}
            navigate={navigate}
            tabLabel="Awaiting"
          />
        )}
        {adminTab === 2 && (
          <AdminEventsTab
            list={publishedEvents}
            selectedEvents={selectedEvents}
            setSelectedEvents={setSelectedEvents}
            toggleSelectAll={toggleSelectAll}
            allSelected={allSelected}
            handleSelectEvent={handleSelectEvent}
            bulkPublish={bulkPublish}
            bulkDelete={bulkDelete}
            handlePreview={handlePreview}
            navigate={navigate}
            tabLabel="Published"
          />
        )}
        {adminTab === 3 && (
          <Typography sx={{ mt: 2 }}>
            Already have analytics in the collapsible section above.
          </Typography>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onClose={closePreview} maxWidth="sm" fullWidth>
          <DialogTitle>Event Preview</DialogTitle>
          <DialogContent dividers>
            {previewEvent ? (
              <>
                {previewEvent.imageUrl && (
                  <Box
                    component="img"
                    src={previewEvent.imageUrl}
                    alt="Event Preview"
                    sx={{ width: '100%', mb: 2 }}
                  />
                )}
                <Typography variant="h6">{previewEvent.title}</Typography>
                <Typography sx={{ mb: 1 }}>{previewEvent.description}</Typography>
                <Typography>
                  Date: {new Date(previewEvent.date).toLocaleDateString()}
                </Typography>
                <Typography>Status: {previewEvent.status}</Typography>
              </>
            ) : (
              <Typography>No event selected.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closePreview}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // =============== PSU_ADMIN ==================
  if (userRole === 'psu_admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Board Member Dashboard
        </Typography>
        <Typography>
          Please use the Pending Events page to approve or reject events.
        </Typography>
      </Container>
    );
  }

  // =============== UNKNOWN ROLE ===============
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography>Unknown role</Typography>
    </Container>
  );
}

// Extracted admin tab section for repeated usage
function AdminEventsTab({
  list,
  selectedEvents,
  setSelectedEvents,
  toggleSelectAll,
  allSelected,
  handleSelectEvent,
  bulkPublish,
  bulkDelete,
  handlePreview,
  navigate,
  tabLabel
}) {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => toggleSelectAll(list)}
        >
          {allSelected(list) ? 'Unselect All' : 'Select All'}
        </Button>
        {tabLabel === 'Awaiting' && (
          <Button
            variant="contained"
            onClick={() => bulkPublish(list)}
            disabled={selectedEvents.length === 0}
          >
            Bulk Publish
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          onClick={() => bulkDelete(list)}
          disabled={selectedEvents.length === 0}
        >
          Bulk Delete
        </Button>
      </Box>

      {list.length === 0 ? (
        <Typography>No {tabLabel.toLowerCase()} events.</Typography>
      ) : (
        <Grid container spacing={2}>
          {list.map((event) => {
            const isChecked = selectedEvents.includes(event.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
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
                    <Typography>{event.description}</Typography>
                    <Typography>
                      Date: {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    <Typography>Status: {event.status}</Typography>
                  </CardContent>
                  <CardActions>
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleSelectEvent(event.id)}
                    />
                    <Button
                      variant="text"
                      onClick={() => handlePreview(event)}
                    >
                      Preview
                    </Button>
                    {tabLabel === 'Awaiting' && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          // Single publish
                          bulkPublish([event]);
                        }}
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/edit-event/${event.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        // single delete
                        bulkDelete([event]);
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
}

export default Dashboard;
