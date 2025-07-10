import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AddPokemon() {
  const [form, setForm] = useState({
    sp_id: '', n_dex: '', pokemon_name: '', generation: '', region: '', category: '',
    height: '', weight: '', catch_rate: '', base_experience: '', hp: '', attack: '',
    defence: '', sp_attack: '', sp_defence: '', speed: '', is_mega: false, is_gigantamax: false,
    is_legendary: false, is_mythical: false, is_fossil: false, is_regional_variant: false,
    is_forme_change: false, forme_name: '', is_paradox: false, is_ancient: '', is_future: '',
    is_default: true, price: '', type_1: '', type_2: '', ability_1: '', ability_2: '',
    ability_hidden: '', pokemon_base_name: '', total: '', is_ultrabeast: false
  });

  const [gif, setGif] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post(`${API_URL}/api/admin/pokemon`, form);
    if (gif) {
      const data = new FormData();
      data.append('gif', gif);
      data.append('sp_id', form.sp_id);
      await axios.post(`${API_URL}/api/admin/upload-pokemon-gif`, data);
    }
    alert('Pokémon added successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-3xl mx-auto">
      {Object.entries(form).map(([key, val]) => (
        key !== 'is_default' && key !== 'is_mega' && key !== 'is_gigantamax' && key !== 'is_legendary' &&
        key !== 'is_mythical' && key !== 'is_fossil' && key !== 'is_regional_variant' &&
        key !== 'is_forme_change' && key !== 'is_paradox' && key !== 'is_ultrabeast'
        ? (
          <input
            key={key}
            name={key}
            value={val}
            onChange={handleChange}
            placeholder={key.replace(/_/g, ' ')}
            className="border p-2 w-full"
            type={['height', 'weight', 'catch_rate', 'base_experience', 'hp', 'attack', 'defence', 'sp_attack', 'sp_defence', 'speed', 'price', 'type_1', 'type_2', 'ability_1', 'ability_2', 'ability_hidden', 'total', 'generation', 'region', 'is_ancient', 'is_future'].includes(key) ? 'number' : 'text'}
            required={['sp_id', 'n_dex', 'pokemon_name', 'generation', 'region', 'category', 'type_1', 'ability_1', 'pokemon_base_name', 'total'].includes(key)}
          />
        )
        : null
      ))}
      <div className="grid grid-cols-3 gap-2">
        {['is_mega', 'is_gigantamax', 'is_legendary', 'is_mythical', 'is_fossil', 'is_regional_variant', 'is_forme_change', 'is_paradox', 'is_ultrabeast', 'is_default'].map(attr => (
          <label key={attr} className="flex items-center gap-2">
            <input type="checkbox" name={attr} checked={form[attr]} onChange={handleChange} />
            {attr.replace(/_/g, ' ')}
          </label>
        ))}
      </div>
      <input type="file" accept=".gif" onChange={e => setGif(e.target.files[0])} />
      <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded">Add Pokémon</button>
    </form>
  );
}
