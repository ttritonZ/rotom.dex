import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AddItem() {
  const [form, setForm] = useState({
    item_name: '',
    item_description: '',
    item_price: '',
    item_category: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
        item_name: form.item_name,
        item_description: form.item_description || null,
        item_price: form.item_price ? Number(form.item_price) : null,
        item_category: form.item_category || null
      };

      await axios.post(`${API_URL}/api/admin/item`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Item added successfully!');
      setForm({
        item_name: '',
        item_description: '',
        item_price: '',
        item_category: ''
      });
    } catch (err) {
      console.error('Submission failed:', err.response?.data || err.message);
      alert('Failed to add item: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎒</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Item</h1>
            <p className="text-gray-600">Create a new item for the Pokémon world</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              placeholder="Enter item name"
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Item Category
            </label>
            <select
              name="item_category"
              value={form.item_category}
              onChange={handleChange}
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
            >
              <option value="">Select Category</option>
              <option value="Poké Ball">Poké Ball</option>
              <option value="Berry">Berry</option>
              <option value="Medicine">Medicine</option>
              <option value="Battle Item">Battle Item</option>
              <option value="Hold Item">Hold Item</option>
              <option value="Evolution Item">Evolution Item</option>
              <option value="TM/HM">TM/HM</option>
              <option value="Key Item">Key Item</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              name="item_price"
              value={form.item_price}
              onChange={handleChange}
              placeholder="Enter price in Poké Dollars"
              type="number"
              min="0"
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white"
            />
          </div>



          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Item Description
            </label>
            <textarea
              name="item_description"
              value={form.item_description}
              onChange={handleChange}
              placeholder="Enter item description..."
              rows="4"
              className="border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 w-full rounded-lg bg-white resize-none"
            />
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
                <span>🎒</span>
                <span>Add Item</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
