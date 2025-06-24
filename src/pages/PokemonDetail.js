import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const PokemonDetail = () => {
  const { id } = useParams()
  const [pokemon, setPokemon] = useState(null)
  const [moves, setMoves] = useState([])
  const [evolution, setEvolution] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPokemonDetail()
  }, [id])

  const fetchPokemonDetail = async () => {
    setLoading(true)
    try {
      // Fetch Pokemon details with related data
      const { data: pokemonData, error: pokemonError } = await supabase
        .from('Pokemon')
        .select(`
          *,
          type_1_data:type_1(type_name, type_color),
          type_2_data:type_2(type_name, type_color),
          ability_1_data:ability_1(ability_name, ability_description),
          ability_2_data:ability_2(ability_name, ability_description),
          ability_hidden_data:ability_hidden(ability_name, ability_description),
          region_data:region(region_name)
        `)
        .eq('sp_id', id)
        .single()

      if (pokemonError) throw pokemonError

      // Fetch moves
      const { data: movesData, error: movesError } = await supabase
        .from('Pokemon_Move')
        .select(`
          method,
          move_data:move_id(
            move_name,
            move_description,
            power,
            accuracy,
            pp,
            category,
            type_data:type_id(type_name, type_color)
          )
        `)
        .eq('sp_id', id)

      if (movesError) throw movesError

      // Fetch evolution chain
      const { data: evolutionData, error: evolutionError } = await supabase
        .from('Evolution')
        .select(`
          method,
          level,
          evolves_to_data:evolves_to(pokemon_name, n_dex),
          item_data:item_held(item_name)
        `)
        .eq('sp_id', id)

      if (evolutionError) throw evolutionError

      setPokemon(pokemonData)
      setMoves(movesData || [])
      setEvolution(evolutionData || [])
    } catch (error) {
      console.error('Error fetching Pokemon detail:', error)
    }
    setLoading(false)
  }

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
      fairy: 'bg-pink-300'
    }
    return colors[typeName?.toLowerCase()] || 'bg-gray-400'
  }

  if (loading) {
    return <div className="text-center py-20 text-lg font-semibold animate-pulse">Loading Pokémon details...</div>
  }

  if (!pokemon) {
    return <div className="text-center py-20 text-lg font-semibold text-red-500">Pokémon not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/pokedex" className="text-blue-500 hover:text-blue-700 mb-4 inline-block transition-colors">
          ← Back to Pokedex
        </Link>

        <div className="card bg-white rounded-2xl shadow-2xl p-8 relative mx-auto">
          {/* Pokémon Image */}
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 bg-gray-100 rounded-full shadow-inner flex items-center justify-center overflow-hidden border-4 border-blue-100 mx-auto">
              {/* Replace with actual image if available */}
              {pokemon.sprite_url ? (
                <img src={pokemon.sprite_url} alt={pokemon.pokemon_name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400 text-6xl">?</span>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-2xl text-gray-500 mb-2 tracking-widest">#{pokemon.n_dex}</div>
            <h1 className="section-title capitalize mb-4">{pokemon.pokemon_name}</h1>
            <div className="flex justify-center space-x-2 mb-4">
              <span className={`px-4 py-2 rounded-lg text-white font-semibold shadow-md ${getTypeColor(pokemon.type_1_data?.type_name)}`}>
                {pokemon.type_1_data?.type_name}
              </span>
              {pokemon.type_2_data && (
                <span className={`px-4 py-2 rounded-lg text-white font-semibold shadow-md ${getTypeColor(pokemon.type_2_data?.type_name)}`}>
                  {pokemon.type_2_data?.type_name}
                </span>
              )}
            </div>
            <div className="flex justify-center space-x-4 text-sm">
              {pokemon.is_legendary && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded shadow">Legendary</span>
              )}
              {pokemon.is_mythical && (
                <span className="bg-purple-500 text-white px-3 py-1 rounded shadow">Mythical</span>
              )}
              {pokemon.is_mega && (
                <span className="bg-pink-500 text-white px-3 py-1 rounded shadow">Mega</span>
              )}
              {pokemon.is_gigantamax && (
                <span className="bg-red-500 text-white px-3 py-1 rounded shadow">Gigantamax</span>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-left md:text-left text-center md:text-left">
              <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Basic Information</h3>
              <div className="space-y-2">
                <div><strong>Category:</strong> {pokemon.category}</div>
                <div><strong>Height:</strong> {pokemon.height} m</div>
                <div><strong>Weight:</strong> {pokemon.weight} kg</div>
                <div><strong>Region:</strong> {pokemon.region_data?.region_name}</div>
                <div><strong>Generation:</strong> {pokemon.generation}</div>
                <div><strong>Catch Rate:</strong> {pokemon.catch_rate}</div>
                <div><strong>Base Experience:</strong> {pokemon.base_experience}</div>
              </div>
            </div>

            <div className="text-left md:text-left text-center md:text-left">
              <h3 className="text-xl font-semibold mb-3 text-center md:text-left">Abilities</h3>
              <div className="space-y-3">
                <div>
                  <strong>Primary:</strong> {pokemon.ability_1_data?.ability_name}
                  {pokemon.ability_1_data?.ability_description && (
                    <p className="text-sm text-gray-600 mt-1">{pokemon.ability_1_data.ability_description}</p>
                  )}
                </div>
                {pokemon.ability_2_data && (
                  <div>
                    <strong>Secondary:</strong> {pokemon.ability_2_data.ability_name}
                    {pokemon.ability_2_data.ability_description && (
                      <p className="text-sm text-gray-600 mt-1">{pokemon.ability_2_data.ability_description}</p>
                    )}
                  </div>
                )}
                {pokemon.ability_hidden_data && (
                  <div>
                    <strong>Hidden:</strong> {pokemon.ability_hidden_data.ability_name}
                    {pokemon.ability_hidden_data.ability_description && (
                      <p className="text-sm text-gray-600 mt-1">{pokemon.ability_hidden_data.ability_description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-center">Base Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'HP', value: pokemon.hp, color: 'bg-red-500' },
                { label: 'Attack', value: pokemon.attack, color: 'bg-orange-500' },
                { label: 'Defense', value: pokemon.defence, color: 'bg-yellow-500' },
                { label: 'Sp. Attack', value: pokemon.sp_attack, color: 'bg-blue-500' },
                { label: 'Sp. Defense', value: pokemon.sp_defence, color: 'bg-green-500' },
                { label: 'Speed', value: pokemon.speed, color: 'bg-pink-500' }
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${Math.min((value / 255) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <strong>Total: {pokemon.total || (pokemon.hp + pokemon.attack + pokemon.defence + pokemon.sp_attack + pokemon.sp_defence + pokemon.speed)}</strong>
            </div>
          </div>

          {/* Description */}
          {pokemon.description && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-center">Description</h3>
              <p className="text-gray-700 text-center md:text-left max-w-2xl mx-auto">{pokemon.description}</p>
            </div>
          )}

          {/* Evolution Chain */}
          {evolution.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-center">Evolution</h3>
              <div className="space-y-2">
                {evolution.map((evo, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <span>
                        Evolves to: <strong>{evo.evolves_to_data?.pokemon_name}</strong> (#{evo.evolves_to_data?.n_dex})
                      </span>
                      <div className="text-sm text-gray-600 mt-2 md:mt-0">
                        {evo.method === 'level-up' && evo.level && `Level ${evo.level}`}
                        {evo.method === 'use-item' && evo.item_data && `Use ${evo.item_data.item_name}`}
                        {evo.method && evo.method !== 'level-up' && evo.method !== 'use-item' && evo.method}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moves */}
          {moves.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3 text-center">Moves</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-left">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Move</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Power</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Accuracy</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">PP</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moves.slice(0, 20).map((move, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {move.move_data?.move_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs text-white ${getTypeColor(move.move_data?.type_data?.type_name)}`}>
                            {move.move_data?.type_data?.type_name}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{move.move_data?.category}</td>
                        <td className="border border-gray-300 px-4 py-2">{move.move_data?.power || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2">{move.move_data?.accuracy || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2">{move.move_data?.pp}</td>
                        <td className="border border-gray-300 px-4 py-2 capitalize">{move.method?.replace('-', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {moves.length > 20 && (
                  <p className="text-sm text-gray-500 mt-2">Showing first 20 moves...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PokemonDetail
