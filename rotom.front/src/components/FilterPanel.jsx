import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function FilterPanel({ filters, setFilters, applyFilters }) {
  const [types, setTypes] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/pokemon/types').then(res => setTypes(res.data));
    axios.get('http://localhost:5000/api/pokemon/abilities').then(res => setAbilities(res.data));
    axios.get('http://localhost:5000/api/pokemon/regions').then(res => setRegions(res.data));
  }, []);

  const toggleList = (key, id) => {
    setFilters(prev => {
      const list = new Set(prev[key]);
      list.has(id) ? list.delete(id) : list.add(id);
      return { ...prev, [key]: Array.from(list) };
    });
  };

  const toggleFlag = key => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateStatRange = (stat, field, value) => {
    setFilters(prev => ({
      ...prev,
      statRanges: {
        ...prev.statRanges,
        [stat]: {
          ...prev.statRanges?.[stat],
          [field]: parseInt(value) || 0,
        },
      },
    }));
  };

  const statFields = ['hp', 'attack', 'defence', 'sp_attack', 'sp_defence', 'speed', 'total'];

  return (
    <div className="w-72 p-4 bg-gray-100 overflow-y-auto h-screen">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      {/* Types */}
      <h3 className="font-semibold">Types</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {types.map(type => (
          <label key={type.type_id} className="block text-sm">
            <input
              type="checkbox"
              checked={filters.types.includes(type.type_id)}
              onChange={() => toggleList('types', type.type_id)}
            />
            {` ${type.type_name}`}
          </label>
        ))}
      </div>

      {/* Abilities */}
      <h3 className="font-semibold">Abilities</h3>
      <div className="flex flex-col gap-1 mb-4">
        {abilities.slice(0, 10).map(ability => (
          <label key={ability.ability_id} className="text-sm">
            <input
              type="checkbox"
              checked={filters.abilities.includes(ability.ability_id)}
              onChange={() => toggleList('abilities', ability.ability_id)}
            />
            {` ${ability.ability_name}`}
          </label>
        ))}
      </div>

      {/* Regions */}
      <h3 className="font-semibold">Regions</h3>
      <div className="flex flex-col gap-1 mb-4">
        {regions.map(region => (
          <label key={region.region_id} className="text-sm">
            <input
              type="checkbox"
              checked={filters.region.includes(region.region_id)}
              onChange={() => toggleList('region', region.region_id)}
            />
            {` ${region.region_name}`}
          </label>
        ))}
      </div>

      {/* Special Flags */}
      <h3 className="font-semibold">Flags</h3>
      {[
        'legendary',
        'mythical',
        'ultrabeast',
        'fossil',
        'paradox',
        'mega',
        'gmax',
        'variant',
      ].map(flag => (
        <label key={flag} className="block text-sm">
          <input
            type="checkbox"
            checked={filters[flag]}
            onChange={() => toggleFlag(flag)}
          />
          {` ${flag.charAt(0).toUpperCase() + flag.slice(1)}`}
        </label>
      ))}

      {/* Stat Sliders */}
      <h3 className="font-semibold mt-4">Stats</h3>
      {statFields.map(stat => (
        <div key={stat} className="text-sm my-1">
          <label className="block font-medium">{stat.toUpperCase()}</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-16 border rounded px-1"
              onChange={e => updateStatRange(stat, 'min', e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-16 border rounded px-1"
              onChange={e => updateStatRange(stat, 'max', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-6 w-full"
        onClick={applyFilters}
      >
        Apply Filters
      </button>
    </div>
  );
}
