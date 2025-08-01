import { useNavigate } from 'react-router-dom';

export default function CharacterCard({ character }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/character/${character.character_id}`)}
      className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl rounded-3xl p-10 cursor-pointer transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-green-100 hover:border-green-200 overflow-hidden relative"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Character Image */}
        <div className="relative mb-8">
          <div className="w-48 h-64 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 p-1 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
            <img 
              src={`/src/assets/characters/${character.character_id}.png`} 
              alt={character.character_name} 
              className="w-full h-full rounded-2xl object-contain shadow-lg group-hover:shadow-xl transition-shadow duration-300"
              onError={(e) => {
                e.target.src = '/src/assets/common/loading.png';
              }}
            />
          </div>
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
        </div>

        {/* Character Info */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors duration-300">
            {character.character_name}
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-emerald-600">🗺️</span>
              <p className="text-sm text-gray-600 font-medium">{character.region_name}</p>
            </div>
            
            {character.preferred_type_name && (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-emerald-600">⚡</span>
                <p className="text-sm text-gray-600 font-medium">{character.preferred_type_name}</p>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-2">
              <span className="text-emerald-600">👤</span>
              <p className="text-xs text-gray-500 mt-1">
                {character.trainer_class.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">→</span>
          </div>
        </div>
      </div>

      {/* Border animation on hover */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-green-300 transition-all duration-500"></div>
    </div>
  );
}
