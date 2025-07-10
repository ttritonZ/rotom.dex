import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function RegisterPage() {
  const [form, setForm] = useState({});

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    // Only append profileImage if a file is selected
    if (e.target.profileImage.files.length > 0) {
      formData.append('profileImage', e.target.profileImage.files[0]);
    }
    await axios.post(`${API_URL}/api/auth/register`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert('Registration successful!');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl mb-4">Register</h1>
      <input type="text" name="username" placeholder="Username" required onChange={handleChange} className="border p-2 w-full mb-2" />
      <input type="email" name="email" placeholder="Email" required onChange={handleChange} className="border p-2 w-full mb-2" />
      <input type="text" name="first_name" placeholder="First Name" required onChange={handleChange} className="border p-2 w-full mb-2" />
      <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} className="border p-2 w-full mb-2" />
      <input type="password" name="password" placeholder="Password" required onChange={handleChange} className="border p-2 w-full mb-2" />
      <input type="text" name="country" placeholder="Country" onChange={handleChange} className="border p-2 w-full mb-2" />
      <input type="file" name="profileImage" accept="image/*" className="mb-4" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Register</button>
    </form>
  );
}
