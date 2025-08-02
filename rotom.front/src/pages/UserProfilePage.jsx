import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Trophy, Star, Edit3, Save, X, Trash2 } from 'lucide-react';
import { UserContext } from '../contexts/UserContext';

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

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [userPokemon, setUserPokemon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPokemon, setEditingPokemon] = useState(null);
  const [newNickname, setNewNickname] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [pokemonToRelease, setPokemonToRelease] = useState(null);
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const profileResponse = await axios.get(`${API_URL}/api/auth/profile/${userId}`);
        setProfile(profileResponse.data);
        
        try {
          const pokemonResponse = await axios.get(`${API_URL}/api/pokemon/user/${userId}`);
          setUserPokemon(pokemonResponse.data || []);
        } catch (pokemonError) {
          console.warn('Could not fetch user Pokemon:', pokemonError);
          setUserPokemon([]);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (typeName) => {
    return typeColors[typeName] || 'bg-gray-400';
  };

  const handleEditNickname = (pokemon) => {
    setEditingPokemon(pokemon);
    setNewNickname(pokemon.nickname || '');
  };

  const handleSaveNickname = async () => {
    if (!editingPokemon) return;
    
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/pokemon/nickname/${editingPokemon.user_pokemon_id}`,
        { nickname: newNickname.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state
      setUserPokemon(prev => 
        prev.map(p => 
          p.user_pokemon_id === editingPokemon.user_pokemon_id 
            ? { ...p, nickname: newNickname.trim() }
            : p
        )
      );
      
      setEditingPokemon(null);
      setNewNickname('');
    } catch (error) {
      console.error('Error updating nickname:', error);
      alert('Failed to update nickname. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPokemon(null);
    setNewNickname('');
  };

  const handleReleaseClick = (pokemon) => {
    setPokemonToRelease(pokemon);
  };

  const confirmRelease = async () => {
    if (!pokemonToRelease) return;
    
    try {
      setIsReleasing(true);
      await axios.delete(`${API_URL}/api/pokemon/${pokemonToRelease.user_pokemon_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update the UI by removing the released Pokemon
      setUserPokemon(prev => prev.filter(p => p.user_pokemon_id !== pokemonToRelease.user_pokemon_id));
      setPokemonToRelease(null);
      
      // Show success message
      alert(`${pokemonToRelease.nickname || pokemonToRelease.pokemon_name} has been released!`);
    } catch (error) {
      console.error('Error releasing Pokemon:', error);
      alert('Failed to release Pokemon. Please try again.');
    } finally {
      setIsReleasing(false);
    }
  };

  const cancelRelease = () => {
    setPokemonToRelease(null);
  };

  const isOwnProfile = () => {
    return user && profile && user.user_id === parseInt(userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-700 text-lg">Loading trainer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-2">Profile not found</h3>
          <p className="text-slate-500 mb-6">{error || 'This trainer profile could not be found.'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 px-6 pb-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-white/50 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {profile.username}'s Profile
            </h1>
            <p className="text-slate-600 text-lg">Trainer Profile & Pokémon Collection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-lg">
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mt-4">{profile.username}</h2>
                <p className="text-slate-500">Pokémon Trainer</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="text-indigo-600" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Joined</p>
                    <p className="font-semibold text-slate-800">{formatDate(profile.reg_date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <Trophy className="text-amber-600" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Trainer Level</p>
                    <p className="font-semibold text-slate-800">Level 1</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                  <Star className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm text-slate-500">Pokémon Owned</p>
                    <p className="font-semibold text-slate-800">{userPokemon.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="mr-3">⚡</span>
                Pokémon Collection
              </h3>

              {userPokemon.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h4 className="text-xl font-semibold text-slate-600 mb-2">No Pokémon Found</h4>
                  <p className="text-slate-500">This trainer hasn't caught any Pokémon yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userPokemon.map((pokemon, index) => (
                    <div key={pokemon.user_pokemon_id} className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-slate-200 hover:border-indigo-300 overflow-hidden relative">
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Level Badge */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg z-10">
                        Lv. {pokemon.level || 1}
                      </div>

                      {/* Pokemon Image */}
                      <div className="relative bg-gradient-to-b from-slate-50 to-white p-6 flex justify-center">
                        <div className="relative">
                          <img
                            src={`/src/assets/gif/${pokemon.sp_id}.gif`}
                            alt={pokemon.pokemon_name}
                            className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                            onError={(e) => {
                              e.target.src = `/src/assets/pokemons/${pokemon.sp_id}.png`;
                            }}
                          />
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </div>
                      </div>

                      {/* Pokemon Info */}
                      <div className="relative p-4">
                        {/* National Dex Number */}
                        <p className="text-xs text-slate-500 font-medium mb-2">
                          #{String(pokemon.n_dex).padStart(4, '0')}
                        </p>

                        {/* Pokemon Name */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors duration-300">
                              {pokemon.nickname || pokemon.pokemon_name}
                            </h4>
                            {/* Show nickname separately if exists */}
                            {pokemon.nickname && (
                              <p className="text-sm text-slate-600 italic">
                                ({pokemon.pokemon_name})
                              </p>
                            )}
                          </div>
                          {isOwnProfile() && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditNickname(pokemon)}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200"
                                title="Edit nickname"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReleaseClick(pokemon);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                                title="Release Pokemon"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Types */}
                        <div className="flex gap-2 flex-wrap mb-3">
                          {pokemon.primary_type && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg transform group-hover:scale-105 transition-transform duration-300 ${
                              getTypeColor(pokemon.primary_type)
                            }`}>
                              {pokemon.primary_type}
                            </span>
                          )}
                          {pokemon.secondary_type && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg transform group-hover:scale-105 transition-transform duration-300 ${
                              getTypeColor(pokemon.secondary_type)
                            }`}>
                              {pokemon.secondary_type}
                            </span>
                          )}
                        </div>

                        {/* Experience Bar */}
                        {pokemon.exp && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>EXP</span>
                              <span>{pokemon.exp}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((pokemon.exp / 1000) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Border animation on hover */}
                      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-indigo-300 transition-all duration-500"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Release Confirmation Modal */}
      {pokemonToRelease && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Release {pokemonToRelease.nickname || pokemonToRelease.pokemon_name}?
            </h3>
            <p className="text-slate-600 mb-6">
              This will permanently release your {pokemonToRelease.pokemon_name} and it cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelRelease}
                disabled={isReleasing}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRelease}
                disabled={isReleasing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
              >
                {isReleasing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Releasing...
                  </div>
                ) : (
                  'Release'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nickname Edit Modal */}
      {editingPokemon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <img
                  src={`/src/assets/gif/${editingPokemon.sp_id}.gif`}
                  alt={editingPokemon.pokemon_name}
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.target.src = `/src/assets/pokemons/${editingPokemon.sp_id}.png`;
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Edit Nickname
              </h3>
              <p className="text-slate-600">
                {editingPokemon.pokemon_name}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Nickname (optional)
              </label>
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder={editingPokemon.pokemon_name}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                maxLength={20}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">
                Leave empty to use the original name
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
              >
                <X size={16} className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSaveNickname}
                disabled={isUpdating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save size={16} className="inline mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
