import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../hooks/useUser';
import axios from 'axios';
import { Sword, Users, Zap, Clock, Trophy, Plus, Search, Copy, CheckCircle, X, AlertCircle, Sparkles, Target, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function BattlesPage() {
  console.log('BattlesPage component rendered');
  const [myPokemon, setMyPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState([]);
  const [activeBattles, setActiveBattles] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [showCreateBattle, setShowCreateBattle] = useState(false);
  const [battleCode, setBattleCode] = useState('');
  const [isRandom, setIsRandom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentBattle, setCurrentBattle] = useState(null);
  const [createdBattleCode, setCreatedBattleCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showBattleCode, setShowBattleCode] = useState(false);

  const { socket, isConnected } = useSocket();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMyPokemon();
      fetchActiveBattles();
      fetchBattleHistory();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    // Battle creation events
    socket.on('battle_created', (data) => {
      console.log('Battle created:', data);
      setCurrentBattle(data);
      setCreatedBattleCode(data.battleCode || data.battle_id);
      setShowCreateBattle(false);
      setError('');
      setLoading(false);
      setSuccess('Battle created successfully! Share the code with your opponent.');
      setTimeout(() => setSuccess(''), 5000);
    });

    socket.on('battle_started', (data) => {
      console.log('Battle started:', data);
      setLoading(false);
      setError('');
      setSuccess('Battle starting! Redirecting to arena...');
      setTimeout(() => {
        navigate(`/battle/${data.battleId}`);
      }, 1000);
    });

    socket.on('battle_joined', (data) => {
      console.log('Battle joined:', data);
      setLoading(false);
      setError('');
      setSuccess('Successfully joined battle! Redirecting to arena...');
      setBattleCode('');
      setTimeout(() => {
        setSuccess('');
        navigate(`/battle/${data.battleId}`);
      }, 2000);
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message || 'An error occurred');
      setLoading(false);
      setTimeout(() => setError(''), 5000);
    });

    socket.on('test_response', (data) => {
      console.log('Test response:', data);
      setSuccess(`Socket test successful! ${data.message}`);
      setTimeout(() => setSuccess(''), 3000);
    });

    return () => {
      socket.off('battle_created');
      socket.off('battle_started');
      socket.off('battle_joined');
      socket.off('error');
      socket.off('test_response');
    };
  }, [socket, navigate]);

  const fetchMyPokemon = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/battle/pokemon`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPokemon(response.data);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
      setError('Failed to load your Pokemon');
    }
  };

  const fetchActiveBattles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/battle/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveBattles(response.data);
    } catch (error) {
      console.error('Error fetching active battles:', error);
    }
  };

  const fetchBattleHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/battle/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBattleHistory(response.data);
    } catch (error) {
      console.error('Error fetching battle history:', error);
    }
  };

  const handlePokemonSelect = (pokemonId) => {
    setSelectedPokemon(prev => {
      if (prev.includes(pokemonId)) {
        return prev.filter(id => id !== pokemonId);
      } else {
        if (prev.length < 6) {
          return [...prev, pokemonId];
        }
        return prev;
      }
    });
  };

  const createBattle = () => {
    if (!isConnected) {
      setError('Not connected to battle server. Please refresh the page.');
      return;
    }

    if (selectedPokemon.length === 0) {
      setError('Please select at least one Pokemon for battle');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    console.log('Creating battle with Pokemon:', selectedPokemon);
    socket.emit('create_battle', {
      selectedPokemon,
      isRandom
    });
  };

  const joinBattle = () => {
    if (!isConnected) {
      setError('Not connected to battle server. Please refresh the page.');
      return;
    }

    if (!battleCode.trim()) {
      setError('Please enter a battle code');
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(battleCode.trim())) {
      setError('Invalid battle code format. Please enter a valid UUID.');
      return;
    }

    if (selectedPokemon.length === 0) {
      setError('Please select at least one Pokemon for battle');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    console.log('Joining battle with code:', battleCode);
    socket.emit('join_battle', {
      battleCode: battleCode.trim(),
      selectedPokemon
    });

    // Add timeout for join battle
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Battle code not found or invalid. Please check the code and try again.');
      }
    }, 5000);
  };

  const copyBattleCode = async () => {
    try {
      await navigator.clipboard.writeText(createdBattleCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <Sword className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Battle Arena
          </h1>
          <p className="text-gray-300 text-lg">Challenge other trainers in epic Pokemon battles!</p>
          
          {/* Recent Battles Button */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/recent-battles')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2 mx-auto"
            >
              <Clock className="text-white" size={20} />
              View Recent Battles
            </button>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <button
              onClick={() => {
                if (socket) {
                  socket.emit('test', { message: 'Testing connection' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {(error || success) && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-xl shadow-2xl mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
                <button onClick={clearMessages} className="text-white hover:text-red-200">
                  <X size={16} />
                </button>
              </div>
            )}
            
            {success && (
              <div className="bg-green-500 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} />
                  <span>{success}</span>
                </div>
                <button onClick={clearMessages} className="text-white hover:text-green-200">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Pokemon Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Target className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Select Pokemon</h2>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 text-sm">
                    Selected: {selectedPokemon.length}/6
                  </span>
                  {selectedPokemon.length > 0 && (
                    <button
                      onClick={() => setSelectedPokemon([])}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {/* Selected Pokemon Display */}
                {selectedPokemon.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPokemon.map((pokemonId) => {
                      const pokemon = myPokemon.find(p => p.user_pokemon_id === pokemonId);
                      return pokemon ? (
                        <div key={pokemonId} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {pokemon.nickname || pokemon.pokemon_name}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Pokemon List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myPokemon.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">😢</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">No Pokemon Available</h3>
                    <p className="text-gray-400 text-sm mb-4">You need Pokemon to participate in battles!</p>
                    <button
                      onClick={() => navigate('/my-pokemon')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                    >
                      Get Pokemon
                    </button>
                  </div>
                ) : (
                  myPokemon.map((pokemon) => (
                    <div
                      key={pokemon.user_pokemon_id}
                      onClick={() => handlePokemonSelect(pokemon.user_pokemon_id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedPokemon.includes(pokemon.user_pokemon_id)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                          <img 
                            src={`/src/assets/gif/${pokemon.sp_id}.gif`}
                            alt={pokemon.pokemon_name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="text-white text-xs" style={{display: 'none'}}>
                            {pokemon.pokemon_name}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold">
                            {pokemon.nickname || pokemon.pokemon_name}
                          </div>
                          <div className="text-sm opacity-75">Lv. {pokemon.level}</div>
                          <div className="flex gap-1 mt-1">
                            <span className={`${getTypeColor(pokemon.type1_name)} text-white px-2 py-1 rounded text-xs`}>
                              {pokemon.type1_name}
                            </span>
                            {pokemon.type2_name && (
                              <span className={`${getTypeColor(pokemon.type2_name)} text-white px-2 py-1 rounded text-xs`}>
                                {pokemon.type2_name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {selectedPokemon.includes(pokemon.user_pokemon_id) && (
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <CheckCircle className="text-purple-600" size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Battle Actions */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Create Battle */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Plus className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Create Battle</h2>
                </div>

                {createdBattleCode ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="text-white" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Battle Created!</h3>
                      <p className="text-gray-300 mb-4">Share this battle code with your opponent:</p>
                      
                      <div className="bg-white/10 border-2 border-green-400/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-mono font-bold text-green-400 tracking-wider">
                            {showBattleCode ? createdBattleCode : `${createdBattleCode.substring(0, 8)}...`}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowBattleCode(!showBattleCode)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                              {showBattleCode ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={copyBattleCode}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1"
                            >
                              {copiedCode ? <CheckCircle size={14} /> : <Copy size={14} />}
                              {copiedCode ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setCreatedBattleCode('');
                            setCurrentBattle(null);
                            setShowBattleCode(false);
                          }}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          Create New
                        </button>
                        <button
                          onClick={() => navigate(`/battle/${currentBattle?.battleId || currentBattle?.battle_id}`)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                        >
                          Go to Battle
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRandom}
                        onChange={(e) => setIsRandom(e.target.checked)}
                        className="w-5 h-5 text-green-600 border-green-400 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-300">Random Match (Find any opponent)</span>
                    </label>
                    
                    <button
                      onClick={createBattle}
                      disabled={loading || selectedPokemon.length === 0 || !isConnected}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Creating Battle...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Sword size={20} />
                          <span>Create Battle</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Join Battle */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Search className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Join Battle</h2>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={battleCode}
                    onChange={(e) => setBattleCode(e.target.value)}
                    placeholder="Enter battle code (UUID format)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  
                  <p className="text-sm text-gray-400">
                    Battle codes are in UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000)
                  </p>
                  
                  <button
                    onClick={joinBattle}
                    disabled={loading || !battleCode.trim() || selectedPokemon.length === 0 || !isConnected}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Joining Battle...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Search size={20} />
                        <span>Join Battle</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Battle Stats */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Zap className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Battle Stats</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{myPokemon.length}</div>
                    <div className="text-sm text-gray-300">My Pokemon</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{selectedPokemon.length}</div>
                    <div className="text-sm text-gray-300">Selected</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{activeBattles.length}</div>
                    <div className="text-sm text-gray-300">Active Battles</div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{battleHistory.length}</div>
                    <div className="text-sm text-gray-300">Battle History</div>
                  </div>
                </div>
              </div>

              {/* Active Battles */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Users className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Active Battles</h2>
                </div>
                
                <div className="space-y-3">
                  {activeBattles.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No active battles</p>
                  ) : (
                    activeBattles.map((battle) => (
                      <div key={battle.battle_id} className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">{battle.user1_name}</div>
                            <div className="text-gray-400 text-sm">Code: {battle.battle_code.substring(0, 8)}...</div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 text-sm font-medium">Waiting</div>
                            <div className="text-gray-400 text-xs">
                              {new Date(battle.battle_time).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Battle History */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Trophy className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Recent Battles</h2>
                </div>
                
                <div className="space-y-3">
                  {battleHistory.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No battle history</p>
                  ) : (
                    battleHistory.slice(0, 5).map((battle) => (
                      <div key={battle.battle_id} className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">
                              {battle.user1_name} vs {battle.user2_name || '...'}
                            </div>
                            {battle.status === 'finished' && battle.winner_name && (
                              <div className="text-green-400 text-sm">
                                Winner: {battle.winner_name}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              battle.status === 'finished' ? 'text-green-400' : 
                              battle.status === 'active' ? 'text-yellow-400' : 'text-gray-400'
                            }`}>
                              {battle.status}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {new Date(battle.battle_time).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
