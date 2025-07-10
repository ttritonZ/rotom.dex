import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="border p-3 rounded shadow text-center hover:shadow-lg transition">
      <img
        src={`/assets/items/${item.item_image}`}
        alt={item.item_name}
        className="h-24 mx-auto mb-2"
      />
      <h2 className="font-semibold text-lg">{item.item_name}</h2>
      <p className="text-sm text-gray-600 mt-1 truncate">{item.item_description}</p>
      <button
        onClick={() => navigate(`/items/${item.item_id}`)}
        className="mt-3 text-blue-500"
      >
        View Details
      </button>
    </div>
  );
}
