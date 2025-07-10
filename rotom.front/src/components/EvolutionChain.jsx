import useEvolutionChain from "../hooks/useEvolutionChain";
import { Link } from "react-router-dom";

const EvolutionChain = ({ sp_id }) => {
  const { evolutions, loading } = useEvolutionChain(sp_id);

  if (loading) return <div>Loading evolution chain...</div>;
  if (evolutions.length === 0) return <div>No evolution data.</div>;

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-6">
      <h2 className="text-xl font-bold mb-4">Evolution Chain</h2>
      <div className="flex items-center space-x-4 overflow-x-auto">
        {evolutions.map((evo, idx) => (
          <div key={evo.sp_id || idx} className="flex flex-col items-center">
            <Link to={`/pokemon/${evo.sp_id}`}>
              <img
                src={`/assets/gif/${evo.sp_id}.gif`}
                alt={evo.name}
                className="w-24 h-24 object-contain mb-2"
              />
            </Link>
            <div className="text-sm text-center font-semibold">{evo.name}</div>
            {evo.evolution_info && (
              <div className="text-xs text-gray-500 mt-1">
                {evo.evolution_info.method && (
                  <div>{evo.evolution_info.method}</div>
                )}
                {evo.evolution_info.level && (
                  <div>Level {evo.evolution_info.level}</div>
                )}
                {evo.evolution_info.item_name && (
                  <div>Use {evo.evolution_info.item_name}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvolutionChain;
