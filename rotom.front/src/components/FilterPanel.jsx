import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Search, Filter, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function FilterPanel({ filters, setFilters, applyFilters }) {
  const [types, setTypes] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // State for collapsible sections - all collapsed by default
  const [collapsedSections, setCollapsedSections] = useState({
    types: true,
    abilities: true,
    regions: true,
    specialFlags: true,
    stats: true
  });

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleList = (key, id) => {
    console.log(`Toggling ${key} with id:`, id);
    setFilters(prev => {
      const list = new Set(prev[key] || []);
      list.has(id) ? list.delete(id) : list.add(id);
      const newFilters = { ...prev, [key]: Array.from(list) };
      console.log(`New ${key} filters:`, newFilters[key]);
      return newFilters;
    });
  };

  const toggleBoolean = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateStatRange = (stat, field, value) => {
    setFilters(prev => ({
      ...prev,
      statRanges: {
        ...prev.statRanges,
        [stat]: {
          ...prev.statRanges[stat],
          [field]: value
        }
      }
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [typesRes, abilitiesRes, regionsRes] = await Promise.all([
          axios.get(`${API_URL}/api/pokemon/types`),
          axios.get(`${API_URL}/api/pokemon/abilities`),
          axios.get(`${API_URL}/api/pokemon/regions`)
        ]);
        
        setTypes(typesRes.data);
        setAbilities(abilitiesRes.data);
        setRegions(regionsRes.data);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError('Failed to load filter options.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 shadow-xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-green-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-6 bg-green-200 rounded"></div>
            <div className="h-6 bg-green-200 rounded w-3/4"></div>
            <div className="h-6 bg-green-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="text-red-600 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl border-2 border-green-200/50 shadow-2xl backdrop-blur-sm overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={toggleFilters}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative overflow-hidden hover:from-green-600 hover:to-emerald-700 transition-all duration-300 group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20"></div>
        <div className="relative flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Filter className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-2xl font-bold tracking-wide">Pokédex Filters</h2>
            <p className="text-green-100 text-sm">Discover your perfect Pokémon</p>
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
          {/* Name Filter - Always visible */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-5 hover:shadow-xl transition-all duration-300">
            <label className="block font-bold text-green-700 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Name Search
            </label>
            <input
              type="text"
              value={filters.name || ''}
              onChange={e => {
                const value = e.target.value;
                if (!window.__filterNameDebounce) window.__filterNameDebounce = {};
                clearTimeout(window.__filterNameDebounce.timeout);
                window.__filterNameDebounce.timeout = setTimeout(() => {
                  setFilters(prev => ({ ...prev, name: value }));
                }, 300);
              }}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300/50 focus:border-green-400 bg-white/50 text-gray-700 shadow-sm transition-all duration-200 placeholder:text-gray-400"
              placeholder="Search by name..."
            />
          </div>

          {/* Filter Buttons and Options */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-5">
            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Options
            </h3>
            <div className="space-y-4">
              {/* Types */}
              <div>
                <button
                  onClick={() => toggleSection('types')}
                  className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Types
                  </span>
                  {collapsedSections.types ? 
                    <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                    <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                  }
                </button>
                {!collapsedSections.types && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-md animate-fade-in">
                    <div className="flex flex-wrap gap-2">
                      {types.map(type => (
                        <button
                          key={type.type_id}
                          onClick={() => toggleList('types', type.type_id)}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                            (filters.types || []).includes(type.type_id)
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                              : 'bg-white text-green-700 border-2 border-green-200 hover:border-green-400 hover:shadow-md'
                          }`}
                        >
                          {type.type_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Abilities */}
              <div>
                <button
                  onClick={() => toggleSection('abilities')}
                  className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Abilities
                  </span>
                  {collapsedSections.abilities ? 
                    <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                    <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                  }
                </button>
                {!collapsedSections.abilities && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-md animate-fade-in">
                    <div className="flex flex-wrap gap-2">
                      {abilities.map(ability => (
                        <button
                          key={ability.ability_id}
                          onClick={() => toggleList('abilities', ability.ability_id)}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                            (filters.abilities || []).includes(ability.ability_id)
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'bg-white text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:shadow-md'
                          }`}
                        >
                          {ability.ability_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Regions */}
              <div>
                <button
                  onClick={() => toggleSection('regions')}
                  className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-400 hover:from-purple-600 hover:to-pink-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Regions
                  </span>
                  {collapsedSections.regions ? 
                    <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                    <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                  }
                </button>
                {!collapsedSections.regions && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-md animate-fade-in">
                    <div className="flex flex-wrap gap-2">
                      {regions.map(region => (
                        <button
                          key={region.region_id}
                          onClick={() => toggleList('region', region.region_id)}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                            (filters.region || []).includes(region.region_id)
                              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                              : 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md'
                          }`}
                        >
                          {region.region_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Special Flags */}
              <div>
                <button
                  onClick={() => toggleSection('specialFlags')}
                  className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-orange-500 to-red-600 text-white border-orange-400 hover:from-orange-600 hover:to-red-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Special Categories
                  </span>
                  {collapsedSections.specialFlags ? 
                    <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                    <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                  }
                </button>
                {!collapsedSections.specialFlags && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-md animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'legendary', label: 'Legendary', color: 'from-yellow-500 to-orange-600' },
                        { key: 'mythical', label: 'Mythical', color: 'from-purple-500 to-pink-600' },
                        { key: 'ultrabeast', label: 'Ultra Beast', color: 'from-indigo-500 to-purple-600' },
                        { key: 'fossil', label: 'Fossil', color: 'from-amber-500 to-yellow-600' },
                        { key: 'paradox', label: 'Paradox', color: 'from-red-500 to-pink-600' },
                        { key: 'mega', label: 'Mega', color: 'from-pink-500 to-rose-600' },
                        { key: 'gmax', label: 'Gigantamax', color: 'from-cyan-500 to-blue-600' },
                        { key: 'variant', label: 'Regional Variant', color: 'from-emerald-500 to-teal-600' }
                      ].map(flag => (
                        <button
                          key={flag.key}
                          onClick={() => toggleBoolean(flag.key)}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                            filters[flag.key]
                              ? `bg-gradient-to-r ${flag.color} text-white shadow-lg`
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }`}
                        >
                          {flag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div>
                <button
                  onClick={() => toggleSection('stats')}
                  className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-teal-400 hover:from-teal-600 hover:to-cyan-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Stats Range
                  </span>
                  {collapsedSections.stats ? 
                    <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                    <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                  }
                </button>
                {!collapsedSections.stats && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 shadow-md animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'hp', label: 'HP', color: 'from-red-500 to-pink-600' },
                        { key: 'attack', label: 'Attack', color: 'from-orange-500 to-red-600' },
                        { key: 'defence', label: 'Defense', color: 'from-blue-500 to-indigo-600' },
                        { key: 'sp_attack', label: 'Sp. Atk', color: 'from-purple-500 to-pink-600' },
                        { key: 'sp_defence', label: 'Sp. Def', color: 'from-green-500 to-emerald-600' },
                        { key: 'speed', label: 'Speed', color: 'from-yellow-500 to-orange-600' }
                      ].map(stat => (
                        <div key={stat.key} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">{stat.label}</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.statRanges?.[stat.key]?.min || ''}
                              onChange={(e) => updateStatRange(stat.key, 'min', e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 bg-white/80"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.statRanges?.[stat.key]?.max || ''}
                              onChange={(e) => updateStatRange(stat.key, 'max', e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 bg-white/80"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
