import { useState } from 'react';
import axios from 'axios';

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

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    await axios.post('/api/admin/character', form);

    if (image) {
      const data = new FormData();
      data.append('image', image);
      await axios.post('/api/admin/upload-character-image', data);
    }

    alert('Character added successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-2xl mx-auto">
      <input
        name="character_name"
        value={form.character_name}
        onChange={handleChange}
        placeholder="Character Name"
        className="border p-2 w-full"
        required
      />
      <input
        name="character_region"
        value={form.character_region}
        onChange={handleChange}
        placeholder="Region ID"
        type="number"
        className="border p-2 w-full"
      />
      <input
        name="trainer_class"
        value={form.trainer_class}
        onChange={handleChange}
        placeholder="Trainer Class"
        className="border p-2 w-full"
      />
      <input
        name="character_description"
        value={form.character_description}
        onChange={handleChange}
        placeholder="Description"
        className="border p-2 w-full"
      />
      <input
        name="preferred_type"
        value={form.preferred_type}
        onChange={handleChange}
        placeholder="Preferred Type ID"
        type="number"
        className="border p-2 w-full"
      />
      <input
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={e => setImage(e.target.files[0])}
      />
      <button type="submit" className="bg-indigo-500 text-white px-6 py-2 rounded">Add Character</button>
    </form>
  );
}
