import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function CharacterDetailPage() {
  const { character_id } = useParams();
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:5000/api/characters/${character_id}`);
        setCharacter(response.data);
      } catch (error) {
        console.error('Error fetching character:', error);
        setError(error.response?.data?.error || 'Failed to load character');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacter();
  }, [character_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 text-lg">Loading character...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Error loading character</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Character not found</h3>
          <p className="text-gray-500">The character you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 pt-20 px-6 pb-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-lg border border-green-100">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Character Image */}
            <div className="relative">
              <div className="w-48 h-64 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 p-2 shadow-lg">
                <img 
                  src={`/src/assets/characters/${character.character.character_id}.png`} 
                  alt={character.character.character_name} 
                  className="w-full h-full rounded-2xl object-contain"
                  onError={(e) => {
                    e.target.src = '/assets/common/loading.png';
                  }}
                />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-400/20 blur-xl"></div>
            </div>

            {/* Character Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-4">
                {character.character.character_name}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-600 text-2xl">🗺️</span>
                  <div>
                    <p className="text-gray-600 font-medium">Region</p>
                    <p className="font-semibold text-gray-800">{character.character.region_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-600 text-2xl">⚡</span>
                  <div>
                    <p className="text-gray-600 font-medium">Preferred Type</p>
                    <p className="font-semibold text-gray-800">{character.character.preferred_type_name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 md:col-span-2">
                  <span className="text-emerald-600 text-2xl">👤</span>
                  <div>
                    <p className="text-gray-600 font-medium">Trainer Class</p>
                    <p className="font-semibold text-gray-800">{character.character.trainer_class.join(', ')}</p>
                  </div>
                </div>
              </div>

              {character.character.character_description && (
                <div className="mt-6 p-4 bg-green-50 rounded-2xl">
                  <p className="text-gray-700 leading-relaxed">{character.character.character_description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pokémon Team */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-green-100">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-6 text-center">
            Pokémon Team
          </h2>
          
          {character.pokemons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {character.pokemons.map((pokemon, index) => (
                <div 
                  key={pokemon.sp_id} 
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full p-1">
                        <img 
                          src={`/src/assets/pokemons/${pokemon.sp_id}.png`} 
                          alt={pokemon.pokemon_name} 
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/src/assets/common/loading.png';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20 blur-lg"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{pokemon.pokemon_name}</h3>
                    <p className="text-green-600 font-semibold">#{pokemon.n_dex.toString().padStart(3, '0')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Pokémon found</h3>
              <p className="text-gray-500">This character doesn't have any Pokémon assigned yet.</p>
            </div>
          )}
        </div>
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
      `}</style>
    </div>
  );
}
