import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import { useNavigate } from 'react-router-dom';

export default function ItemPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const fetchItems = async (q = '', cat = '') => {
    const res = await axios.get(`http://localhost:5000/api/items?q=${q}&category=${cat}`);
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    fetchItems(search, category);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    fetchItems();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl mb-6">Items</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items by name"
          className="border p-2 w-64"
        />
        <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2">
          <option value="">All Categories</option>
          <option value="Poké Ball">Poké Ball</option>
          <option value="Healing">Healing</option>
          <option value="Battle">Battle</option>
          <option value="Evolution">Evolution</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
        <button type="button" onClick={clearFilters} className="bg-gray-300 px-3 py-2 rounded">Clear</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {items.map(item => (
          <ItemCard key={item.item_id} item={item} />
        ))}
      </div>
    </div>
  );
}
