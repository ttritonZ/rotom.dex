import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default function ManageItem() {
  const [items, setItems] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      alert('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (item_id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/item/${item_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Item deleted successfully');
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item');
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

      // Convert relevant fields to proper types
      const payload = {
        item_name: editForm.item_name,
        item_description: editForm.item_description || null,
        item_price: editForm.item_price ? Number(editForm.item_price) : null,
        item_category: editForm.item_category || null
      };

      await axios.put(`${API_URL}/api/admin/item/${editForm.item_id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Item updated successfully!');
      setEditForm(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to update item:', err.response?.data || err.message);
      alert('Failed to update item: ' + (err.response?.data?.error || err.message));
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
            <span className="text-2xl">🎒</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Items</h1>
            <p className="text-gray-600">Edit and delete item information</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.item_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.item_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.item_category || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.item_price ? `${item.item_price} Poké Dollars` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {item.item_description || 'No description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => setEditForm(item)} 
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(item.item_id)} 
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
              <h2 className="text-2xl font-bold text-gray-800">Edit Item</h2>
              <button 
                onClick={() => setEditForm(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('item_name', 'Item Name', 'text')}
                {renderField('item_category', 'Category', 'text', [
                  'Poké Ball', 'Berry', 'Medicine', 'Battle Item', 'Hold Item', 
                  'Evolution Item', 'TM/HM', 'Key Item', 'Other'
                ])}
                {renderField('item_price', 'Price (Poké Dollars)', 'number')}
              </div>
              
              {renderField('item_description', 'Description', 'textarea')}

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
            <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
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
