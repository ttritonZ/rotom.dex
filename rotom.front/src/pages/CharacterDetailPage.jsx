import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function CharacterDetailPage() {
  const { character_id } = useParams();
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/characters/${character_id}`)
      .then(res => setCharacter(res.data));
  }, [character_id]);

  if (!character) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{character.character.character_name}</h1>
      <img src={`/assets/characters/${character.character.character_image}`} alt={character.character.character_name} className="w-52 mb-4" />

      <p><strong>Region:</strong> {character.character.region_name}</p>
      <p><strong>Trainer Class:</strong> {character.character.trainer_class.join(', ')}</p>
      <p><strong>Preferred Type:</strong> {character.character.preferred_type_name || 'N/A'}</p>
      <p className="mt-4"><strong>Description:</strong> {character.character.character_description}</p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Pokémon Team</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {character.pokemons.map(p => (
          <div key={p.sp_id} className="bg-white p-3 rounded shadow text-center">
            <img src={`/assets/pokemon_images/${p.sp_id}.png`} alt={p.pokemon_name} className="w-24 h-24 mx-auto" />
            <h3 className="mt-2 font-semibold">{p.pokemon_name}</h3>
            <p>#{p.n_dex}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
