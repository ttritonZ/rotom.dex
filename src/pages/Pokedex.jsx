import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import PokemonCard from '../components/PokemonCard';

function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    types: [],
    abilities: [],
    regions: [],
    hpRange: [0, 255],
    attackRange: [0, 255],
    defenseRange: [0, 255],
    spAttackRange: [0, 255],
    spDefenseRange: [0, 255],
    speedRange: [0, 255],
    isLegendary: null,
    isMythical: null
  });
  
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    abilities: [],
    regions: []
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
      const [typesRes, abilitiesRes, regionsRes] = await Promise.all([
        supabase.from('Type').select('*').order('type_name'),
        supabase.from('Ability').select('*').order('ability_name'),
        supabase.from('Region').select('*').order('region_name')
      ]);

      setFilterOptions({
        types: typesRes.data || [],
        abilities: abilitiesRes.data || [],
        regions: regionsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  const fetchPokemon = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('Pokemon')
        .select(`
          *,
          type_1_data:type_1(type_name),
          type_2_data:type_2(type_name),
          ability_1_data:ability_1(ability_name),
          ability_2_data:ability_2(ability_name),
          ability_hidden_data:ability_hidden(ability_name),
          region_data:region(region_name)
        `)
        .eq('is_default', true);

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('pokemon_name', `%${searchTerm}%`);
      }

      // Apply type filters
      if (filters.types.length > 0) {
        query = query.or(`type_1.in.(${filters.types.join(',')}),type_2.in.(${filters.types.join(',')})`);
      }

      // Apply region filter
      if (filters.regions.length > 0) {
        query = query.in('region', filters.regions);
      }

      // Apply stat range filters
      if (filters.hpRange[0] > 0 || filters.hpRange[1] < 255) {
        query = query.gte('hp', filters.hpRange[0]).lte('hp', filters.hpRange[1]);
      }

      if (filters.attackRange[0] > 0 || filters.attackRange[1] < 255) {
        query = query.gte('attack', filters.attackRange[0]).lte('attack', filters.attackRange[1]);
      }

      if (filters.defenseRange[0] > 0 || filters.defenseRange[1] < 255) {
        query = query.gte('defence', filters.defenseRange[0]).lte('defence', filters.defenseRange[1]);
      }

      if (filters.spAttackRange[0] > 0 || filters.spAttackRange[1] < 255) {
        query = query.gte('sp_attack', filters.spAttackRange[0]).lte('sp_attack', filters.spAttackRange[1]);
      }

      if (filters.spDefenseRange[0] > 0 || filters.spDefenseRange[1] < 255) {
        query = query.gte('sp_defence', filters.spDefenseRange[0]).lte('sp_defence', filters.spDefenseRange[1]);
      }

      if (filters.speedRange[0] > 0 || filters.speedRange[1] < 255) {
        query = query.gte('speed', filters.speedRange[0]).lte('speed', filters.speedRange[1]);
      }

      // Apply legendary/mythical filters
      if (filters.isLegendary !== null) {
        query = query.eq('is_legendary', filters.isLegendary);
      }

      if (filters.isMythical !== null) {
        query = query.eq('is_mythical', filters.isMythical);
      }

      query = query.order('n_dex').limit(50);

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include type names
      const transformedData = data.map(p => ({
        ...p,
        type_1_name: p.type_1_data?.type_name,
        type_2_name: p.type_2_data?.type_name,
        ability_1_name: p.ability_1_data?.ability_name,
        ability_2_name: p.ability_2_data?.ability_name,
        ability_hidden_name: p.ability_hidden_data?.ability_name,
        region_name: p.region_data?.region_name
      }));

      setPokemon(transformedData);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
    }
    setLoading(false);
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchFilterOptions();
    fetchPokemon();
  }, [fetchFilterOptions, fetchPokemon]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-pink-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="section-title text-center">Pokédex</h1>
        {/* Search Bar */}
        <div className="mb-6 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search Pokémon by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm text-lg"
            aria-label="Search Pokémon by name"
          />
        </div>
        {/* Filters */}
        <div className="card bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-4xl mx-auto border border-blue-100">
          <h3 className="section-title text-xl font-bold mb-4 text-gray-700">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium mb-2">Types</label>
              <select
                id="type-filter"
                multiple
                value={filters.types}
                onChange={e => handleFilterChange('types', Array.from(e.target.selectedOptions, option => parseInt(option.value)))}
                className="w-full border border-gray-300 rounded-md p-2"
                aria-label="Filter by type"
              >
                {filterOptions.types.map(type => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Region Filter */}
            <div>
              <label htmlFor="region-filter" className="block text-sm font-medium mb-2">Regions</label>
              <select
                id="region-filter"
                multiple
                value={filters.regions}
                onChange={e => handleFilterChange('regions', Array.from(e.target.selectedOptions, option => parseInt(option.value)))}
                className="w-full border border-gray-300 rounded-md p-2"
                aria-label="Filter by region"
              >
                {filterOptions.regions.map(region => (
                  <option key={region.region_id} value={region.region_id}>
                    {region.region_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Legendary Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Special</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isLegendary === true}
                    onChange={e => handleFilterChange('isLegendary', e.target.checked ? true : null)}
                    className="mr-2"
                  />
                  Legendary Only
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isMythical === true}
                    onChange={e => handleFilterChange('isMythical', e.target.checked ? true : null)}
                    className="mr-2"
                  />
                  Mythical Only
                </label>
              </div>
            </div>
          </div>
          {/* Stat Range Filters */}
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">Stat Ranges</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'hpRange', label: 'HP' },
                { key: 'attackRange', label: 'Attack' },
                { key: 'defenseRange', label: 'Defense' },
                { key: 'spAttackRange', label: 'Sp. Attack' },
                { key: 'spDefenseRange', label: 'Sp. Defense' },
                { key: 'speedRange', label: 'Speed' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters[key][0]}
                      onChange={e => handleFilterChange(key, [parseInt(e.target.value) || 0, filters[key][1]])}
                      className="w-full border border-gray-300 rounded p-1 text-sm"
                      min="0"
                      max="255"
                      aria-label={`${label} min`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters[key][1]}
                      onChange={e => handleFilterChange(key, [filters[key][0], parseInt(e.target.value) || 255])}
                      className="w-full border border-gray-300 rounded p-1 text-sm"
                      min="0"
                      max="255"
                      aria-label={`${label} max`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setFilters({
                types: [],
                abilities: [],
                regions: [],
                hpRange: [0, 255],
                attackRange: [0, 255],
                defenseRange: [0, 255],
                spAttackRange: [0, 255],
                spDefenseRange: [0, 255],
                speedRange: [0, 255],
                isLegendary: null,
                isMythical: null
              });
              setSearchTerm('');
            }}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
        {/* Pokemon Grid */}
        {loading ? (
          <div className="text-center py-20 text-lg font-semibold animate-pulse">Loading Pokémon...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {pokemon.map(p => (
              <PokemonCard key={p.sp_id} pokemon={p} />
            ))}
          </div>
        )}
        {!loading && pokemon.length === 0 && (
          <div className="text-center text-gray-500 py-10 text-lg">
            No Pokémon found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

export default Pokedex;
