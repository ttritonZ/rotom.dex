import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useUser } from '../hooks/useUser';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AddPokemon() {
  const { user } = useUser();
  // Only include columns in the backend INSERT (38 columns, no extras)
  const [form, setForm] = useState({
    sp_id: '',
    n_dex: '',
    pokemon_name: '',
    generation: '',
    region: '',
    category: '',
    height: '',
    weight: '',
    catch_rate: '',
    base_experience: '',
    hp: '',
    attack: '',
    defence: '',
    sp_attack: '',
    sp_defence: '',
    speed: '',
    description: '',
    pokedex_entry: '',
    is_mega: false,
    is_gigantamax: false,
    is_legendary: false,
    is_mythical: false,
    is_fossil: false,
    is_regional_variant: false,
    is_forme_change: false,
    forme_name: '',
    is_paradox: false,
    is_ancient: false,
    is_future: false,
    is_default: true,
    price: '',
    type_1: '',
    type_2: '',
    ability_1: '',
    ability_2: '',
    ability_hidden: '',
    pokemon_base_name: '',
    total: '',
    is_ultrabeast: false
  });

  const [dropdowns, setDropdowns] = useState({ types: [], abilities: [], regions: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return alert('No token found. Please log in.');

    // Check if user is admin before making the request
    if (!user?.is_admin) {
      alert('Access denied: Admin privileges required. Please contact an administrator.');
      return;
    }

    axios.get(`${API_URL}/api/admin/dropdown-data`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setDropdowns(res.data))
      .catch(err => {
        console.error('Dropdown fetch error:', err);
        if (err.response?.status === 403) {
          alert('Access denied: You do not have admin privileges. Please contact an administrator to grant you admin access.');
        } else if (err.response?.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else {
          alert('Failed to load dropdowns: ' + (err.response?.data?.message || err.message));
        }
      });
  }, [user]);

  const handleChange = e => {
    const { name, value, type, checked, selectedOptions } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'select-multiple') {
      const selected = Array.from(selectedOptions).map(o => o.value.toString());
      setForm({ ...form, [name]: selected });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Check if user is admin before submitting
    if (!user?.is_admin) {
      alert('Access denied: Admin privileges required. Please contact an administrator.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      // Convert relevant fields to proper types before sending
      // Only send the 38 columns in the correct order
      const toNumberOrNull = v => {
        const n = Number(v);
        return isNaN(n) ? null : n;
      };
      
      const payload = {
        sp_id: form.sp_id,
        n_dex: toNumberOrNull(form.n_dex),
        pokemon_name: form.pokemon_name,
        generation: toNumberOrNull(form.generation),
        region: toNumberOrNull(form.region),
        category: form.category,
        height: toNumberOrNull(form.height),
        weight: toNumberOrNull(form.weight),
        catch_rate: toNumberOrNull(form.catch_rate),
        base_experience: toNumberOrNull(form.base_experience),
        hp: toNumberOrNull(form.hp),
        attack: toNumberOrNull(form.attack),
        defence: toNumberOrNull(form.defence),
        sp_attack: toNumberOrNull(form.sp_attack),
        sp_defence: toNumberOrNull(form.sp_defence),
        speed: toNumberOrNull(form.speed),
        description: form.description,
        pokedex_entry: form.pokedex_entry ? [form.pokedex_entry] : null,
        is_mega: Boolean(form.is_mega),
        is_gigantamax: Boolean(form.is_gigantamax),
        is_legendary: Boolean(form.is_legendary),
        is_mythical: Boolean(form.is_mythical),
        is_fossil: Boolean(form.is_fossil),
        is_regional_variant: Boolean(form.is_regional_variant),
        is_forme_change: Boolean(form.is_forme_change),
        forme_name: form.forme_name || null,
        is_paradox: Boolean(form.is_paradox),
        is_ancient: Boolean(form.is_ancient),
        is_future: Boolean(form.is_future),
        is_default: Boolean(form.is_default),
        price: toNumberOrNull(form.price),
        type_1: toNumberOrNull(form.type_1),
        type_2: form.type_2 ? toNumberOrNull(form.type_2) : null,
        ability_1: toNumberOrNull(form.ability_1),
        ability_2: form.ability_2 ? toNumberOrNull(form.ability_2) : null,
        ability_hidden: form.ability_hidden ? toNumberOrNull(form.ability_hidden) : null,
        pokemon_base_name: form.pokemon_base_name,
        total: toNumberOrNull(form.total),
        is_ultrabeast: Boolean(form.is_ultrabeast)
      };

      console.log('Sending payload:', payload);

      await axios.post(`${API_URL}/api/admin/pokemon`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // No image/gif upload, only DB columns
      alert('Pokémon added successfully');
      setForm({
        sp_id: '', n_dex: '', pokemon_name: '', generation: '', region: '', category: '',
        height: '', weight: '', catch_rate: '', base_experience: '', hp: '', attack: '',
        defence: '', sp_attack: '', sp_defence: '', speed: '', is_mega: false, is_gigantamax: false,
        is_legendary: false, is_mythical: false, is_fossil: false, is_regional_variant: false,
        is_forme_change: false, forme_name: '', is_paradox: false, is_ancient: false, is_future: false,
        is_default: true, price: '', type_1: '', type_2: '', ability_1: '', ability_2: '',
        ability_hidden: '', pokemon_base_name: '', total: '', is_ultrabeast: false, description: '', pokedex_entry: ''
      });
    } catch (err) {
      console.error('Submission failed:', err.response?.data || err.message);
      alert('Failed to add Pokémon: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (key, val) => {
    if (['type_1', 'type_2'].includes(key)) {
      return (
        <select key={key} name={key} value={val} onChange={handleChange} className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white">
          <option value="">Select {key.replace(/_/g, ' ')}</option>
          {dropdowns.types.map(t => <option key={t.type_id} value={t.type_id.toString()}>{t.type_name}</option>)}
        </select>
      );
    } else if (['ability_1', 'ability_2', 'ability_hidden'].includes(key)) {
      return (
        <select key={key} name={key} value={val} onChange={handleChange} className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white">
          <option value="">Select {key.replace(/_/g, ' ')}</option>
          {dropdowns.abilities.map(a => <option key={a.ability_id} value={a.ability_id.toString()}>{a.ability_name}</option>)}
        </select>
      );
    } else if (key === 'region') {
      return (
        <select key={key} name={key} value={val} onChange={handleChange} className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white">
          <option value="">Select Region</option>
          {dropdowns.regions.map(r => <option key={r.region_id} value={r.region_id.toString()}>{r.region_name}</option>)}
        </select>
      );
    } else if (typeof val === 'boolean') {
      return (
        <label key={key} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
          <input type="checkbox" name={key} checked={val} onChange={handleChange} className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500" />
          <span className="font-medium text-green-800">{key.replace(/_/g, ' ')}</span>
        </label>
      );
    } else {
      return (
        <input
          key={key}
          name={key}
          value={val}
          onChange={handleChange}
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

  // Show access denied message if user is not admin
  if (!user?.is_admin) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚫</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-red-800">Access Denied</h1>
              <p className="text-red-600">Admin privileges required to add Pokémon</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Admin Access Required</h2>
          <p className="text-red-700 mb-4">
            You need administrator privileges to access this page. Please contact an administrator to grant you admin access.
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🐾</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Pokémon</h1>
            <p className="text-gray-600">Create a new Pokémon entry for the database</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(form).map(([key, val]) => (
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
        
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            onClick={() => window.history.back()} 
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
                <span>Adding...</span>
              </>
            ) : (
              <>
                <span>🐾</span>
                <span>Add Pokémon</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
