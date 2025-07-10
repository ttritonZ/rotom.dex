import { useNavigate } from 'react-router-dom';

export default function CharacterCard({ character }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/character/${character.character_id}`)}
      className="bg-white shadow rounded-xl p-4 flex flex-col items-center cursor-pointer hover:scale-105 transition"
    >
      <img src={`/assets/characters/${character.character_image}`} alt={character.character_name} className="w-28 h-28 rounded-full" />
      <h2 className="text-xl font-semibold mt-2">{character.character_name}</h2>
      <p className="text-sm text-gray-600">{character.region_name}</p>
      <p className="text-xs text-gray-500 mt-1">Class: {character.trainer_class.join(', ')}</p>
    </div>
  );
}
