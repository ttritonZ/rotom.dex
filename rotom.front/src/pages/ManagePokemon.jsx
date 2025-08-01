import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ManagePokemon() {
  const [pokemons, setPokemons] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [dropdowns, setDropdowns] = useState({ types: [], abilities: [], regions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all Pokémons
  const fetchPokemons = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found. Please log in.');
        return;
      }
      
      const res = await axios.get(`${API_URL}/api/admin/pokemon`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    setPokemons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch Pokémon:', err);
      alert('Failed to load Pokémon data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load dropdown data
  const fetchDropdowns = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/admin/dropdown-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDropdowns(res.data);
    } catch (err) {
      console.error('Dropdown fetch error:', err);
    }
  };

  useEffect(() => {
    fetchPokemons();
    fetchDropdowns();
  }, []);

  const handleDelete = async (sp_id) => {
    if (!confirm('Are you sure you want to delete this Pokémon?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('No token found. Please log in.');

      await axios.delete(`${API_URL}/api/admin/pokemon/${sp_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    alert('Deleted successfully');
    fetchPokemons();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete Pokémon');
    }
  };

  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditForm({ ...editForm, [name]: type === 'checkbox' ? checked : value });
  };

  const toNumberOrNull = v => {
    const n = Number(v);
    return isNaN(n) ? null : n;
  };

  const submitEdit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      // Convert relevant fields to proper types before sending
      const payload = {
        sp_id: editForm.sp_id,
        n_dex: toNumberOrNull(editForm.n_dex),
        pokemon_name: editForm.pokemon_name,
        generation: toNumberOrNull(editForm.generation),
        region: toNumberOrNull(editForm.region),
        category: editForm.category,
        height: toNumberOrNull(editForm.height),
        weight: toNumberOrNull(editForm.weight),
        catch_rate: toNumberOrNull(editForm.catch_rate),
        base_experience: toNumberOrNull(editForm.base_experience),
        hp: toNumberOrNull(editForm.hp),
        attack: toNumberOrNull(editForm.attack),
        defence: toNumberOrNull(editForm.defence),
        sp_attack: toNumberOrNull(editForm.sp_attack),
        sp_defence: toNumberOrNull(editForm.sp_defence),
        speed: toNumberOrNull(editForm.speed),
        description: editForm.description,
        pokedex_entry: editForm.pokedex_entry ? [editForm.pokedex_entry] : null,
        is_mega: Boolean(editForm.is_mega),
        is_gigantamax: Boolean(editForm.is_gigantamax),
        is_legendary: Boolean(editForm.is_legendary),
        is_mythical: Boolean(editForm.is_mythical),
        is_fossil: Boolean(editForm.is_fossil),
        is_regional_variant: Boolean(editForm.is_regional_variant),
        is_forme_change: Boolean(editForm.is_forme_change),
        forme_name: editForm.forme_name || null,
        is_paradox: Boolean(editForm.is_paradox),
        is_ancient: Boolean(editForm.is_ancient),
        is_future: Boolean(editForm.is_future),
        is_default: Boolean(editForm.is_default),
        price: toNumberOrNull(editForm.price),
        type_1: toNumberOrNull(editForm.type_1),
        type_2: editForm.type_2 ? toNumberOrNull(editForm.type_2) : null,
        ability_1: toNumberOrNull(editForm.ability_1),
        ability_2: editForm.ability_2 ? toNumberOrNull(editForm.ability_2) : null,
        ability_hidden: editForm.ability_hidden ? toNumberOrNull(editForm.ability_hidden) : null,
        pokemon_base_name: editForm.pokemon_base_name,
        total: toNumberOrNull(editForm.total),
        is_ultrabeast: Boolean(editForm.is_ultrabeast)
      };

      console.log('Edit Form Data:', editForm);
      console.log('Payload being sent:', payload);

      await axios.put(`${API_URL}/api/admin/pokemon/${editForm.sp_id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    alert('Updated successfully');
    setEditForm(null);
    fetchPokemons();
    } catch (err) {
      console.error('Update failed:', err.response?.data || err.message);
      alert('Failed to update Pokémon: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (key, val) => {
    if (['type_1', 'type_2'].includes(key)) {
      return (
        <select key={key} name={key} value={val || ''} onChange={handleEditChange} className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white">
          <option value="">Select {key.replace(/_/g, ' ')}</option>
          {dropdowns.types.map(t => <option key={t.type_id} value={t.type_id.toString()}>{t.type_name}</option>)}
        </select>
      );
    } else if (['ability_1', 'ability_2', 'ability_hidden'].includes(key)) {
      return (
        <select key={key} name={key} value={val || ''} onChange={handleEditChange} className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white">
          <option value="">Select {key.replace(/_/g, ' ')}</option>
          {dropdowns.abilities.map(a => <option key={a.ability_id} value={a.ability_id.toString()}>{a.ability_name}</option>)}
        </select>
      );
    } else if (key === 'region') {
      return (
        <select key={key} name={key} value={val || ''} onChange={handleEditChange} className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white">
          <option value="">Select Region</option>
          {dropdowns.regions.map(r => <option key={r.region_id} value={r.region_id.toString()}>{r.region_name}</option>)}
        </select>
      );
    } else if (typeof val === 'boolean') {
      return (
        <label key={key} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
          <input type="checkbox" name={key} checked={val || false} onChange={handleEditChange} className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500" />
          <span className="font-medium text-green-800">{key.replace(/_/g, ' ')}</span>
        </label>
      );
    } else {
      return (
        <input
          key={key}
          name={key}
          value={val || ''}
          onChange={handleEditChange}
          placeholder={key.replace(/_/g, ' ')}
          className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
          type={["height", "weight", "catch_rate", "base_experience", "hp", "attack", "defence",
            "sp_attack", "sp_defence", "speed", "price", "type_1", "type_2", "ability_1",
            "ability_2", "ability_hidden", "total", "generation", "region", "n_dex"].includes(key) ? 'number' : 'text'}
          required={["sp_id", "n_dex", "pokemon_name", "generation", "region", "category", "type_1",
            "ability_1", "pokemon_base_name", "total"].includes(key)}
        />
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700">Loading Pokémon data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Pokémon</h1>
            <p className="text-gray-600">Edit and manage all Pokémon in the database</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50 border-b border-green-200">
            <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Sp ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Dex #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-200">
            {pokemons.map(p => (
                <tr key={p.sp_id} className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.sp_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.pokemon_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.n_dex}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.type_1}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          // Handle pokedex_entry array to string conversion
                          const pokemonForEdit = { ...p };
                          if (Array.isArray(pokemonForEdit.pokedex_entry)) {
                            pokemonForEdit.pokedex_entry = pokemonForEdit.pokedex_entry.join(', ');
                          }
                          setEditForm(pokemonForEdit);
                        }} 
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-xs"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(p.sp_id)} 
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-xs"
                      >
                        Delete
                      </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✏️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Edit Pokémon: {editForm.pokemon_name}</h2>
                    <p className="text-sm text-gray-600">Update Pokémon information</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditForm(null)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <form onSubmit={submitEdit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(editForm).map(([key, val]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {["sp_id", "n_dex", "pokemon_name", "generation", "region", "category", "type_1",
                        "ability_1", "pokemon_base_name", "total"].includes(key) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderField(key, val)}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditForm(null)} 
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
