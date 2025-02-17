// psu-hub-frontend/src/components/Login.js
import React, { useState } from 'react';
import jwt_decode from 'jwt-decode';
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        localStorage.setItem('token', data.token);
        const decoded = jwt_decode(data.token);
        if (decoded && decoded.role) {
          localStorage.setItem('role', decoded.role);
        }
        toast.success('Login successful');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Error during login');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
