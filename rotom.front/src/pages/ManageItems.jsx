import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ManageItem() {
  const [items, setItems] = useState([]);
  const [editForm, setEditForm] = useState(null);

  const fetchItems = async () => {
    const res = await axios.get('/api/items/all');
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (item_id) => {
    await axios.delete(`/api/admin/item/${item_id}`);
    alert('Item deleted');
    fetchItems();
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const submitEdit = async e => {
    e.preventDefault();
    await axios.put(`/api/admin/item/${editForm.item_id}`, editForm);
    alert('Item updated');
    setEditForm(null);
    fetchItems();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Items</h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.item_id}>
                <td className="border p-2">{i.item_id}</td>
                <td className="border p-2">{i.item_name}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => setEditForm(i)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(i.item_id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editForm && (
        <form onSubmit={submitEdit} className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Edit Item</h2>
          <input value={editForm.item_name} name="item_name" onChange={handleEditChange} placeholder="Item Name" className="border p-2 w-full" required />
          <textarea value={editForm.item_description} name="item_description" onChange={handleEditChange} placeholder="Description" className="border p-2 w-full" />
          <input value={editForm.item_price} name="item_price" type="number" onChange={handleEditChange} placeholder="Price" className="border p-2 w-full" />
          <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded">Save Changes</button>
          <button onClick={() => setEditForm(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
        </form>
      )}
    </div>
  );
}
