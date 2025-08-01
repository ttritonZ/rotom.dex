import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default function ManageCharacter() {
  const [characters, setCharacters] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownData, setDropdownData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/characters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    setCharacters(res.data);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      alert('Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/dropdown-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDropdownData(res.data);
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  useEffect(() => {
    fetchCharacters();
    fetchDropdownData();
  }, []);

  const handleDelete = async (character_id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/character/${character_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Character deleted successfully');
    fetchCharacters();
    } catch (err) {
      console.error('Failed to delete character:', err);
      alert('Failed to delete character');
    }
    setShowDeleteConfirm(null);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const submitEdit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      // Ensure trainer_class is always an array
      let trainerClass = editForm.trainer_class;
      if (typeof trainerClass === 'string') trainerClass = [trainerClass];
      else if (!Array.isArray(trainerClass)) trainerClass = null;

      // Convert relevant fields to proper types
      const payload = {
        character_name: editForm.character_name,
        character_region: editForm.character_region ? Number(editForm.character_region) : null,
        trainer_class: trainerClass,
        character_description: editForm.character_description || null,
        preferred_type: editForm.preferred_type ? Number(editForm.preferred_type) : null
      };

      await axios.put(`${API_URL}/api/admin/character/${editForm.character_id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Character updated successfully!');
    setEditForm(null);
    fetchCharacters();
    } catch (err) {
      console.error('Failed to update character:', err.response?.data || err.message);
      alert('Failed to update character: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field, label, type = 'text', options = null) => {
    const value = editForm[field] || '';
    
    if (options && Array.isArray(options)) {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <select
            name={field}
            value={value}
            onChange={handleEditChange}
            className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <textarea
            name={field}
            value={value}
            onChange={handleEditChange}
            rows="3"
            className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white resize-none"
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          name={field}
          value={value}
          onChange={handleEditChange}
          type={type}
          className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Characters</h1>
            <p className="text-gray-600">Edit and delete character information</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {characters.map(character => (
                <tr key={character.character_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{character.character_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{character.character_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{character.character_region || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(character.trainer_class) ? character.trainer_class.join(', ') : character.trainer_class || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{character.preferred_type || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => {
                        // Handle trainer_class array to string conversion
                        const characterForEdit = { ...character };
                        if (Array.isArray(characterForEdit.trainer_class)) {
                          characterForEdit.trainer_class = characterForEdit.trainer_class.join(', ');
                        }
                        setEditForm(characterForEdit);
                      }} 
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(character.character_id)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs transition-colors"
                    >
                      Delete
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Character</h2>
              <button 
                onClick={() => setEditForm(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('character_name', 'Character Name', 'text')}
                {renderField('character_region', 'Region', 'number')}
                {renderField('trainer_class', 'Trainer Class', 'text', [
                  'Ace Trainer', 'Backpacker', 'Beauty', 'Biker', 'Bird Keeper', 'Black Belt',
                  'Bug Catcher', 'Burglar', 'Camper', 'Channeler', 'Cool Trainer', 'Cue Ball',
                  'Engineer', 'Fisherman', 'Gambler', 'Gentleman', 'Hiker', 'Juggler',
                  'Lady', 'Lass', 'Picnicker', 'PokéManiac', 'Pokémon Breeder', 'Pokémon Ranger',
                  'Psychic', 'Rocker', 'Rocket Grunt', 'Rocket Executive', 'Sailor', 'Scientist',
                  'Super Nerd', 'Swimmer', 'Tamer', 'Team Rocket', 'Youngster'
                ])}
                {renderField('preferred_type', 'Preferred Type', 'number')}
              </div>
              
              {renderField('character_description', 'Description', 'textarea')}

              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setEditForm(null)} 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
        </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this character? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
