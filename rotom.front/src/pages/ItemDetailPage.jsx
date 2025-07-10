import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function ItemDetailPage() {
  const { item_id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/items/${item_id}`).then(res => setItem(res.data));
  }, [item_id]);

  if (!item) return <p className="p-6">Loading item details...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl mb-4">{item.item_name}</h1>
      <img src={`/assets/items/${item.item_image}`} alt={item.item_name} className="h-48 mb-4 mx-auto" />
      <p className="mb-2"><strong>Category:</strong> {item.item_description}</p>
      <p><strong>Description:</strong> {item.item_description}</p>
    </div>
  );
}
