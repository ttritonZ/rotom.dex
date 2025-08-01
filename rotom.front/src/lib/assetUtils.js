const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Pokemon assets
export const getPokemonGifUrl = (spId) => {
  return `${API_URL}/uploads/gif/${spId}.gif`;
};

export const getPokemonPngUrl = (spId) => {
  return `${API_URL}/uploads/pokemons/${spId}.png`;
};

// Character assets
export const getCharacterImageUrl = (characterId) => {
  return `${API_URL}/uploads/characters/${characterId}.png`;
};

// Item assets
export const getItemImageUrl = (itemId) => {
  return `${API_URL}/uploads/items/${itemId}.png`;
};

// Generic asset URL builder
// export const getAssetUrl = (type, id, extension = 'png') => {
//   return `${API_URL}/uploads/${type}/${String(id).padStart(4, '0')}.${extension}`;
// }; 