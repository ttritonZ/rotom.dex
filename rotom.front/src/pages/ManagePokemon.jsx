import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ManagePokemon() {
  const [pokemons, setPokemons] = useState([]);
  const [editForm, setEditForm] = useState(null);

  // Load all Pokémons
  const fetchPokemons = async () => {
    const res = await axios.get(`${API_URL}/api/pokemon`);
    setPokemons(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchPokemons();
  }, []);

  const handleDelete = async (sp_id) => {
    await axios.delete(`${API_URL}/api/admin/pokemon/${sp_id}`);
    alert('Deleted successfully');
    fetchPokemons();
  };

  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditForm({ ...editForm, [name]: type === 'checkbox' ? checked : value });
  };

  const submitEdit = async e => {
    e.preventDefault();
    await axios.put(`${API_URL}/api/admin/pokemon/${editForm.sp_id}`, editForm);
    alert('Updated successfully');
    setEditForm(null);
    fetchPokemons();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Pokémon</h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th className="border p-2">Sp ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pokemons.map(p => (
              <tr key={p.sp_id}>
                <td className="border p-2">{p.sp_id}</td>
                <td className="border p-2">{p.pokemon_name}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => setEditForm(p)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(p.sp_id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editForm && (
        <form onSubmit={submitEdit} className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Edit Pokémon</h2>
          <input value={editForm.pokemon_name} name="pokemon_name" onChange={handleEditChange} placeholder="Name" className="border p-2 w-full" required />
          <input value={editForm.n_dex} name="n_dex" type="number" onChange={handleEditChange} placeholder="Dex Number" className="border p-2 w-full" />
          <input value={editForm.generation} name="generation" type="number" onChange={handleEditChange} placeholder="Generation" className="border p-2 w-full" />
          <textarea value={editForm.category} name="category" onChange={handleEditChange} placeholder="Category" className="border p-2 w-full" />
          <div className="space-x-2">
            <label><input type="checkbox" name="is_legendary" checked={editForm.is_legendary} onChange={handleEditChange} /> Legendary</label>
            <label><input type="checkbox" name="is_mythical" checked={editForm.is_mythical} onChange={handleEditChange} /> Mythical</label>
          </div>
          <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded">Save Changes</button>
          <button onClick={() => setEditForm(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
        </form>
      )}
    </div>
  );
}
