import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, Tag, Info, Star, Sparkles, Heart } from 'lucide-react';

export default function ItemDetailPage() {
  const { item_id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${item_id}`);
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [item_id]);

  const getItemIcon = (category) => {
    switch (category) {
      case 'Poké Ball': return '🔴';
      case 'Healing': return '💊';
      case 'Battle': return '⚔️';
      case 'Evolution': return '✨';
      case 'Berry': return '🍓';
      case 'TM': return '💿';
      case 'Key Item': return '🗝️';
      default: return '🎒';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Poké Ball': return 'from-red-400 to-red-600';
      case 'Healing': return 'from-green-400 to-green-600';
      case 'Battle': return 'from-purple-400 to-purple-600';
      case 'Evolution': return 'from-yellow-400 to-yellow-600';
      case 'Berry': return 'from-pink-400 to-pink-600';
      case 'TM': return 'from-blue-400 to-blue-600';
      case 'Key Item': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityStars = (category) => {
    const rarityMap = {
      'Key Item': 5, 'Evolution': 4, 'TM': 4,
      'Battle': 3, 'Poké Ball': 3, 'Healing': 2, 'Berry': 1
    };
    return rarityMap[category] || 2;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 animate-pulse">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600 mb-4">Item not found</p>
          <button onClick={() => navigate('/items')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  const rarity = getRarityStars(item.item_category || item.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/items')} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Items</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(rarity)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <button onClick={() => setIsFavorite(!isFavorite)} className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'}`}>
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Item Visual */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className={`w-48 h-48 mx-auto bg-gradient-to-br ${getCategoryColor(item.item_category || item.category)} rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
                      <div className="absolute bottom-6 right-6 w-4 h-4 border-2 border-white/30 rounded-full"></div>
                    </div>
                    <span className="text-8xl relative z-10 drop-shadow-lg">{getItemIcon(item.item_category || item.category)}</span>
                    <Sparkles className="absolute top-6 right-6 w-6 h-6 text-white/60 animate-pulse" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{item.item_name}</h1>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold mb-4 bg-gradient-to-r ${getCategoryColor(item.item_category || item.category)} shadow-lg`}>
                  <Tag className="w-4 h-4" />
                  {item.item_category || item.category || 'Unknown'}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600">{rarity}</div>
                  <div className="text-sm text-gray-600">Rarity</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{item.item_price ? `₽${item.item_price}` : 'N/A'}</div>
                  <div className="text-sm text-gray-600">Price</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Item Details */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />Description
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">{item.item_description || 'No description available for this item.'}</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />Item Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Item ID</span>
                  <span className="text-gray-800">#{item.item_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Category</span>
                  <span className="text-gray-800">{item.item_category || item.category || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Price</span>
                  <span className="text-gray-800">{item.item_price ? `${item.item_price} Poké Dollars` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-600">Rarity Level</span>
                  <div className="flex items-center gap-1">
                    {[...Array(rarity)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
