import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonCard from '../components/PokemonCard';
import FilterPanel from '../components/FilterPanel';
import SidebarPanel from '../components/SidebarPanel';
import Loading from '../components/Loading';
import { X, ChevronDown, ChevronUp, Filter, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function PokedexPage() {
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    types: [],
    abilities: [],
    region: [],
    legendary: false,
    mythical: false,
    ultrabeast: false,
    fossil: false,
    paradox: false,
    mega: false,
    gmax: false,
    variant: false,
    statRanges: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    // If any filter is set, apply filters, else fetch all
    const hasFilters = Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : typeof val === 'object' ? Object.keys(val).length > 0 : val);
    if (hasFilters) {
      applyFilters();
    } else {
      fetchPokemon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPokemon = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/pokemon`);
      setPokemonList(res.data);
    } catch (err) {
      setError('Failed to load Pokémon.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/pokemon/filter`, filters);
      setPokemonList(res.data);
    } catch (err) {
      setError('Failed to filter Pokémon.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      types: [],
      abilities: [],
      region: [],
      legendary: false,
      mythical: false,
      ultrabeast: false,
      fossil: false,
      paradox: false,
      mega: false,
      gmax: false,
      variant: false,
      statRanges: {}
    });
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const hasActiveFilters = Object.values(filters).some(val => 
    Array.isArray(val) ? val.length > 0 : 
    typeof val === 'object' ? Object.keys(val).length > 0 : 
    val
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 pt-20 px-6 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-4">
            Pokédex
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and explore all Pokémon from every region
          </p>
        </div>



          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 justify-center animate-fade-in-up">
              {filters.name && (
                <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                  🔍 Name: {filters.name}
                </span>
              )}
              {filters.types.length > 0 && (
                <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                  🎨 Types: {filters.types.join(', ')}
                </span>
              )}
              {filters.legendary && (
                <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold border border-purple-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                  ⭐ Legendary
                </span>
              )}
              {filters.mythical && (
                <span className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold border border-pink-300 shadow-md transform hover:scale-105 transition-transform duration-200">
                  ✨ Mythical
                </span>
              )}
            </div>
          )}
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
                <h2 className="text-2xl font-bold tracking-wide">Pokémon Filters</h2>
                <p className="text-green-100 text-sm">Find your favorite Pokémon from all regions</p>
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
              <FilterPanel 
                filters={filters} 
                setFilters={setFilters} 
                applyFilters={applyFilters}
              />

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-green-200">
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
          )}
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
        <div className="flex gap-8">
          {/* Pokemon Grid */}
          <div className={`${selectedPokemon ? 'w-3/4' : 'w-full'} transition-all duration-300`}>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-green-700 text-lg">Loading Pokémon...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl max-w-md mx-auto">
                  {error}
                </div>
              </div>
            )}

            {!loading && !error && pokemonList.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm border border-green-200 text-gray-600 px-6 py-4 rounded-2xl max-w-md mx-auto">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No Pokémon found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              </div>
            )}

            {!loading && !error && pokemonList.length > 0 && (
              <div className={`grid gap-8 gap-y-32 pt-16 ${selectedPokemon ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5'}`}>
                {pokemonList.map((pokemon, index) => (
                  <div 
                    key={pokemon.sp_id} 
                    className="animate-fade-in-up" 
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      animationDuration: '0.6s'
                    }}
                  >
                    <PokemonCard 
                      pokemon={pokemon} 
                      onClick={() => setSelectedPokemon(pokemon)} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {selectedPokemon && (
            <div className="w-1/4">
              <SidebarPanel 
                selectedPokemon={selectedPokemon} 
                closeSidebar={() => setSelectedPokemon(null)} 
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
        
        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  );
}