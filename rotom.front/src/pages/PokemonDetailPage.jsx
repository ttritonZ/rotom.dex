import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EvolutionChain from "../components/EvolutionChain";
import { ArrowLeft, Heart, Zap, Shield, Target, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function PokemonDetailPage() {
  const { sp_id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailsRes, movesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pokemon/${sp_id}`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pokemon/moves/${sp_id}`)
        ]);
        setDetails(detailsRes.data);
        setMoves(movesRes.data);
      } catch (error) {
        console.error('Error fetching Pokemon data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sp_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Pokémon details...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Pokémon not found.</p>
        </div>
      </div>
    );
  }

  const statsData = [
    { stat: 'HP', value: details.hp, icon: Heart },
    { stat: 'Attack', value: details.attack, icon: Zap },
    { stat: 'Defense', value: details.defence, icon: Shield },
    { stat: 'Sp. Atk', value: details.sp_attack, icon: Target },
    { stat: 'Sp. Def', value: details.sp_defence, icon: Shield },
    { stat: 'Speed', value: details.speed, icon: TrendingUp },
  ];

  const formatNdex = (ndex) => {
    return `#${String(ndex).padStart(3, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Pokédex
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
                  src={`/src/assets/pokemons/${details.sp_id}.png`} 
                  alt={details.pokemon_name} 
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    e.target.src = `/src/assets/gif/${details.sp_id}.gif`;
                  }}
                />
              </div>
            </div>

            {/* Pokemon Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                <p className="text-lg text-gray-500 font-medium mb-2">
                  {formatNdex(details.n_dex)}
                </p>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {details.pokemon_name}
                </h1>
              </div>

              {/* Types */}
              <div className="flex gap-3 justify-center lg:justify-start mb-6">
                {details.type1_name && (
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${typeColors[details.type1_name] || 'bg-gray-400'}`}>
                    {details.type1_name}
                  </span>
                )}
                {details.type2_name && (
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${typeColors[details.type2_name] || 'bg-gray-400'}`}>
                    {details.type2_name}
                  </span>
                )}
              </div>

                             {/* Basic Info */}
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                 <div className="bg-gray-50 rounded-lg p-3">
                   <p className="text-gray-500">Category</p>
                   <p className="font-semibold">{details.category}</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-3">
                   <p className="text-gray-500">Height</p>
                   <p className="font-semibold">{details.height}m</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-3">
                   <p className="text-gray-500">Weight</p>
                   <p className="font-semibold">{details.weight}kg</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-3">
                   <p className="text-gray-500">Base Exp</p>
                   <p className="font-semibold">{details.base_experience}</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-3">
                   <p className="text-gray-500">Catch Rate</p>
                   <p className="font-semibold">{details.catch_rate}</p>
                 </div>
                 <div className="bg-gray-50 rounded-lg p-3">
                   <p className="text-gray-500">Total Stats</p>
                   <p className="font-semibold">{details.total}</p>
                 </div>
               </div>

               {/* Abilities */}
               <div className="mt-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Abilities</h3>
                 <div className="space-y-3">
                   {details.ability1_name && (
                     <div className="bg-blue-50 rounded-lg p-4">
                       <div className="flex items-center justify-between mb-2">
                         <h4 className="font-semibold text-blue-900">{details.ability1_name}</h4>
                         <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Primary</span>
                       </div>
                       {details.ability1_description && (
                         <p className="text-sm text-blue-700">{details.ability1_description}</p>
                       )}
                     </div>
                   )}
                   
                   {details.ability2_name && (
                     <div className="bg-green-50 rounded-lg p-4">
                       <div className="flex items-center justify-between mb-2">
                         <h4 className="font-semibold text-green-900">{details.ability2_name}</h4>
                         <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Secondary</span>
                       </div>
                       {details.ability2_description && (
                         <p className="text-sm text-green-700">{details.ability2_description}</p>
                       )}
                     </div>
                   )}
                   
                   {details.ability_hidden_name && (
                     <div className="bg-purple-50 rounded-lg p-4">
                       <div className="flex items-center justify-between mb-2">
                         <h4 className="font-semibold text-purple-900">{details.ability_hidden_name}</h4>
                         <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Hidden</span>
                       </div>
                       {details.ability_hidden_description && (
                         <p className="text-sm text-purple-700">{details.ability_hidden_description}</p>
                       )}
                     </div>
                   )}
                 </div>
               </div>
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

        {/* Evolution Chain */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Evolution Chain</h2>
          <EvolutionChain sp_id={sp_id} />
        </div>
      </div>
    </div>
  );
}
