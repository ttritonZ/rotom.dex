import { useState } from 'react';
import axios from 'axios';

export default function AddItem() {
  const [form, setForm] = useState({
    item_name: '',
    item_description: '',
    item_price: ''
  });

  const [image, setImage] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    await axios.post('/api/admin/item', form);

    if (image) {
      const data = new FormData();
      data.append('image', image);
      await axios.post('/api/admin/upload-item-image', data);
    }

    alert('Item added successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-2xl mx-auto">
      <input
        name="item_name"
        value={form.item_name}
        onChange={handleChange}
        placeholder="Item Name"
        className="border p-2 w-full"
        required
      />
      <textarea
        name="item_description"
        value={form.item_description}
        onChange={handleChange}
        placeholder="Description"
        className="border p-2 w-full"
        rows="3"
      />
      <input
        name="item_price"
        value={form.item_price}
        onChange={handleChange}
        placeholder="Price"
        type="number"
        className="border p-2 w-full"
      />
      <input
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={e => setImage(e.target.files[0])}
      />
      <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded">Add Item</button>
    </form>
  );
}
