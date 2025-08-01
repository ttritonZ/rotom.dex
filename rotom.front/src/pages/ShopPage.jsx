import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ShoppingCart } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ShopPage() {
  const [pokemonList, setPokemonList] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [userMoney, setUserMoney] = useState(0);
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  useEffect(() => {
    setFilteredPokemon(
      pokemonList
        .filter(p => p.pokemon_name.toLowerCase().includes(pokemonSearch.toLowerCase()))
        .sort((a, b) => a.pokemon_name.localeCompare(b.pokemon_name))
    );
  }, [pokemonList, pokemonSearch]);

  useEffect(() => {
    setFilteredItems(
      items
        .filter(i => i.item_name.toLowerCase().includes(itemSearch.toLowerCase()))
        .sort((a, b) => a.item_name.localeCompare(b.item_name))
    );
  }, [items, itemSearch]);

  const fetchData = async (pokemonSearchTerm = '', itemSearchTerm = '') => {
    setLoading(true);
    try {
      const [pokRes, itemRes, userRes] = await Promise.all([
        axios.get(`${API_URL}/api/shop/pokemon${pokemonSearchTerm ? `?search=${pokemonSearchTerm}` : ''}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`${API_URL}/api/shop/items${itemSearchTerm ? `?search=${itemSearchTerm}` : ''}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`${API_URL}/api/shop/money`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);
      setPokemonList(pokRes.data);
      setItems(itemRes.data);
      setUserMoney(userRes.data.money_amount);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonSearch = async (e) => {
    e.preventDefault();
    await fetchData(pokemonSearch, itemSearch);
  };

  const handleItemSearch = async (e) => {
    e.preventDefault();
    await fetchData(pokemonSearch, itemSearch);
  };

  const handleBuy = async (type, id, price) => {
    if (userMoney < price) return alert('Not enough money!');
    try {
      await axios.post(`${API_URL}/api/shop/buy`, {
        type, id
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert(`${type === 'pokemon' ? 'Pokémon' : 'Item'} bought successfully!`);
      setUserMoney(prev => prev - price);
      // Refresh data after purchase
      fetchData(pokemonSearch, itemSearch);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Purchase failed');
    }
  };

  const getTypeColor = (typeName) => {
    const colors = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-200',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300'
    };
    return colors[typeName?.toLowerCase()] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 px-6 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <ShoppingCart className="text-blue-600" size={40} />
            Pokemon Shop
          </h1>
          <p className="text-gray-600">Buy Pokemon and items with your hard-earned money!</p>
        </div>

        {/* Money Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Your Money</h2>
          <div className="text-4xl font-bold text-green-700">${userMoney}</div>
        </div>

        {/* Pokemon Section */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-red-500">⚡</span>
            Pokemon for Sale
          </h3>
          
          {/* Pokemon Search */}
          <form onSubmit={handlePokemonSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search Pokemon by name..."
                  value={pokemonSearch}
                  onChange={(e) => setPokemonSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading Pokemon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPokemon.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No Pokémon found matching your search.</div>
          ) : (
            filteredPokemon.map(p => (
              <div key={p.sp_id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <img 
                    src={`http://localhost:5173/src/assets/pokemons/${p.sp_id}.png`} 
                    alt={p.pokemon_name} 
                    className="w-32 h-32 mx-auto object-contain mb-3" 
                  />
                  <div className="font-bold text-lg text-gray-800 mb-1">{p.pokemon_name}</div>
                  <div className="flex justify-center gap-1 mb-2">
                    <span className={`${getTypeColor(p.type1_name)} text-white px-2 py-1 rounded text-xs`}>
                      {p.type1_name}
                    </span>
                    {p.type2_name && (
                      <span className={`${getTypeColor(p.type2_name)} text-white px-2 py-1 rounded text-xs`}>
                        {p.type2_name}
                      </span>
                    )}
                  </div>
                  <div className="text-green-700 font-bold text-xl mb-3">${p.price}</div>
                  <button
                    onClick={() => handleBuy('pokemon', p.sp_id, p.price)}
                    disabled={userMoney < p.price}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      userMoney >= p.price 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {userMoney >= p.price ? 'Buy Pokemon' : 'Not Enough Money'}
                  </button>
                </div>
              </div>
            ))
          )}
            </div>
          )}
          
          {pokemonList.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No Pokemon found matching your search.
            </div>
          )}
        </section>

        {/* Items Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-purple-500">🎒</span>
            Items for Sale
          </h3>
          
          {/* Items Search */}
          <form onSubmit={handleItemSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search items by name..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No items found matching your search.</div>
          ) : (
            filteredItems.map(item => (
              <div key={item.item_id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <img 
                    src={`http://localhost:5173/src/assets/items/${item.item_id}.png`} 
                    alt={item.item_name} 
                    className="w-24 h-24 mx-auto object-contain mb-3" 
                  />
                  <div className="font-bold text-lg text-gray-800 mb-3">{item.item_name}</div>
                  <div className="text-green-700 font-bold text-xl mb-3">${item.item_price}</div>
                  <button
                    onClick={() => handleBuy('item', item.item_id, item.item_price)}
                    disabled={userMoney < item.item_price}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      userMoney >= item.item_price 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {userMoney >= item.item_price ? 'Buy Item' : 'Not Enough Money'}
                  </button>
                </div>
              </div>
            ))
          )}
            </div>
          )}
          
          {items.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No items found matching your search.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
