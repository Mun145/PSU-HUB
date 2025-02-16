// psu-hub-frontend/src/components/Register.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('faculty');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        toast.success('User registered successfully');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('Error during registration');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br />
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
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="faculty">Faculty</option>
        <option value="admin">Admin</option>
        <option value="psu_admin">PSU Admin (Board Member)</option>
      </select><br />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
