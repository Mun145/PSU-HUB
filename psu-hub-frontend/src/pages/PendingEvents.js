// psu-hub-frontend/src/pages/PendingEvents.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PendingEvents = () => {
  const [events, setEvents] = useState([]);
  const userRole = localStorage.getItem('role'); // Should be 'psu_admin' for board members

  useEffect(() => {
    // Fetch all events and filter for pending ones
    axios.get('http://localhost:3001/api/events')
      .then(response => {
        const pendingEvents = response.data.filter(event => event.status === 'pending');
        setEvents(pendingEvents);
      })
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  const updateEventStatus = (id, action) => {
    axios.patch(`http://localhost:3001/api/events/${action}/${id}`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      // Remove the event from the list after updating status
      setEvents(events.filter(event => event.id !== id));
    })
    .catch(error => console.error(`Error updating event status:`, error));
  };

  // Only show the approval interface if the user is a board member (psu_admin)
  if (userRole !== 'psu_admin') {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div>
      <h1>Pending Events</h1>
      {events.length === 0 && <p>No pending events found.</p>}
      {events.map(event => (
        <div key={event.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h2>{event.title}</h2>
          <p>{event.description}</p>
          <p>Date: {new Date(event.date).toLocaleDateString()}</p>
          <p>Location: {event.location}</p>
          <p>Status: {event.status}</p>
          <button onClick={() => updateEventStatus(event.id, 'approve')}>Approve</button>
          <button onClick={() => updateEventStatus(event.id, 'reject')}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default PendingEvents;
