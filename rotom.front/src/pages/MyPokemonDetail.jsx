import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Heart, Zap, Shield, Target, TrendingUp, Edit3, X, Save } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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

export default function MyPokemonDetail() {
  const { pokemonId } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    axios.get(`${API_URL}/api/battle/pokemon/${pokemonId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      withCredentials: true,
    })
      .then(res => {
        setPokemon(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load Pokémon details');
        setLoading(false);
      });
    axios.get(`${API_URL}/api/battle/pokemon/${pokemonId}/moves`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      withCredentials: true,
    })
      .then(res => setMoves(res.data))
      .catch(() => setMoves([]));
  }, [pokemonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-700 text-lg">Loading Pokémon details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-2">Error loading Pokémon</h3>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-2">Pokémon not found</h3>
          <p className="text-slate-500">The Pokémon you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const statsData = [
    { stat: 'HP', value: pokemon.hp, icon: Heart },
    { stat: 'Attack', value: pokemon.attack, icon: Zap },
    { stat: 'Defense', value: pokemon.defence, icon: Shield },
    { stat: 'Sp. Atk', value: pokemon.sp_attack, icon: Target },
    { stat: 'Sp. Def', value: pokemon.sp_defence, icon: Shield },
    { stat: 'Speed', value: pokemon.speed, icon: TrendingUp },
  ];

  const formatNdex = (ndex) => {
    return `#${String(ndex).padStart(3, '0')}`;
  };

  const handleSaveNickname = async () => {
    if (!newNickname.trim()) {
      setError('Nickname cannot be empty');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    // Get token from all possible locations
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      setIsSaving(false);
      return;
    }

    try {
      // Decode token to check user info (for debugging)
      const tokenParts = token.split('.');
      const tokenPayload = tokenParts.length > 1 ? 
        JSON.parse(atob(tokenParts[1])) : 
        { error: 'Invalid token format' };
      
      console.log('Token payload:', tokenPayload);
      console.log('Updating nickname with:', {
        pokemonId,
        nickname: newNickname.trim(),
        userId: tokenPayload.userId || tokenPayload.user_id,
        tokenLength: token.length,
        tokenStartsWith: token.substring(0, 10) + '...',
        backendUrl: API_URL
      });
      
      const response = await axios.put(
        `${API_URL}/api/pokemon/nickname/${pokemonId}`,
        { 
          nickname: newNickname.trim(),
          // Include user ID from token in the body for additional verification
          userId: tokenPayload.userId || tokenPayload.user_id 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true,
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );

      console.log('Nickname update response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      if (response.status === 403) {
        // Handle 403 Forbidden specifically
        const errorMsg = response.data?.error || 'You do not have permission to update this Pokemon';
        console.error('Permission denied:', errorMsg);
        setError(errorMsg);
        
        // If token is invalid, clear it and suggest re-login
        if (errorMsg.includes('token') || errorMsg.includes('authenticate')) {
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          setError('Session expired. Please log in again.');
        }
        return;
      }

      if (response.status === 200 && response.data?.success) {
        setPokemon(prev => ({
          ...prev,
          nickname: newNickname.trim() === '' ? null : newNickname.trim()
        }));
        setIsEditingNickname(false);
      } else {
        setError(response.data?.error || 'Failed to update nickname');
      }
    } catch (error) {
      console.error('Failed to update nickname:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      if (error.response) {
        // Handle different HTTP error statuses
        if (error.response.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (error.response.status === 403) {
          setError('You can only edit your own Pokémon.');
        } else if (error.response.status === 404) {
          setError('Pokémon not found.');
        } else if (error.response.data?.error) {
          setError(error.response.data.error);
        } else {
          setError('Failed to update nickname. Please try again.');
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Collection
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Pokemon Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Pokemon Image */}
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-8 shadow-inner">
                <img 
                  src={`/src/assets/pokemons/${pokemon.sp_id}.png`} 
                  alt={pokemon.pokemon_name} 
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    e.target.src = `/src/assets/gif/${pokemon.sp_id}.gif`;
                  }}
                />
              </div>
            </div>

            {/* Pokemon Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                <p className="text-lg text-gray-500 font-medium mb-2">
                  {formatNdex(pokemon.n_dex)}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  {isEditingNickname ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        className="border rounded px-2 py-1 text-lg font-bold text-gray-800"
                        placeholder="Enter nickname"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveNickname}
                        disabled={isSaving}
                        className="text-green-600 hover:bg-green-100 p-1 rounded"
                        title="Save"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingNickname(false);
                          setNewNickname('');
                        }}
                        className="text-red-600 hover:bg-red-100 p-1 rounded"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {pokemon.nickname || pokemon.pokemon_name}
                      </h1>
                      <button
                        onClick={() => {
                          setNewNickname(pokemon.nickname || '');
                          setIsEditingNickname(true);
                        }}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit nickname"
                      >
                        <Edit3 size={18} />
                      </button>
                    </>
                  )}
                </div>
                {pokemon.nickname && !isEditingNickname && (
                  <p className="text-gray-500 text-sm italic">
                    {pokemon.pokemon_name}
                  </p>
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {pokemon.nickname || pokemon.pokemon_name}
                </h1>
                {pokemon.nickname && (
                  <p className="text-lg text-gray-600 mb-4">
                    ({pokemon.pokemon_name})
                  </p>
                )}
              </div>

              {/* Types */}
              <div className="flex gap-3 justify-center lg:justify-start mb-6">
                {pokemon.type1_name && (
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${typeColors[pokemon.type1_name] || 'bg-gray-400'}`}>
                    {pokemon.type1_name}
                  </span>
                )}
                {pokemon.type2_name && (
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${typeColors[pokemon.type2_name] || 'bg-gray-400'}`}>
                    {pokemon.type2_name}
                  </span>
                )}
              </div>

              {/* Level and EXP Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p className="text-emerald-600 text-sm font-medium">Level</p>
                  <p className="text-2xl font-bold text-emerald-700">{pokemon.level}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-blue-600 text-sm font-medium">Experience</p>
                  <p className="text-2xl font-bold text-blue-700">{pokemon.exp}</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Category</p>
                  <p className="font-semibold">{pokemon.category || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Height</p>
                  <p className="font-semibold">{pokemon.height || 'Unknown'}m</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Weight</p>
                  <p className="font-semibold">{pokemon.weight || 'Unknown'}kg</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Base Exp</p>
                  <p className="font-semibold">{pokemon.base_experience || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Catch Rate</p>
                  <p className="font-semibold">{pokemon.catch_rate || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Total Stats</p>
                  <p className="font-semibold">{pokemon.total || (pokemon.hp + pokemon.attack + pokemon.defence + pokemon.sp_attack + pokemon.sp_defence + pokemon.speed)}</p>
                </div>
              </div>

              {/* Abilities */}
              {(pokemon.ability1_name || pokemon.ability2_name || pokemon.ability_hidden_name) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Abilities</h3>
                  <div className="space-y-3">
                    {pokemon.ability1_name && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">{pokemon.ability1_name}</h4>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Primary</span>
                        </div>
                        {pokemon.ability1_description && (
                          <p className="text-sm text-blue-700">{pokemon.ability1_description}</p>
                        )}
                      </div>
                    )}
                    
                    {pokemon.ability2_name && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-900">{pokemon.ability2_name}</h4>
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Secondary</span>
                        </div>
                        {pokemon.ability2_description && (
                          <p className="text-sm text-green-700">{pokemon.ability2_description}</p>
                        )}
                      </div>
                    )}
                    
                    {pokemon.ability_hidden_name && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-purple-900">{pokemon.ability_hidden_name}</h4>
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Hidden</span>
                        </div>
                        {pokemon.ability_hidden_description && (
                          <p className="text-sm text-purple-700">{pokemon.ability_hidden_description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Stats Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Base Stats</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={statsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="stat" />
                  <PolarRadiusAxis angle={30} domain={[0, 200]} />
                  <Radar 
                    name="Stats" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    fill="#0ea5e9" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Moves */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Moves</h2>
            {moves.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No moves available.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {moves.map(move => (
                  <div key={move.move_name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{move.move_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${typeColors[move.type_name] || 'bg-gray-400'}`}>
                        {move.type_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                      <span>Power: {move.power || '-'}</span>
                      <span>PP: {move.pp || '-'}</span>
                      <span>Level: {move.level || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
