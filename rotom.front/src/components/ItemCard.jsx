import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  const getItemIcon = (category) => {
    switch (category) {
      case 'Poké Ball':
        return '🔴';
      case 'Healing':
        return '💊';
      case 'Battle':
        return '⚔️';
      case 'Evolution':
        return '✨';
      default:
        return '🎒';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Poké Ball':
        return 'from-red-400 to-red-600';
      case 'Healing':
        return 'from-green-400 to-green-600';
      case 'Battle':
        return 'from-purple-400 to-purple-600';
      case 'Evolution':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div 
      className="group bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-green-100 hover:border-green-200 overflow-hidden relative cursor-pointer"
      onClick={() => navigate(`/items/${item.item_id}`)}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Item Icon */}
        <div className="relative mb-4">
          <div className={`w-20 h-20 bg-gradient-to-br ${getCategoryColor(item.category)} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl`}>
            <span className="text-3xl">{getItemIcon(item.category)}</span>
          </div>
          {/* Glow effect on hover */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getCategoryColor(item.category)} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`}></div>
        </div>

        {/* Item Info */}
        <div className="text-center w-full">
          <h2 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors duration-300 line-clamp-2">
            {item.item_name}
          </h2>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {item.item_description}
          </p>

          {/* Category Badge */}
          <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-4 group-hover:bg-green-200 transition-colors duration-300">
            {item.category}
          </div>

          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/items/${item.item_id}`);
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-xl"
          >
            View Details
          </button>
        </div>

        {/* Hover indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">→</span>
          </div>
        </div>
      </div>

      {/* Border animation on hover */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-green-300 transition-all duration-500"></div>
    </div>
  );
}
