import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonCard from '../components/PokemonCard';
import FilterPanel from '../components/FilterPanel';
import SidebarPanel from '../components/SidebarPanel';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function PokedexPage() {
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [filters, setFilters] = useState({
    types: [],
    abilities: [],
    region: [],
    legendary: false,
    mythical: false,
    ultrabeast: false,
    fossil: false,
    paradox: false,
    mega: false,
    gmax: false,
    variant: false,
    statRanges: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/pokemon`);
      setPokemonList(res.data);
    } catch (err) {
      setError('Failed to load Pokémon.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/pokemon/filter`, filters);
      setPokemonList(res.data);
    } catch (err) {
      setError('Failed to filter Pokémon.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <FilterPanel filters={filters} setFilters={setFilters} applyFilters={applyFilters} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {loading && <div className="col-span-full text-center">Loading...</div>}
        {error && <div className="col-span-full text-center text-red-500">{error}</div>}
        {!loading && !error && pokemonList.length === 0 && (
          <div className="col-span-full text-center">No Pokémon found.</div>
        )}
        {pokemonList.map(pokemon => (
          <PokemonCard key={pokemon.sp_id} pokemon={pokemon} onClick={() => setSelectedPokemon(pokemon)} />
        ))}
      </div>
      {selectedPokemon && (
        <SidebarPanel selectedPokemon={selectedPokemon} closeSidebar={() => setSelectedPokemon(null)} />
      )}
    </div>
  );
}