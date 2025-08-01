import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PokemonCard from '../components/PokemonCard';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function MyPokemon() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    legendary: 0,
    mythical: 0,
    types: {}
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    axios.get(`${API_URL}/api/battle/pokemon`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      withCredentials: true,
    })
      .then(res => {
        console.log('MyPokemon API response:', res.data);
        setPokemons(res.data);
        
        // Calculate stats
        const typeCounts = {};
        let legendaryCount = 0;
        let mythicalCount = 0;
        
        res.data.forEach(pokemon => {
          // Count types
          if (pokemon.type1_name) {
            typeCounts[pokemon.type1_name] = (typeCounts[pokemon.type1_name] || 0) + 1;
          }
          if (pokemon.type2_name) {
            typeCounts[pokemon.type2_name] = (typeCounts[pokemon.type2_name] || 0) + 1;
          }
          
          // Count legendary/mythical
          if (pokemon.is_legendary) legendaryCount++;
          if (pokemon.is_mythical) mythicalCount++;
        });
        
        setStats({
          total: res.data.length,
          legendary: legendaryCount,
          mythical: mythicalCount,
          types: typeCounts
        });
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('MyPokemon API error:', err);
        setError('Failed to load your Pokémon');
        setLoading(false);
      });
  }, []);

  const typeColors = {
    'Normal': 'bg-gray-400',
    'Fire': 'bg-red-500',
    'Water': 'bg-blue-500',
    'Electric': 'bg-yellow-400',
    'Grass': 'bg-green-500',
    'Ice': 'bg-cyan-300',
    'Fighting': 'bg-red-700',
    'Poison': 'bg-purple-500',
    'Ground': 'bg-yellow-600',
    'Flying': 'bg-indigo-400',
    'Psychic': 'bg-pink-500',
    'Bug': 'bg-lime-500',
    'Rock': 'bg-yellow-800',
    'Ghost': 'bg-purple-700',
    'Dragon': 'bg-indigo-700',
    'Dark': 'bg-gray-700',
    'Steel': 'bg-gray-500',
    'Fairy': 'bg-pink-300'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-700 text-lg font-medium">Loading your Pokémon collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎒</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">My Pokémon Collection</h1>
                <p className="text-indigo-100 text-lg">Your personal Pokémon team</p>
              </div>
            </div>
            
                         {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
               <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                 <div className="text-3xl font-bold mb-2 text-white">{stats.total}</div>
                 <div className="text-white/90 font-medium">Total Pokémon</div>
               </div>
               <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                 <div className="text-3xl font-bold mb-2 text-yellow-300">{stats.legendary}</div>
                 <div className="text-white/90 font-medium">Legendary</div>
               </div>
               <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                 <div className="text-3xl font-bold mb-2 text-purple-300">{stats.mythical}</div>
                 <div className="text-white/90 font-medium">Mythical</div>
               </div>
               <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                 <div className="text-3xl font-bold mb-2 text-white">{Object.keys(stats.types).length}</div>
                 <div className="text-white/90 font-medium">Types</div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Oops!</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : pokemons.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-slate-200">
                <div className="text-6xl mb-6">🎣</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Empty Collection</h3>
                <p className="text-slate-600 mb-6">You don't own any Pokémon yet. Start your journey to catch them all!</p>
                <button 
                  onClick={() => navigate('/shop')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Visit Shop
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Type Distribution */}
              {Object.keys(stats.types).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Type Distribution</h2>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.types)
                        .sort(([,a], [,b]) => b - a)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center space-x-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                            <span className={`w-3 h-3 rounded-full ${typeColors[type] || 'bg-slate-400'}`}></span>
                            <span className="font-medium text-slate-700">{type}</span>
                            <span className="text-slate-500 text-sm">({count})</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pokémon Grid */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Your Pokémon</h2>
                  <div className="text-slate-600">
                    Showing {pokemons.length} Pokémon
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {pokemons.map(pokemon => (
                    <div key={pokemon.user_pokemon_id} className="transform hover:scale-105 transition-all duration-300">
                      <PokemonCard
                        pokemon={pokemon}
                        onClick={() => navigate(`/my-pokemon/${pokemon.user_pokemon_id}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigate('/shop')}
                    className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  >
                    <span>🛒</span>
                    <span>Buy More Pokémon</span>
                  </button>
                  <button 
                    onClick={() => navigate('/battles')}
                    className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-rose-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
                  >
                    <span>⚔️</span>
                    <span>Start Battle</span>
                  </button>
                  <button 
                    onClick={() => navigate('/pokedex')}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg"
                  >
                    <span>📖</span>
                    <span>View Pokédex</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
