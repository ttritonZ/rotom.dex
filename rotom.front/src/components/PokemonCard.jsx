export default function PokemonCard({ pokemon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl bg-white p-3 shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
    >
      <img
        src={`${import.meta.env.VITE_BACKEND_URL}/assets/gif/${pokemon.sp_id}.gif`}
        alt={pokemon.pokemon_name}
        className="w-24 h-24"
      />
      <h2 className="text-lg font-bold">{pokemon.pokemon_name}</h2>
      <p className="text-sm">#{pokemon.n_dex}</p>
    </div>
  );
}

