import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, Filter, Sparkles, Package, DollarSign, SortAsc, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ItemPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    search: false,
    category: true,
    price: true,
    sort: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/items`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  const filteredItems = items
    .filter(item => item.item_name.toLowerCase().includes(search.toLowerCase()))
    .filter(item => !category || item.category === category)
    .filter(item => {
      if (!priceRange) return true;
      const price = item.price || 0;
      switch (priceRange) {
        case 'free': return price === 0;
        case 'cheap': return price > 0 && price <= 100;
        case 'medium': return price > 100 && price <= 500;
        case 'expensive': return price > 500;
        default: return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.item_name.localeCompare(b.item_name);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return a.item_name.localeCompare(b.item_name);
      }
    });

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setPriceRange('');
    setSortBy('name');
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = search || category || priceRange || sortBy !== 'name';

  const categories = [
    { value: '', label: 'All Categories', icon: '🎒', color: 'from-gray-500 to-gray-600' },
    { value: 'Poké Ball', label: 'Poké Ball', icon: '🔴', color: 'from-red-500 to-red-600' },
    { value: 'Healing', label: 'Healing', icon: '💊', color: 'from-green-500 to-green-600' },
    { value: 'Battle', label: 'Battle', icon: '⚔️', color: 'from-orange-500 to-orange-600' },
    { value: 'Evolution', label: 'Evolution', icon: '✨', color: 'from-purple-500 to-purple-600' },
    { value: 'Berry', label: 'Berry', icon: '🫐', color: 'from-pink-500 to-pink-600' },
    { value: 'Hold', label: 'Hold Items', icon: '💎', color: 'from-blue-500 to-blue-600' },
    { value: 'Key', label: 'Key Items', icon: '🗝️', color: 'from-yellow-500 to-yellow-600' },
    { value: 'TM/HM', label: 'TM/HM', icon: '📀', color: 'from-indigo-500 to-indigo-600' },
    { value: 'Special', label: 'Special', icon: '🌟', color: 'from-cyan-500 to-cyan-600' }
  ];

  const priceRanges = [
    { value: '', label: 'All Prices', icon: '💰', color: 'from-gray-500 to-gray-600' },
    { value: 'free', label: 'Free', icon: '🆓', color: 'from-green-500 to-green-600' },
    { value: 'cheap', label: 'Cheap (≤100)', icon: '💵', color: 'from-blue-500 to-blue-600' },
    { value: 'medium', label: 'Medium (101-500)', icon: '💸', color: 'from-orange-500 to-orange-600' },
    { value: 'expensive', label: 'Expensive (>500)', icon: '💎', color: 'from-purple-500 to-purple-600' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name A-Z', icon: '📝', color: 'from-gray-500 to-gray-600' },
    { value: 'price-low', label: 'Price Low-High', icon: '📈', color: 'from-green-500 to-green-600' },
    { value: 'price-high', label: 'Price High-Low', icon: '📉', color: 'from-red-500 to-red-600' },
    { value: 'category', label: 'Category', icon: '🏷️', color: 'from-blue-500 to-blue-600' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-700 text-lg">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 px-6 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Items
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover powerful items, healing gear, and rare treasures for your Pokémon journey
          </p>
        </div>

        {/* Modern Filter Panel */}
        <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-3xl border-2 border-indigo-200/50 shadow-2xl backdrop-blur-sm overflow-hidden mb-8">
          {/* Collapsible Header */}
          <button
            onClick={toggleFilters}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative overflow-hidden hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-500/20"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Filter className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold tracking-wide">Item Filters</h2>
                <p className="text-indigo-100 text-sm">Find the perfect items for your journey</p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                {isFiltersOpen ? 
                  <ChevronUp size={24} className="group-hover:scale-110 transition-transform duration-200" /> : 
                  <ChevronDown size={24} className="group-hover:scale-110 transition-transform duration-200" />
                }
              </div>
            </div>
          </button>

          {/* Collapsible Content */}
          {isFiltersOpen && (
            <div className="p-6 space-y-6 animate-fade-in">
              {/* Search Bar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-200/50 shadow-lg p-5 hover:shadow-xl transition-all duration-300">
                <label className="block font-bold text-indigo-700 mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Items
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search items by name..."
                  className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-300/50 focus:border-indigo-400 bg-white/50 text-gray-700 shadow-sm transition-all duration-200 placeholder:text-gray-400"
                />
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {search && (
                    <span className="bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold border border-indigo-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                      🔍 Name: {search}
                    </span>
                  )}
                  {category && (
                    <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold border border-purple-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                      📦 Category: {category}
                    </span>
                  )}
                  {priceRange && (
                    <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                      💰 Price: {priceRanges.find(p => p.value === priceRange)?.label}
                    </span>
                  )}
                  {sortBy !== 'name' && (
                    <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                      📊 Sort: {sortOptions.find(s => s.value === sortBy)?.label}
                    </span>
                  )}
                </div>
              )}

              {/* Filter Options */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-indigo-200/50 shadow-lg p-5">
                <h3 className="text-lg font-bold text-indigo-700 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Options
                </h3>
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <button
                      onClick={() => toggleSection('category')}
                      className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-400 hover:from-purple-600 hover:to-pink-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Categories
                      </span>
                      {collapsedSections.category ? 
                        <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                        <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                      }
                    </button>
                    {!collapsedSections.category && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-md animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat.value}
                              onClick={() => setCategory(cat.value)}
                              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                                category === cat.value
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                  : 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md'
                              }`}
                            >
                              {cat.icon} {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <button
                      onClick={() => toggleSection('price')}
                      className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price Range
                      </span>
                      {collapsedSections.price ? 
                        <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                        <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                      }
                    </button>
                    {!collapsedSections.price && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-md animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {priceRanges.map(range => (
                            <button
                              key={range.value}
                              onClick={() => setPriceRange(range.value)}
                              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                                priceRange === range.value
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                  : 'bg-white text-green-700 border-2 border-green-200 hover:border-green-400 hover:shadow-md'
                              }`}
                            >
                              {range.icon} {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort Options */}
                  <div>
                    <button
                      onClick={() => toggleSection('sort')}
                      className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <SortAsc className="w-4 h-4" />
                        Sort Options
                      </span>
                      {collapsedSections.sort ? 
                        <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                        <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                      }
                    </button>
                    {!collapsedSections.sort && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-md animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {sortOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => setSortBy(option.value)}
                              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                                sortBy === option.value
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                  : 'bg-white text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:shadow-md'
                              }`}
                            >
                              {option.icon} {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-4 border-t border-indigo-200">
                    <button
                      onClick={clearFilters}
                      className="w-full bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-4 text-center border border-indigo-200">
                <span className="text-indigo-700 font-bold text-lg">{filteredItems.length} items found</span>
              </div>
            </div>
          )}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <div key={item.item_id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <ItemCard item={item} />
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">No items found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>
    </div>
  );
}
