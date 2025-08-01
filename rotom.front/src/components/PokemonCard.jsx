import React from 'react';

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

export default function PokemonCard({ pokemon, onClick }) {
  console.log('PokemonCard received pokemon:', pokemon); // Debug log
  
  const formatNdex = (ndex) => {
    return `#${String(ndex).padStart(4, '0')}`;
  };

  const getRarityBadge = () => {
    if (pokemon.is_legendary) {
      return <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg z-10">LEGENDARY</span>;
    }
    if (pokemon.is_mythical) {
      return <span className="absolute top-3 right-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg z-10">MYTHICAL</span>;
    }
    if (pokemon.is_ultrabeast) {
      return <span className="absolute top-3 right-3 bg-gradient-to-r from-pink-400 to-pink-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg z-10">ULTRA BEAST</span>;
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-105 border border-green-100 hover:border-green-200 overflow-hidden relative"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Rarity Badge */}
      {getRarityBadge()}

      {/* Pokemon Image */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white p-6 flex justify-center">
        <div className="relative">
          <img
            src={`/src/assets/gif/${pokemon.sp_id}.gif`}
            alt={pokemon.pokemon_name}
            className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
            onError={(e) => {
              e.target.src = `/src/assets/pokemons/${pokemon.sp_id}.png`;
            }}
          />
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Pokemon Info */}
      <div className="relative p-6">
        {/* National Dex Number */}
        <p className="text-sm text-gray-500 font-medium mb-3">
          {formatNdex(pokemon.n_dex)}
        </p>

        {/* Pokemon Name */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
            {pokemon.nickname || pokemon.pokemon_name}
          </h3>
          {pokemon.nickname && (
            <p className="text-sm text-gray-500 italic">{pokemon.pokemon_name}</p>
          )}
        </div>

        {/* Types */}
        <div className="flex gap-2 flex-wrap mb-4">
          {pokemon.type1_name && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${typeColors[pokemon.type1_name] || 'bg-gray-400'} transform group-hover:scale-105 transition-transform duration-300`}>
              {pokemon.type1_name}
            </span>
          )}
          {pokemon.type2_name && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${typeColors[pokemon.type2_name] || 'bg-gray-400'} transform group-hover:scale-105 transition-transform duration-300`}>
              {pokemon.type2_name}
            </span>
          )}
        </div>

        {/* Special Features */}
        {(pokemon.is_mega || pokemon.is_gigantamax || pokemon.is_paradox) && (
          <div className="flex gap-2 flex-wrap">
            {pokemon.is_mega && (
              <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold">
                Mega
              </span>
            )}
            {pokemon.is_gigantamax && (
              <span className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 text-xs px-3 py-1 rounded-full font-semibold">
                G-Max
              </span>
            )}
            {pokemon.is_paradox && (
              <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-xs px-3 py-1 rounded-full font-semibold">
                Paradox
              </span>
            )}
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">→</span>
          </div>
        </div>
      </div>

      {/* Border animation on hover */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-green-300 transition-all duration-500"></div>
    </div>
  );
}

 