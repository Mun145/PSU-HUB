// src/App.js
import React from 'react';
import Register from '../../psu-hub-frontend/src/components/Register';
import Login from '../../psu-hub-frontend/src/components/Login';
import CreateEvent from '../../psu-hub-frontend/src/components/CreateEvent';

function App() {
  return (
    <div style={{ margin: '20px' }}>
      <h1>PSU Hub Frontend</h1>
      <h2>User Registration</h2>
      <Register />
      <hr />
      <h2>User Login</h2>
      <Login />
      <hr />
      <h2>Create Event (Protected)</h2>
      <CreateEvent />
    </div>
  );
}

export default App;