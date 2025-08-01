import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CharacterCard from '../components/CharacterCard';
import { ChevronDown, ChevronUp, Search, Filter, Sparkles, MapPin, Zap, Users, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function CharacterPage() {
  const [characters, setCharacters] = useState([]);
  const [regions, setRegions] = useState([]);
  const [types, setTypes] = useState([]);
  const [trainerClasses, setTrainerClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    regions: true,
    types: true,
    classes: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charactersRes, regionsRes, typesRes, classesRes] = await Promise.all([
          axios.get(`${API_URL}/api/characters`),
          axios.get(`${API_URL}/api/characters/regions`),
          axios.get(`${API_URL}/api/characters/types`),
          axios.get(`${API_URL}/api/characters/trainer-classes`)
        ]);
        
        setCharacters(charactersRes.data);
        setRegions(regionsRes.data);
        setTypes(typesRes.data);
        setTrainerClasses(classesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredCharacters = characters
    .filter(c => c.character_name.toLowerCase().includes(search.toLowerCase()))
    .filter(c => selectedRegions.length === 0 || selectedRegions.includes(c.character_region))
    .filter(c => selectedTypes.length === 0 || selectedTypes.includes(c.preferred_type_name))
    .filter(c => selectedClasses.length === 0 || c.trainer_class.some(cls => selectedClasses.includes(cls)))
    .sort((a, b) => a.character_name.localeCompare(b.character_name));

  const clearFilters = () => {
    setSearch('');
    setSelectedRegions([]);
    setSelectedTypes([]);
    setSelectedClasses([]);
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

  const toggleFilter = (filterType, value) => {
    switch (filterType) {
      case 'regions':
        setSelectedRegions(prev => prev.includes(value)
          ? prev.filter(id => id !== value)
          : [...prev, value]
        );
        break;
      case 'types':
        setSelectedTypes(prev => prev.includes(value)
          ? prev.filter(id => id !== value)
          : [...prev, value]
        );
        break;
      case 'classes':
        setSelectedClasses(prev => prev.includes(value)
          ? prev.filter(c => c !== value)
          : [...prev, value]
        );
        break;
    }
  };

  const hasActiveFilters = search || selectedRegions.length > 0 || selectedTypes.length > 0 || selectedClasses.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 text-lg">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No characters found</h3>
          <p className="text-gray-500">There are no characters available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 pt-20 px-6 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-4">
            Characters
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover trainers, champions, and legendary characters from the Pokémon world
          </p>
        </div>

        {/* Modern Filter Panel */}
        <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl border-2 border-green-200/50 shadow-2xl backdrop-blur-sm overflow-hidden mb-8">
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
                <h2 className="text-2xl font-bold tracking-wide">Character Filters</h2>
                <p className="text-green-100 text-sm">Find your favorite trainers and champions</p>
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-5 hover:shadow-xl transition-all duration-300">
                <label className="block font-bold text-green-700 mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Characters
                </label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300/50 focus:border-green-400 bg-white/50 text-gray-700 shadow-sm transition-all duration-200 placeholder:text-gray-400"
                />
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {search && (
                    <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                      🔍 Name: {search}
                    </span>
                  )}
                  {selectedRegions.length > 0 && (
                    <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                      🗺️ Regions: {selectedRegions.length} selected
                    </span>
                  )}
                  {selectedTypes.length > 0 && (
                    <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold border border-purple-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                      ⚡ Types: {selectedTypes.length} selected
                    </span>
                  )}
                  {selectedClasses.length > 0 && (
                    <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold border border-orange-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                      👤 Classes: {selectedClasses.length} selected
                    </span>
                  )}
                </div>
              )}

              {/* Filter Options */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-5">
                <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Options
                </h3>
                <div className="space-y-4">
                  {/* Regions */}
                  <div>
                    <button
                      onClick={() => toggleSection('regions')}
                      className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Regions
                      </span>
                      {collapsedSections.regions ? 
                        <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                        <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                      }
                    </button>
                    {!collapsedSections.regions && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-md animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {regions.map(region => (
                            <button
                              key={region.region_id}
                              onClick={() => toggleFilter('regions', region.region_id)}
                              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                                selectedRegions.includes(region.region_id)
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                  : 'bg-white text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:shadow-md'
                              }`}
                            >
                              {region.region_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Types */}
                  <div>
                    <button
                      onClick={() => toggleSection('types')}
                      className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-400 hover:from-purple-600 hover:to-pink-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Preferred Types
                      </span>
                      {collapsedSections.types ? 
                        <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                        <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                      }
                    </button>
                    {!collapsedSections.types && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-md animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {types.map(type => (
                            <button
                              key={type.type_id}
                              onClick={() => toggleFilter('types', type.type_id)}
                              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                                selectedTypes.includes(type.type_id)
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                  : 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md'
                              }`}
                            >
                              {type.type_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trainer Classes */}
                  <div>
                    <button
                      onClick={() => toggleSection('classes')}
                      className="w-full px-4 py-3 rounded-xl shadow-md border-2 font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none bg-gradient-to-r from-orange-500 to-red-600 text-white border-orange-400 hover:from-orange-600 hover:to-red-700 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Trainer Classes
                      </span>
                      {collapsedSections.classes ? 
                        <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-200" /> : 
                        <ChevronUp size={18} className="group-hover:-rotate-180 transition-transform duration-200" />
                      }
                    </button>
                    {!collapsedSections.classes && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-md animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {trainerClasses.map(cls => (
                            <button
                              key={cls}
                              onClick={() => toggleFilter('classes', cls)}
                              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                                selectedClasses.includes(cls)
                                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                                  : 'bg-white text-orange-700 border-2 border-orange-200 hover:border-orange-400 hover:shadow-md'
                              }`}
                            >
                              {cls}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-4 border-t border-green-200">
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
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 text-center border border-green-200">
                <span className="text-green-700 font-bold text-lg">{filteredCharacters.length} characters found</span>
              </div>
            </div>
          )}
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((character, index) => (
            <div key={character.character_id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CharacterCard character={character} />
            </div>
          ))}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No characters found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
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
