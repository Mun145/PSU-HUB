// src/components/CreateEvent.js
import React, { useState } from 'react';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [qr_code, setQrCode] = useState('');

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Retrieve the stored JWT
      const response = await fetch('http://localhost:3001/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, date, location, qr_code })
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        alert('Event created successfully');
      } else {
        alert(data.message || 'Event creation failed');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    }
  };

  return (
    <form onSubmit={handleCreateEvent}>
      <h2>Create Event</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" /><br />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" /><br />
      <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date (YYYY-MM-DD)" /><br />
      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" /><br />
      <input value={qr_code} onChange={(e) => setQrCode(e.target.value)} placeholder="QR Code" /><br />
      <button type="submit">Create Event</button>
    </form>
  );
}

export default CreateEvent;
