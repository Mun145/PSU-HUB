// src/pages/ScanAttendance.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

const ScanAttendance = () => {
  const query = new URLSearchParams(useLocation().search);
  const eventId = query.get('eventId');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (eventId) {
      api.post('/attendance/mark', { event_id: eventId, scan_time: new Date() })
        .then(() => {
          setMessage('Attendance marked successfully!');
          toast.success('Attendance marked successfully!');
        })
        .catch(error => {
          const errMsg = error.response?.data?.message || error.message;
          setMessage('Error marking attendance: ' + errMsg);
          toast.error('Error marking attendance: ' + errMsg);
        });
    } else {
      setMessage('Event ID missing.');
      toast.error('Event ID missing.');
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
