import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EvolutionChain from "../components/EvolutionChain";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';

export default function PokemonDetailPage() {
  const { sp_id } = useParams();
  const [details, setDetails] = useState(null);
  const [moves, setMoves] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [evolutionChain, setEvolutionChain] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pokemon/${sp_id}`).then(res => setDetails(res.data));
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pokemon/moves/${sp_id}`).then(res => setMoves(res.data));
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pokemon/evolution/${sp_id}`).then(res => setEvolution(res.data));
  }, [sp_id]);

  useEffect(() => {
  const fetchEvolutionChain = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/pokemon/evolution/${sp_id}`
    );
    setEvolutionChain(res.data);
  };
  fetchEvolutionChain();
}, [sp_id]);


  if (!details) return <p>Loading...</p>;

  const statsData = [
    { stat: 'HP', value: details.hp },
    { stat: 'Attack', value: details.attack },
    { stat: 'Defense', value: details.defence },
    { stat: 'Sp. Atk', value: details.sp_attack },
    { stat: 'Sp. Def', value: details.sp_defence },
    { stat: 'Speed', value: details.speed },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-4">{details.pokemon_name} #{details.n_dex}</h1>
      <img src={`${import.meta.env.VITE_BACKEND_URL}/assets/pokemons/${details.sp_id}.png`} alt={details.pokemon_name} className="mx-auto w-64" />

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Info</h2>
          <p><strong>Types:</strong> {details.type_1} {details.type_2 && ` / ${details.type_2}`}</p>
          <p><strong>Abilities:</strong> {details.ability_1} {details.ability_2 && `, ${details.ability_2}`}</p>
          <p><strong>Category:</strong> {details.category}</p>
          <p><strong>Base Experience:</strong> {details.base_experience}</p>
          <p><strong>Catch Rate:</strong> {details.catch_rate}</p>
          <p><strong>Height:</strong> {details.height} m</p>
          <p><strong>Weight:</strong> {details.weight} kg</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Stats</h2>
          <RadarChart cx="50%" cy="50%" outerRadius="80" width={350} height={300} data={statsData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="stat" />
            <PolarRadiusAxis angle={30} domain={[0, 200]} />
            <Radar name="Stats" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-2">Moves</h2>
        <table className="table-auto w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Move</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Power</th>
              <th className="border px-2 py-1">Accuracy</th>
              <th className="border px-2 py-1">Method</th>
            </tr>
          </thead>
          <tbody>
            {moves.map(move => (
              <tr key={move.move_name}>
                <td className="border px-2 py-1">{move.move_name}</td>
                <td className="border px-2 py-1">{move.type_id}</td>
                <td className="border px-2 py-1">{move.category}</td>
                <td className="border px-2 py-1">{move.power || '-'}</td>
                <td className="border px-2 py-1">{move.accuracy || '-'}</td>
                <td className="border px-2 py-1">{move.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-2">Evolution Chain</h2>
        {evolution.length === 0 ? (
          <p>No evolutions.</p>
        ) : (
          <ul className="list-disc pl-6">
            {evolution.map(evo => (
              <li key={evo.evolves_to}>
                Evolves to <strong>{evo.pokemon_name}</strong> via <strong>{evo.method}</strong>
                {evo.level && ` at level ${evo.level}`}
              </li>
            ))}
          </ul>
        )}
      </div>
      <EvolutionChain sp_id={sp_id} />

    </div>
  );
}
