import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function LoginPage() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(null);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('user_id', res.data.user_id);
      // Fetch user info (with is_admin) and update context
      const me = await axios.get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${res.data.token}` } });
      setUser(me.data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl mb-4">Login</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input type="text" name="identifier" placeholder="Username or Email" required onChange={e => setForm({ ...form, identifier: e.target.value })} className="border p-2 w-full mb-2" />
      <input type="password" name="password" placeholder="Password" required onChange={e => setForm({ ...form, password: e.target.value })} className="border p-2 w-full mb-2" />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Login</button>
    </form>
  );
}
