import { Link } from 'react-router-dom';

function PokemonCard({ pokemon }) {
  const getTypeColor = (typeName) => {
    const colors = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-300',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300',
    };
    return colors[typeName?.toLowerCase()] || 'bg-gray-400';
  };

  return (
    <Link to={`/pokemon/${pokemon.sp_id}`} className="block group">
      <div className="card bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow p-6 border border-blue-100 relative overflow-hidden group-hover:scale-105 transform duration-200">
        {/* Pokemon Image */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-blue-200 shadow-md">
            {pokemon.sprite_url ? (
              <img src={pokemon.sprite_url} alt={pokemon.pokemon_name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <span className="text-gray-300 text-4xl">?</span>
            )}
          </div>
        </div>
        <div className="text-center relative z-10">
          <div className="text-xs text-gray-400 mb-1 tracking-widest">#{pokemon.n_dex}</div>
          <h3 className="section-title text-lg font-bold mb-2 capitalize text-blue-700 group-hover:text-pink-600 transition-colors">
            {pokemon.pokemon_name}
          </h3>
          <div className="flex justify-center space-x-2 mb-3">
            <span className={`px-3 py-1 rounded-lg text-xs text-white shadow ${getTypeColor(pokemon.type_1_name)}`}>
              {pokemon.type_1_name}
            </span>
            {pokemon.type_2_name && (
              <span className={`px-3 py-1 rounded-lg text-xs text-white shadow ${getTypeColor(pokemon.type_2_name)}`}>
                {pokemon.type_2_name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-2">
            <div>HP: <span className="font-semibold">{pokemon.hp}</span></div>
            <div>Atk: <span className="font-semibold">{pokemon.attack}</span></div>
            <div>Def: <span className="font-semibold">{pokemon.defence}</span></div>
            <div>Spd: <span className="font-semibold">{pokemon.speed}</span></div>
          </div>
          {pokemon.is_legendary && (
            <div className="mt-2">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs shadow animate-pulse">Legendary</span>
            </div>
          )}
        </div>
        {/* Decorative background */}
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-linear-to-br from-blue-100 to-pink-100 rounded-full opacity-30 z-0"></div>
      </div>
    </Link>
  );
}

export default PokemonCard;
