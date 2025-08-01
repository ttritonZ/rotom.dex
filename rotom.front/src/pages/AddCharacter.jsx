import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AddCharacter() {
  const [form, setForm] = useState({
    character_name: '',
    character_region: '',
    trainer_class: '',
    character_image: '',
    character_description: '',
    preferred_type: ''
  });

  const [image, setImage] = useState(null);
  const [dropdowns, setDropdowns] = useState({ types: [], regions: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${API_URL}/api/admin/dropdown-data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDropdowns({
          types: res.data.types || [],
          regions: res.data.regions || []
        });
      } catch (err) {
        console.error('Dropdown fetch error:', err);
      }
    };

    fetchDropdowns();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      // Convert relevant fields to proper types
      const payload = {
        character_name: form.character_name,
        character_region: form.character_region ? Number(form.character_region) : null,
        trainer_class: form.trainer_class ? [form.trainer_class] : null,
        character_image: form.character_image || null,
        character_description: form.character_description || null,
        preferred_type: form.preferred_type ? Number(form.preferred_type) : null
      };

      await axios.post(`${API_URL}/api/admin/character`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (image) {
        const data = new FormData();
        data.append('image', image);
        await axios.post(`${API_URL}/api/admin/upload-character-image`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      alert('Character added successfully!');
      setForm({
        character_name: '',
        character_region: '',
        trainer_class: '',
        character_image: '',
        character_description: '',
        preferred_type: ''
      });
      setImage(null);
    } catch (err) {
      console.error('Submission failed:', err.response?.data || err.message);
      alert('Failed to add character: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Character</h1>
            <p className="text-gray-600">Create a new character for the Pokémon world</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Character Name <span className="text-red-500">*</span>
            </label>
            <input
              name="character_name"
              value={form.character_name}
              onChange={handleChange}
              placeholder="Enter character name"
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <select
              name="character_region"
              value={form.character_region}
              onChange={handleChange}
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
            >
              <option value="">Select Region</option>
              {dropdowns.regions.map(r => (
                <option key={r.region_id} value={r.region_id.toString()}>
                  {r.region_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Trainer Class
            </label>
            <select
              name="trainer_class"
              value={form.trainer_class}
              onChange={handleChange}
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
            >
              <option value="">Select Trainer Class</option>
              <option value="Gym Leader">Gym Leader</option>
              <option value="Elite Four">Elite Four</option>
              <option value="Champion">Champion</option>
              <option value="Rival">Rival</option>
              <option value="Professor">Professor</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Trainer">Trainer</option>
              <option value="Breeder">Breeder</option>
              <option value="Collector">Collector</option>
              <option value="Ace Trainer">Ace Trainer</option>
              <option value="Pokémon Ranger">Pokémon Ranger</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Preferred Type
            </label>
            <select
              name="preferred_type"
              value={form.preferred_type}
              onChange={handleChange}
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
            >
              <option value="">Select Preferred Type</option>
              {dropdowns.types.map(t => (
                <option key={t.type_id} value={t.type_id.toString()}>
                  {t.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Character Description
            </label>
            <textarea
              name="character_description"
              value={form.character_description}
              onChange={handleChange}
              placeholder="Enter character description..."
              rows="4"
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white resize-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Character Image URL
            </label>
            <input
              name="character_image"
              value={form.character_image}
              onChange={handleChange}
              placeholder="Enter image URL or upload file below"
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload Image File
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={e => setImage(e.target.files[0])}
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {image && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {image.name}
              </p>
            )}
          </div>
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
                <span>👤</span>
                <span>Add Character</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
