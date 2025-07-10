import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SidebarPanel({ selectedPokemon, closeSidebar }) {
  const [details, setDetails] = useState(null);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (selectedPokemon) {
      axios.get(`http://localhost:5000/api/pokemon/${selectedPokemon.sp_id}`)
        .then(res => setDetails(res.data))
        .catch(console.error);

      axios.get(`http://localhost:5000/api/pokemon/variants/${selectedPokemon.n_dex}`)
        .then(res => setVariants(res.data))
        .catch(console.error);
    }
  }, [selectedPokemon]);

  if (!details) return null;

  return (
    <div className="fixed right-0 top-0 w-96 h-full bg-white shadow-lg overflow-y-auto p-4 z-50">
      <button onClick={closeSidebar} className="text-xl font-bold mb-4">✖</button>
      <img
        src={`${import.meta.env.VITE_BACKEND_URL}/public/assets/pokemons/${details.sp_id}.png`}
        alt={details.pokemon_name}
        className="w-48 mx-auto"
      />
      <h2 className="text-2xl font-bold text-center mt-2">{details.pokemon_name}</h2>
      <p className="text-center text-gray-600">#{details.n_dex}</p>

      <div className="mt-4">
        <h3 className="font-semibold">Types:</h3>
        <p>{details.type_1} {details.type_2 && `/ ${details.type_2}`}</p>

        <h3 className="font-semibold mt-2">Abilities:</h3>
        <p>{details.ability_1} {details.ability_2 && `, ${details.ability_2}`}</p>

        <h3 className="font-semibold mt-2">Category:</h3>
        <p>{details.category}</p>

        <h3 className="font-semibold mt-2">Stats:</h3>
        <ul className="list-disc pl-5">
          <li>HP: {details.hp}</li>
          <li>Attack: {details.attack}</li>
          <li>Defense: {details.defence}</li>
          <li>Sp. Atk: {details.sp_attack}</li>
          <li>Sp. Def: {details.sp_defence}</li>
          <li>Speed: {details.speed}</li>
          <li>Total: {details.total}</li>
        </ul>

        <h3 className="font-semibold mt-2">Base Experience:</h3>
        <p>{details.base_experience}</p>

        <h3 className="font-semibold mt-2">Catch Rate:</h3>
        <p>{details.catch_rate}</p>

        <h3 className="font-semibold mt-2">Height:</h3>
        <p>{details.height}</p>

        <h3 className="font-semibold mt-2">Weight:</h3>
        <p>{details.weight}</p>

        <h3 className="font-semibold mt-2">Pokedex Entry:</h3>
        <p>(Coming soon)</p>

        {/* Variants */}
        <h3 className="font-semibold mt-4">Other Forms:</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {variants.map(variant => (
            <button
              key={variant.sp_id}
              className="bg-gray-200 text-sm px-2 py-1 rounded"
              onClick={() => {
                setDetails(null);
                axios.get(`http://localhost:5000/api/pokemon/${variant.sp_id}`)
                  .then(res => setDetails(res.data));
              }}
            >
              {variant.pokemon_name}
            </button>
          ))}
        </div>

        {/* Detail Page Link */}
        <a
          href={`/pokedex/${details.sp_id}`}
          className="block bg-blue-500 text-white text-center mt-6 py-2 rounded"
        >
          View Full Details →
        </a>
      </div>
    </div>
  );
}
