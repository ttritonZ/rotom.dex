import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/profile/${userId}`)
      .then(res => setProfile(res.data));
  }, [userId]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl mb-4">Welcome, {profile.username}</h1>
      {profile.profile_image && <img src={`/uploads/profiles/${profile.profile_image}`} alt={profile.username} className="w-32 rounded-full mb-4" />}
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
      <p><strong>Country:</strong> {profile.country}</p>
      <p><strong>Money:</strong> ${profile.money_amount}</p>
      <p><strong>Registered:</strong> {profile.reg_date}</p>
    </div>
  );
}
