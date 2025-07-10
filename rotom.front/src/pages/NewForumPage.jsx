import React, { useState } from 'react';
import axios from 'axios';

export default function NewForumPage() {
  const [form, setForm] = useState({ forum_name: '', forum_description: '' });
  const user_id = localStorage.getItem('user_id');

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/forums', { ...form, forum_manager: user_id });
    window.location = '/forum';
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl mb-4">Create Forum</h1>
      <input type="text" name="forum_name" placeholder="Forum Name" required onChange={e => setForm({ ...form, forum_name: e.target.value })} className="border p-2 w-full mb-2" />
      <textarea name="forum_description" placeholder="Description" required onChange={e => setForm({ ...form, forum_description: e.target.value })} className="border p-2 w-full mb-4" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}
