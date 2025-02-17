// psu-hub-frontend/src/pages/Analytics.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3001/api/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => setData(response.data))
    .catch(err => {
      setError(err.response?.data?.message || err.message);
    });
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading analytics...</div>;

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <ul>
        <li>Total Events: {data.totalEvents}</li>
        <li>Approved Events: {data.approvedEvents}</li>
        <li>Total Attendance: {data.totalAttendance}</li>
        <li>Total Registered Users: {data.totalUsers}</li>
      </ul>
    </div>
  );
};

export default Analytics;
