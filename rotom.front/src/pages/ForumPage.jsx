import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext.jsx';

export default function ForumPage() {
  const [forums, setForums] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newForum, setNewForum] = useState({ name: '', description: '' });
  const [addError, setAddError] = useState('');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const fetchForums = async (query = '') => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/forums?q=${query}`);
    setForums(res.data);
  };

  useEffect(() => {
    fetchForums();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchForums(search);
  };

  const handleAddForum = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newForum.name.trim() || !newForum.description.trim()) {
      setAddError('Name and description required');
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/forums`, {
        forum_name: newForum.name,
        forum_description: newForum.description
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowAdd(false);
      setNewForum({ name: '', description: '' });
      fetchForums();
    } catch (err) {
      setAddError('Failed to add forum');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl mb-6">Forums</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search forums by name"
          className="border p-2 w-64"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
        <button type="button" onClick={() => { setSearch(''); fetchForums(); }} className="bg-gray-300 px-3 py-2 rounded">Clear</button>
        {user && (
          <button type="button" onClick={() => setShowAdd(v => !v)} className="bg-green-500 text-white px-4 py-2 rounded ml-2">{showAdd ? 'Cancel' : 'Add Forum'}</button>
        )}
      </form>

      {showAdd && user && (
        <form onSubmit={handleAddForum} className="mb-6 border p-4 rounded bg-gray-50">
          <div className="mb-2">
            <input
              type="text"
              value={newForum.name}
              onChange={e => setNewForum(f => ({ ...f, name: e.target.value }))}
              placeholder="Forum name"
              className="border p-2 w-full"
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              value={newForum.description}
              onChange={e => setNewForum(f => ({ ...f, description: e.target.value }))}
              placeholder="Forum description"
              className="border p-2 w-full"
              required
            />
          </div>
          {addError && <div className="text-red-500 mb-2">{addError}</div>}
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create Forum</button>
        </form>
      )}

      {forums.map(f => (
        <div key={f.forum_id} className="p-4 border mb-4 rounded shadow">
          <h2 className="text-xl font-semibold">{f.forum_name}</h2>
          <p className="text-sm text-gray-600">By {f.username}</p>
          <p className="my-2">{f.forum_description}</p>
          <button onClick={() => navigate(`/forums/${f.forum_id}`)} className="text-blue-500">View Comments</button>
        </div>
      ))}
    </div>
  );
}

