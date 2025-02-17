// psu-hub-frontend/src/pages/ScanAttendance.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ScanAttendance = () => {
  const query = useQuery();
  const eventId = query.get('eventId');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (eventId && token) {
      axios.post('http://localhost:3001/api/attendance/mark', {
        event_id: eventId,
        scan_time: new Date()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setMessage('Attendance marked successfully!');
        toast.success('Attendance marked successfully!');
      })
      .catch(error => {
        const errMsg = error.response?.data?.message || error.message;
        setMessage('Error marking attendance: ' + errMsg);
        toast.error('Error marking attendance: ' + errMsg);
      });
    } else {
      setMessage('Event ID or token missing.');
      toast.error('Event ID or token missing.');
    }
  }, [eventId]);

  return (
    <div>
      <h1>Scan Attendance</h1>
      <p>{message}</p>
    </div>
  );
};

export default ScanAttendance;
