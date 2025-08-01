import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../hooks/useUser';
import axios from 'axios';
import { Heart, Zap, Shield, Clock, Trophy, ArrowLeft, AlertCircle, Sword, Zap as ZapIcon, Clock as ClockIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const BattleArena = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user } = useUser();

  // Battle state
  const [battleData, setBattleData] = useState(null);
  const [myPokemon, setMyPokemon] = useState([]);
  const [opponentPokemon, setOpponentPokemon] = useState([]);
  const [currentMyPokemon, setCurrentMyPokemon] = useState(null);
  const [currentOpponentPokemon, setCurrentOpponentPokemon] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [battleLog, setBattleLog] = useState([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gamePhase, setGamePhase] = useState('loading');
  
  // Visual effects
  const [showEffect, setShowEffect] = useState(false);
  const [effectType, setEffectType] = useState('');
  
  // Pokemon HP tracking
  const [pokemonHP, setPokemonHP] = useState({});
  const [maxPokemonHP, setMaxPokemonHP] = useState({});
  
  // Battle status
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');
  const [showPokemonSelection, setShowPokemonSelection] = useState(false);
  const [availablePokemonForSelection, setAvailablePokemonForSelection] = useState([]);
  const [faintedPokemon, setFaintedPokemon] = useState(new Set());
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  
  // Battle readiness
  const [myPokemonSelected, setMyPokemonSelected] = useState(false);
  const [opponentPokemonSelected, setOpponentPokemonSelected] = useState(false);

  console.log('BattleArena render:', { gamePhase, isMyTurn, battleId });

  // Initialize battle data
  useEffect(() => {
    if (battleId && user && socket) {
      fetchBattleData();
      socket.emit('join_battle_arena', { battleId });
    }
  }, [battleId, user, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleBattleStarted = (data) => {
      console.log('Battle started:', data);
      setBattleData({
        battle_id: data.battleId,
        user1: data.user1.id,
        user1_name: data.user1.name,
        user2: data.user2.id,
        user2_name: data.user2.name,
        status: 'active'
      });
      setGamePhase('selection');
      setIsMyTurn(data.currentTurn === user.user_id);
      addToBattleLog('Battle started! Choose your Pokemon.', 'info');
    };

    const handlePokemonSelected = (data) => {
      console.log('Pokemon selected:', data);
      if (data.userId === user.user_id) {
        setMyPokemonSelected(true);
        addToBattleLog('You selected your Pokemon!');
      } else {
        setOpponentPokemonSelected(true);
        addToBattleLog('Opponent selected their Pokemon!');
        
        // Find opponent Pokemon from the opponentPokemon array
        const opponentPoke = opponentPokemon.find(p => p.user_pokemon_id === data.pokemonId);
        if (opponentPoke) {
          setCurrentOpponentPokemon(opponentPoke);
          
          // Initialize HP for opponent Pokemon when they select
          const maxHP = calculateMaxHP(opponentPoke);
          setMaxPokemonHP(prev => ({
            ...prev,
            [opponentPoke.user_pokemon_id]: maxHP
          }));
          setPokemonHP(prev => ({
            ...prev,
            [opponentPoke.user_pokemon_id]: maxHP
          }));
        }
      }
    };

    const handleBattleReady = (data) => {
      console.log('Battle ready:', data);
      setGamePhase('battle');
      setIsMyTurn(data.currentTurn === user.user_id);
      
      addToBattleLog('Battle begins!');
      
      if (data.currentTurn === user.user_id) {
        addToBattleLog('Your turn! Choose your move.');
        if (currentMyPokemon) {
          fetchPokemonMoves(currentMyPokemon.user_pokemon_id);
        }
      } else {
        addToBattleLog('Opponent goes first! Waiting for their move...');
        // Don't fetch moves if it's not our turn
        setAvailableMoves([]);
      }
    };

    const handleMoveResult = (data) => {
      console.log('Move result received:', data);
      if (isProcessingMove) return;
      
      setIsProcessingMove(true);
      setShowEffect(true);
      setEffectType('attack');
      
      setTimeout(() => {
        setShowEffect(false);
        
        // Update HP for the defender
        const newHP = Math.max(0, (pokemonHP[data.defender] || 0) - data.damage);
        setPokemonHP(prev => ({
          ...prev,
          [data.defender]: newHP
        }));
        
        // Add battle log
        const attackerPokemon = [...myPokemon, ...opponentPokemon].find(p => p.user_pokemon_id === data.attacker);
        const defenderPokemon = [...myPokemon, ...opponentPokemon].find(p => p.user_pokemon_id === data.defender);
        
        if (data.damage > 0) {
          addToBattleLog(`${attackerPokemon?.nickname || attackerPokemon?.pokemon_name} dealt ${data.damage} damage to ${defenderPokemon?.nickname || defenderPokemon?.pokemon_name}!`, 'damage');
        } else {
          addToBattleLog(`${attackerPokemon?.nickname || attackerPokemon?.pokemon_name} used ${data.moveName || 'a move'} but it had no effect!`);
        }
        
        // Check if Pokemon fainted
        if (newHP === 0) {
          addToBattleLog(`${defenderPokemon?.nickname || defenderPokemon?.pokemon_name} fainted!`, 'faint');
          handlePokemonFainted(data.defender);
        } else {
          // Switch turns - this is the key part for proper turn-based battle
          const nextTurn = data.nextTurn || data.currentTurn;
          setIsMyTurn(nextTurn === user.user_id);
          
          if (nextTurn === user.user_id) {
            addToBattleLog('Your turn! Choose your move.');
            // Fetch moves for current Pokemon if it's my turn
            if (currentMyPokemon) {
              fetchPokemonMoves(currentMyPokemon.user_pokemon_id);
            }
          } else {
            addToBattleLog('Opponent\'s turn! Waiting for their move...');
            // Clear available moves so player can't act during opponent's turn
            setAvailableMoves([]);
          }
        }
        
        setIsProcessingMove(false);
      }, 1500);
    };

    const handlePokemonSwitched = (data) => {
      console.log('Pokemon switched:', data);
      const pokemon = [...myPokemon, ...opponentPokemon].find(p => p.user_pokemon_id === data.pokemonId);
      
      if (data.userId === user.user_id) {
        setCurrentMyPokemon(pokemon);
        addToBattleLog(`You sent out ${pokemon?.nickname || pokemon?.pokemon_name}!`);
        
        // Initialize HP for switched Pokemon
        if (pokemon) {
          const maxHP = calculateMaxHP(pokemon);
          setMaxPokemonHP(prev => ({
            ...prev,
            [pokemon.user_pokemon_id]: maxHP
          }));
          setPokemonHP(prev => ({
            ...prev,
            [pokemon.user_pokemon_id]: maxHP
          }));
        }
      } else {
        setCurrentOpponentPokemon(pokemon);
        addToBattleLog(`Opponent sent out ${pokemon?.nickname || pokemon?.pokemon_name}!`);
        
        // Initialize HP for opponent's switched Pokemon
        if (pokemon) {
          const maxHP = calculateMaxHP(pokemon);
          setMaxPokemonHP(prev => ({
            ...prev,
            [pokemon.user_pokemon_id]: maxHP
          }));
          setPokemonHP(prev => ({
            ...prev,
            [pokemon.user_pokemon_id]: maxHP
          }));
        }
      }
    };

    const handlePokemonSwitchSuccess = (data) => {
      console.log('Pokemon switch success:', data);
      addToBattleLog('Pokemon switch confirmed!');
      
      // Update selection state based on the switch
      if (data.userId === user.user_id) {
        setMyPokemonSelected(true);
      } else {
        setOpponentPokemonSelected(true);
      }
    };

    const handleBattleEnded = (data) => {
      console.log('Battle ended event received:', data);
      console.log('Current user ID:', user.user_id);
      console.log('Winner ID:', data.winnerId);
      console.log('Is current user winner?', data.winnerId === user.user_id);
      
      setWinner(data.winnerId === user.user_id ? 'player' : 'opponent');
      setGamePhase('ended');
      
      if (data.reason === 'forfeit') {
        if (data.winnerId === user.user_id) {
          // Current player won because opponent forfeited
          addToBattleLog(`Your opponent forfeited! You win!`, 'forfeit');
        } else {
          // Current player forfeited
          addToBattleLog(`You forfeited the battle!`, 'forfeit');
        }
      } else {
        addToBattleLog(`Battle ended! ${data.winnerName} wins!`);
      }
    };

    const handleError = (data) => {
      console.error('Socket error:', data);
      setError(data.message);
    };

    // Add event listeners
    socket.on('battle_started', handleBattleStarted);
    socket.on('pokemon_switched', handlePokemonSwitched);
    socket.on('pokemon_switch_success', handlePokemonSwitchSuccess);
    socket.on('battle_ready', handleBattleReady);
    socket.on('move_result', handleMoveResult);
    socket.on('battle_ended', handleBattleEnded);
    socket.on('error', handleError);

    return () => {
      socket.off('battle_started', handleBattleStarted);
      socket.off('pokemon_switched', handlePokemonSwitched);
      socket.off('pokemon_switch_success', handlePokemonSwitchSuccess);
      socket.off('battle_ready', handleBattleReady);
      socket.off('move_result', handleMoveResult);
      socket.off('battle_ended', handleBattleEnded);
      socket.off('error', handleError);
    };
  }, [socket, user, myPokemon, opponentPokemon, currentMyPokemon, pokemonHP, isProcessingMove]);

  const fetchBattleData = async () => {
    try {
      console.log('Fetching battle data for:', battleId);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/battle/${battleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setBattleData(data.battle);
      
      const myPoke = data.pokemon.filter(p => p.user_id === user.user_id);
      const oppPoke = data.pokemon.filter(p => p.user_id !== user.user_id);
      
      setMyPokemon(myPoke);
      setOpponentPokemon(oppPoke);
      
      // Initialize HP for all Pokemon
      const hpData = {};
      const maxHPData = {};
      
      [...myPoke, ...oppPoke].forEach(pokemon => {
        const maxHP = calculateMaxHP(pokemon);
        maxHPData[pokemon.user_pokemon_id] = maxHP;
        hpData[pokemon.user_pokemon_id] = maxHP;
      });
      
      setMaxPokemonHP(maxHPData);
      setPokemonHP(hpData);
      
      if (data.battle.status === 'active') {
        setGamePhase('selection');
      } else if (data.battle.status === 'finished') {
        setGamePhase('ended');
        setWinner(data.battle.winner === user.user_id ? 'player' : 'opponent');
      }
    } catch (error) {
      console.error('Error fetching battle data:', error);
      setError('Failed to load battle data');
    }
  };

  const fetchPokemonMoves = async (userPokemonId) => {
    try {
      console.log('Fetching moves for Pokemon:', userPokemonId);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/battle/pokemon/${userPokemonId}/moves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableMoves(response.data);
    } catch (error) {
      console.error('Error fetching moves:', error);
    }
  };

  const calculateMaxHP = (pokemon) => {
    return Math.floor(((2 * pokemon.hp + 100) * pokemon.level) / 100) + 10;
  };

  const selectPokemon = (pokemon) => {
    console.log('Selecting Pokemon:', pokemon.nickname || pokemon.pokemon_name);
    
    if (faintedPokemon.has(pokemon.user_pokemon_id)) {
      addToBattleLog(`${pokemon.nickname || pokemon.pokemon_name} has fainted and cannot be selected!`);
      return;
    }

    if (gamePhase === 'selection') {
      if (currentMyPokemon?.user_pokemon_id === pokemon.user_pokemon_id) return;
      
      setCurrentMyPokemon(pokemon);
      setMyPokemonSelected(true);
      addToBattleLog(`${pokemon.nickname || pokemon.pokemon_name} selected!`);
      
      // Initialize HP for the selected Pokemon
      const maxHP = calculateMaxHP(pokemon);
      setMaxPokemonHP(prev => ({
        ...prev,
        [pokemon.user_pokemon_id]: maxHP
      }));
      setPokemonHP(prev => ({
        ...prev,
        [pokemon.user_pokemon_id]: maxHP
      }));
      
      // Emit to backend using switch_pokemon event
      socket.emit('switch_pokemon', {
        battleId,
        pokemonId: pokemon.user_pokemon_id
      });
      
    } else if (gamePhase === 'pokemon_selection') {
      setCurrentMyPokemon(pokemon);
      addToBattleLog(`${pokemon.nickname || pokemon.pokemon_name} is sent out!`);
      
      // Initialize HP for the selected Pokemon
      const maxHP = calculateMaxHP(pokemon);
      setMaxPokemonHP(prev => ({
        ...prev,
        [pokemon.user_pokemon_id]: maxHP
      }));
      setPokemonHP(prev => ({
        ...prev,
        [pokemon.user_pokemon_id]: maxHP
      }));
      
      setShowPokemonSelection(false);
      setAvailablePokemonForSelection([]);
      setGamePhase('battle');
      
      // Emit to backend
      socket.emit('switch_pokemon', {
        battleId,
        pokemonId: pokemon.user_pokemon_id
      });
      
      fetchPokemonMoves(pokemon.user_pokemon_id);
    }
  };

  const useMove = (move) => {
    console.log('Using move:', move.move_name);
    console.log('Move details:', move);
    console.log('Current state:', {
      isMyTurn,
      currentMyPokemon: currentMyPokemon?.nickname || currentMyPokemon?.pokemon_name,
      currentOpponentPokemon: currentOpponentPokemon?.nickname || currentOpponentPokemon?.pokemon_name,
      isProcessingMove
    });
    
    if (!isMyTurn || !currentMyPokemon || !currentOpponentPokemon || isProcessingMove) {
      console.log('Cannot use move - conditions not met:', {
        isMyTurn,
        hasMyPokemon: !!currentMyPokemon,
        hasOpponentPokemon: !!currentOpponentPokemon,
        isProcessingMove
      });
      return;
    }

    // Immediately disable player's turn to prevent multiple moves
    setIsMyTurn(false);
    
    const moveData = {
      battleId,
      moveId: move.move_id,
      targetPokemon: {
        attacker: currentMyPokemon.user_pokemon_id,
        defender: currentOpponentPokemon.user_pokemon_id,
        defenderUserId: opponentPokemon[0]?.user_id
      }
    };
    
    console.log('Emitting use_move with data:', moveData);
    console.log('Socket connected:', socket?.connected);
    console.log('Battle ID:', battleId);
    
    try {
    socket.emit('use_move', moveData);
      console.log('Move event emitted successfully');
    } catch (error) {
      console.error('Error emitting move:', error);
    }
    
    addToBattleLog(`${currentMyPokemon.nickname || currentMyPokemon.pokemon_name} used ${move.move_name}!`);
    
    // Clear available moves until it's our turn again
    setAvailableMoves([]);
  };

  const handlePokemonFainted = (faintedPokemonId) => {
    console.log('Pokemon fainted:', faintedPokemonId);
    setFaintedPokemon(prev => new Set([...prev, faintedPokemonId]));
    
    const isMyPokemon = myPokemon.some(p => p.user_pokemon_id === faintedPokemonId);
    
    if (isMyPokemon) {
      const availablePokemon = myPokemon.filter(p => 
        !faintedPokemon.has(p.user_pokemon_id) && 
        p.user_pokemon_id !== faintedPokemonId
      );
      
      if (availablePokemon.length === 0) {
        setWinner('opponent');
        setGamePhase('ended');
        addToBattleLog('All your Pokemon have fainted! You lose!');
        endBattle();
      } else {
        setAvailablePokemonForSelection(availablePokemon);
        setShowPokemonSelection(true);
        setGamePhase('pokemon_selection');
        addToBattleLog('Choose your next Pokemon!');
      }
    } else {
        const availableOpponentPokemon = opponentPokemon.filter(p => 
        !faintedPokemon.has(p.user_pokemon_id) && 
        p.user_pokemon_id !== faintedPokemonId
        );
        
        if (availableOpponentPokemon.length === 0) {
          setWinner('player');
          setGamePhase('ended');
        addToBattleLog('All opponent Pokemon have fainted! You win!');
          endBattle();
      }
      // Opponent will automatically select next Pokemon via backend
    }
  };

  const endBattle = async () => {
    try {
      const token = localStorage.getItem('token');
      const endData = {
        winnerId: winner === 'player' ? user.user_id : (battleData.user1 === user.user_id ? battleData.user2 : battleData.user1)
      };
      
      await axios.post(`${API_URL}/api/battle/${battleId}/end`, endData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error ending battle:', error);
    }
  };

  const addToBattleLog = async (message, logType = 'info', userId = null) => {
    const timestamp = new Date();
    const logEntry = {
      message,
      timestamp,
      type: logType,
      userId: userId || user.user_id
    };
    
    console.log('Battle log:', logEntry);
    setBattleLog(prev => [...prev, logEntry]);
    
    // Save to database
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/battle/logs`, {
        battleId,
        message,
        logType,
        userId: userId || user.user_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error saving battle log:', error);
    }
  };

  const getTypeColor = (typeName) => {
    const colors = {
      normal: 'bg-gray-400', fire: 'bg-red-500', water: 'bg-blue-500',
      electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-blue-200',
      fighting: 'bg-red-700', poison: 'bg-purple-500', ground: 'bg-yellow-600',
      flying: 'bg-indigo-400', psychic: 'bg-pink-500', bug: 'bg-green-400',
      rock: 'bg-yellow-800', ghost: 'bg-purple-700', dragon: 'bg-indigo-700',
      dark: 'bg-gray-800', steel: 'bg-gray-500', fairy: 'bg-pink-300'
    };
    return colors[typeName?.toLowerCase()] || 'bg-gray-400';
  };

  // Get current HP for a Pokemon
  const getCurrentHP = (pokemonId) => pokemonHP[pokemonId] || 0;
  const getMaxHP = (pokemonId) => maxPokemonHP[pokemonId] || 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connection Lost</h2>
          <p className="text-gray-600 mb-6">Unable to connect to battle server.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Battle Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/battles')}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Return to Battles
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Battle</h2>
          <p className="text-gray-600">Preparing your battle arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-yellow-400 opacity-20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-400 opacity-15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-green-400 opacity-25 rounded-full blur-xl animate-spin"></div>
      </div>
      
      {/* Battle Arena Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {showEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 to-orange-500 opacity-30 animate-pulse"></div>
          <div className="absolute inset-0 bg-white opacity-20 animate-ping"></div>
        </div>
      )}

      <div className="relative z-10 p-4 h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 shadow-2xl border border-white/20">
          <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/battles')}
              className="flex items-center gap-3 hover:bg-white/20 transition-all duration-300 p-3 rounded-2xl group"
              >
              <ArrowLeft size={24} className="text-white group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-white">Back to Battles</span>
              </button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
              {battleData?.user1_name} vs {battleData?.user2_name}
            </div>
              <div className="text-white/80 text-sm">Epic Battle Arena</div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Battle Status */}
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-full backdrop-blur-md ${
                isConnected ? 'bg-green-500/20 border border-green-400' : 'bg-red-500/20 border border-red-400'
              }`}>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-white font-medium text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Battle Controls */}
          <div className="lg:w-1/3 space-y-6">
            {/* My Pokemon Status */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <Sword className="text-white" size={16} />
                </div>
                Your Pokemon
              </h4>
              
              {/* Current Active Pokemon */}
            {currentMyPokemon && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <img 
                        src={`/src/assets/gif/${currentMyPokemon.sp_id}.gif`}
                        alt={currentMyPokemon.pokemon_name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="text-white text-xs font-bold" style={{display: 'none'}}>
                        {currentMyPokemon.pokemon_name.slice(0, 2)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">
                    {currentMyPokemon.nickname || currentMyPokemon.pokemon_name}
                      </div>
                      <div className="text-white/80 text-sm">Lv. {currentMyPokemon.level}</div>
                      <div className="flex space-x-1 mt-1">
                        <span className={`${getTypeColor(currentMyPokemon.type1_name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                          {currentMyPokemon.type1_name}
                        </span>
                        {currentMyPokemon.type2_name && (
                          <span className={`${getTypeColor(currentMyPokemon.type2_name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                            {currentMyPokemon.type2_name}
                          </span>
                        )}
                      </div>
                </div>
                
                    <div className="text-green-400 font-bold text-sm">ACTIVE</div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm text-white/90">
                    <span>HP</span>
                      <span className="font-semibold">
                        {getCurrentHP(currentMyPokemon.user_pokemon_id)}/{getMaxHP(currentMyPokemon.user_pokemon_id)}
                      </span>
                  </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                        style={{ 
                          width: `${(getCurrentHP(currentMyPokemon.user_pokemon_id) / getMaxHP(currentMyPokemon.user_pokemon_id)) * 100}%` 
                        }}
                    ></div>
                  </div>
                </div>
                </div>
              )}
              
              {/* All Pokemon List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {myPokemon.filter(pokemon => currentMyPokemon?.user_pokemon_id !== pokemon.user_pokemon_id).map((pokemon) => {
                  const currentHP = getCurrentHP(pokemon.user_pokemon_id);
                  const maxHP = getMaxHP(pokemon.user_pokemon_id);
                  const isFainted = currentHP <= 0 || faintedPokemon.has(pokemon.user_pokemon_id);
                  
                  return (
                    <div 
                      key={pokemon.user_pokemon_id}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        isFainted 
                          ? 'border-gray-500 bg-gray-500/20 opacity-50' 
                          : 'border-white/20 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                          isFainted 
                            ? 'bg-gray-500' 
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}>
                          <img 
                            src={`/src/assets/gif/${pokemon.sp_id}.gif`}
                            alt={pokemon.pokemon_name}
                            className={`w-8 h-8 object-contain ${isFainted ? 'grayscale opacity-50' : ''}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="text-white text-xs font-bold" style={{display: 'none'}}>
                            {pokemon.pokemon_name.slice(0, 2)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-sm truncate">
                            {pokemon.nickname || pokemon.pokemon_name}
                          </div>
                          <div className="text-white/80 text-xs">Lv. {pokemon.level}</div>
                          <div className="flex space-x-1 mt-1">
                            <span className={`${getTypeColor(pokemon.type1_name)} text-white px-1 py-0.5 rounded-full text-xs font-medium`}>
                              {pokemon.type1_name}
                  </span>
                            {pokemon.type2_name && (
                              <span className={`${getTypeColor(pokemon.type2_name)} text-white px-1 py-0.5 rounded-full text-xs font-medium`}>
                                {pokemon.type2_name}
                    </span>
                  )}
                </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-white/80">
                            {isFainted ? 'FAINTED' : `${currentHP}/${maxHP}`}
                          </div>
                          {!isFainted && (
                            <div className="w-16 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${(currentHP / maxHP) * 100}%` }}
                              ></div>
              </div>
            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Move Selection - Only show when it's player's turn */}
            {gamePhase === 'battle' && isMyTurn && availableMoves.length > 0 && !isProcessingMove && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="text-yellow-400" size={20} />
                  Choose Your Move
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {availableMoves.map((move) => (
                    <button
                      key={move.move_id}
                      onClick={() => useMove(move)}
                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      <div className="text-white font-semibold text-sm mb-1">{move.move_name}</div>
                      <div className="text-white/70 text-xs">Power: {move.power || 0}</div>
                      <div className="text-white/70 text-xs">Type: {move.type_name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Waiting for opponent indicator */}
            {gamePhase === 'battle' && !isMyTurn && !isProcessingMove && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Clock className="text-white animate-pulse" size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Opponent's Turn</h4>
                  <p className="text-white/80">Waiting for opponent to make their move...</p>
                </div>
              </div>
            )}

            {/* Processing move indicator */}
            {isProcessingMove && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="text-white animate-bounce" size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Processing Move</h4>
                  <p className="text-white/80">Calculating damage and effects...</p>
                </div>
              </div>
            )}

            {/* Pokemon Selection */}
            {gamePhase === 'selection' && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sword className="text-yellow-400" size={20} />
                  Choose Your Pokemon
                </h4>
                <div className="space-y-3">
                  {myPokemon.map((pokemon) => (
                    <button
                      key={pokemon.user_pokemon_id}
                      onClick={() => selectPokemon(pokemon)}
                      disabled={currentMyPokemon?.user_pokemon_id === pokemon.user_pokemon_id}
                      className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 backdrop-blur-md ${
                        currentMyPokemon?.user_pokemon_id === pokemon.user_pokemon_id
                          ? 'border-green-400 bg-green-500/20 shadow-lg'
                          : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20 hover:scale-105'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <img 
                            src={`/src/assets/gif/${pokemon.sp_id}.gif`}
                            alt={pokemon.pokemon_name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="text-white text-xs font-bold" style={{display: 'none'}}>
                            {pokemon.pokemon_name.slice(0, 2)}
                          </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-white text-lg">
                            {pokemon.nickname || pokemon.pokemon_name}
                          </div>
                          <div className="text-white/80 text-sm">Lv. {pokemon.level}</div>
                          <div className="flex space-x-1 mt-1">
                            <span className={`${getTypeColor(pokemon.type1_name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                              {pokemon.type1_name}
                            </span>
                            {pokemon.type2_name && (
                              <span className={`${getTypeColor(pokemon.type2_name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                                {pokemon.type2_name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                      {currentMyPokemon?.user_pokemon_id === pokemon.user_pokemon_id && (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                      )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Selection Status */}
                <div className="mt-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-sm text-white/90 space-y-2">
                    <div className="flex justify-between">
                      <span>Your Pokemon:</span>
                      <span className={myPokemonSelected ? 'text-green-400 font-semibold' : 'text-red-400'}>
                        {myPokemonSelected ? '✓ Selected' : '✗ Not Selected'}
                      </span>
                  </div>
                    <div className="flex justify-between">
                      <span>Opponent Pokemon:</span>
                      <span className={opponentPokemonSelected ? 'text-green-400 font-semibold' : 'text-red-400'}>
                        {opponentPokemonSelected ? '✓ Selected' : '✗ Not Selected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center - Battle Arena */}
          <div className="flex-1 flex flex-col justify-center items-center relative">
            {/* My Pokemon (bottom left) */}
            <div className="absolute bottom-20 left-10">
              {currentMyPokemon && (
                <div className="relative">
                  <div className={`w-40 h-40 rounded-3xl flex items-center justify-center relative shadow-2xl ${
                    getCurrentHP(currentMyPokemon.user_pokemon_id) === 0 
                      ? 'bg-gray-400/50 backdrop-blur-md' 
                      : 'bg-gradient-to-br from-sky-400/30 via-blue-500/30 to-purple-600/30 backdrop-blur-md'
                  }`}>
                    <img 
                      src={`/src/assets/gif/${currentMyPokemon.sp_id}.gif`}
                      alt={currentMyPokemon.pokemon_name}
                      className={`w-32 h-32 object-contain transition-all duration-500 ${
                        getCurrentHP(currentMyPokemon.user_pokemon_id) === 0 ? 'grayscale opacity-50 scale-90' : ''
                      }`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="text-white text-sm font-bold" style={{display: 'none'}}>
                      {currentMyPokemon.pokemon_name}
                    </div>
                  </div>
                  {getCurrentHP(currentMyPokemon.user_pokemon_id) === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
                        FAINTED
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Opponent Pokemon (top right) */}
            <div className="absolute top-20 right-10">
              {currentOpponentPokemon && (
                <div className="relative">
                  <div className={`w-40 h-40 rounded-3xl flex items-center justify-center relative shadow-2xl ${
                    getCurrentHP(currentOpponentPokemon.user_pokemon_id) === 0 
                      ? 'bg-gray-400/50 backdrop-blur-md' 
                      : 'bg-gradient-to-br from-sky-400/30 via-blue-500/30 to-purple-600/30 backdrop-blur-md'
                  }`}>
                    <img 
                      src={`/src/assets/gif/${currentOpponentPokemon.sp_id}.gif`}
                      alt={currentOpponentPokemon.pokemon_name}
                      className={`w-32 h-32 object-contain transition-all duration-500 ${
                        getCurrentHP(currentOpponentPokemon.user_pokemon_id) === 0 ? 'grayscale opacity-50 scale-90' : ''
                      }`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="text-white text-sm font-bold" style={{display: 'none'}}>
                      {currentOpponentPokemon.pokemon_name}
                    </div>
                  </div>
                  {getCurrentHP(currentOpponentPokemon.user_pokemon_id) === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
                        FAINTED
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visual Effects */}
            {showEffect && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-30 animate-ping"></div>
                <div className="w-64 h-64 bg-gradient-to-r from-red-500 to-pink-500 rounded-full opacity-40 animate-pulse"></div>
              </div>
            )}

            {/* Turn Indicator and Forfeit Button */}
            <div className="absolute top-4 left-1/3 flex items-center gap-3">
              {/* Forfeit Button */}
              {gamePhase === 'battle' && (
                <button
                  onClick={() => {
                    console.log('Forfeit button clicked');
                    console.log('Socket connected:', socket?.connected);
                    console.log('Battle ID:', battleId);
                    console.log('User ID:', user.user_id);
                    console.log('Username:', user.username);
                    
                    if (window.confirm('Are you sure you want to forfeit this battle?')) {
                      // Current player loses, opponent wins
                      setWinner('opponent');
                      setGamePhase('ended');
                      addToBattleLog('You forfeited the battle!', 'forfeit');
                      
                      const forfeitData = { 
                        battleId,
                        forfeiterId: user.user_id,
                        forfeiterName: user.username
                      };
                      console.log('Emitting forfeit_battle with data:', forfeitData);
                      socket.emit('forfeit_battle', forfeitData);
                    }
                  }}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-1 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-400/50"
                >
                  Forfeit
                </button>
              )}
              
              {/* Turn Indicator */}
              <div className={`px-4 py-1 rounded-full text-white font-semibold text-sm shadow-lg backdrop-blur-md border ${
                isMyTurn 
                  ? 'bg-gradient-to-r from-green-500/80 to-blue-500/80 border-green-400' 
                  : 'bg-gradient-to-r from-red-500/80 to-pink-500/80 border-red-400'
              }`}>
                {isMyTurn ? 'YOUR TURN' : 'OPPONENT\'S TURN'}
              </div>
            </div>



            {/* Battle End Screen */}
            {gamePhase === 'ended' && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center rounded-3xl">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl border border-white/20">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Trophy className="text-white" size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {winner === 'player' ? 'Victory!' : 'Defeat!'}
                  </h2>
                  <p className="text-white/80 text-lg mb-6">
                    {winner === 'player' 
                      ? 'Congratulations! You won the battle!' 
                      : 'Better luck next time!'
                    }
                  </p>
                  <button
                    onClick={() => navigate('/battles')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    Return to Battles
                  </button>
                </div>
              </div>
            )}

            {/* Pokemon Selection Modal */}
            {showPokemonSelection && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center rounded-3xl">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-white/20">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <AlertCircle className="text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pokemon Fainted!</h3>
                    <p className="text-white/80">
                      {currentMyPokemon?.nickname || currentMyPokemon?.pokemon_name} has fainted!
                    </p>
                    <p className="text-white/80 mt-2">Choose your next Pokemon to continue the battle!</p>
          </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {availablePokemonForSelection.map((pokemon) => (
                      <button
                        key={pokemon.user_pokemon_id}
                        onClick={() => selectPokemon(pokemon)}
                        className="p-6 rounded-2xl border-2 border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <img 
                              src={`/src/assets/gif/${pokemon.sp_id}.gif`}
                              alt={pokemon.pokemon_name}
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="text-white text-sm font-bold" style={{display: 'none'}}>
                              {pokemon.pokemon_name.slice(0, 2)}
                            </div>
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="font-bold text-lg text-white">
                              {pokemon.nickname || pokemon.pokemon_name}
                            </div>
                            <div className="text-white/80 text-sm mb-2">Lv. {pokemon.level}</div>
                            <div className="flex space-x-1">
                              <span className={`${getTypeColor(pokemon.type1_name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                                {pokemon.type1_name}
                              </span>
                              {pokemon.type2_name && (
                                <span className={`${getTypeColor(pokemon.type2_name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                                  {pokemon.type2_name}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg font-bold">→</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        setShowPokemonSelection(false);
                        setWinner('opponent');
                        setGamePhase('ended');
                      }}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300"
                    >
                      Forfeit Battle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Opponent Pokemon & Battle Log */}
          <div className="lg:w-1/3 space-y-6">
            {/* Opponent Pokemon Status */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <Sword className="text-white" size={16} />
                </div>
                Opponent Pokemon
              </h4>
              
              {/* Current Active Pokemon */}
            {currentOpponentPokemon && (
                <div className="mb-4 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl border border-red-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <img 
                        src={`/src/assets/gif/${currentOpponentPokemon.sp_id}.gif`}
                        alt={currentOpponentPokemon.pokemon_name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="text-white text-xs font-bold" style={{display: 'none'}}>
                        {currentOpponentPokemon.pokemon_name.slice(0, 2)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">
                    {currentOpponentPokemon.nickname || currentOpponentPokemon.pokemon_name}
                      </div>
                      <div className="text-white/80 text-sm">Lv. {currentOpponentPokemon.level}</div>
                      <div className="flex space-x-1 mt-1">
                        <span className={`${getTypeColor(currentOpponentPokemon.type1_name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                          {currentOpponentPokemon.type1_name}
                        </span>
                        {currentOpponentPokemon.type2_name && (
                          <span className={`${getTypeColor(currentOpponentPokemon.type2_name)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                            {currentOpponentPokemon.type2_name}
                          </span>
                        )}
                      </div>
                </div>
                
                    <div className="text-red-400 font-bold text-sm">ACTIVE</div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm text-white/90">
                    <span>HP</span>
                      <span className="font-semibold">
                        {getCurrentHP(currentOpponentPokemon.user_pokemon_id)}/{getMaxHP(currentOpponentPokemon.user_pokemon_id)}
                      </span>
                  </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                        style={{ 
                          width: `${(getCurrentHP(currentOpponentPokemon.user_pokemon_id) / getMaxHP(currentOpponentPokemon.user_pokemon_id)) * 100}%` 
                        }}
                    ></div>
                  </div>
                </div>
                </div>
              )}
              
              {/* All Pokemon List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {opponentPokemon.filter(pokemon => currentOpponentPokemon?.user_pokemon_id !== pokemon.user_pokemon_id).map((pokemon) => {
                  const currentHP = getCurrentHP(pokemon.user_pokemon_id);
                  const maxHP = getMaxHP(pokemon.user_pokemon_id);
                  const isFainted = currentHP <= 0 || faintedPokemon.has(pokemon.user_pokemon_id);
                  
                  return (
                    <div 
                      key={pokemon.user_pokemon_id}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        isFainted 
                          ? 'border-gray-500 bg-gray-500/20 opacity-50' 
                          : 'border-white/20 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                          isFainted 
                            ? 'bg-gray-500' 
                            : 'bg-gradient-to-br from-red-400 to-red-600'
                        }`}>
                          <img 
                            src={`/src/assets/gif/${pokemon.sp_id}.gif`}
                            alt={pokemon.pokemon_name}
                            className={`w-8 h-8 object-contain ${isFainted ? 'grayscale opacity-50' : ''}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="text-white text-xs font-bold" style={{display: 'none'}}>
                            {pokemon.pokemon_name.slice(0, 2)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-sm truncate">
                            {pokemon.nickname || pokemon.pokemon_name}
                          </div>
                          <div className="text-white/80 text-xs">Lv. {pokemon.level}</div>
                          <div className="flex space-x-1 mt-1">
                            <span className={`${getTypeColor(pokemon.type1_name)} text-white px-1 py-0.5 rounded-full text-xs font-medium`}>
                              {pokemon.type1_name}
                  </span>
                            {pokemon.type2_name && (
                              <span className={`${getTypeColor(pokemon.type2_name)} text-white px-1 py-0.5 rounded-full text-xs font-medium`}>
                                {pokemon.type2_name}
                    </span>
                  )}
                </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-white/80">
                            {isFainted ? 'FAINTED' : `${currentHP}/${maxHP}`}
                          </div>
                          {!isFainted && (
                            <div className="w-16 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${(currentHP / maxHP) * 100}%` }}
                              ></div>
              </div>
            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Battle Log */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 h-96 overflow-y-auto">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="text-white/80" size={20} />
                Battle Log
              </h4>
              
              {/* Turn Status */}
              {gamePhase === 'battle' && (
                <div className={`mb-4 p-3 rounded-2xl text-center backdrop-blur-md ${
                  isMyTurn 
                    ? 'bg-green-500/20 border border-green-400' 
                    : 'bg-red-500/20 border border-red-400'
                }`}>
                  <div className={`text-sm font-semibold ${
                    isMyTurn ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isProcessingMove 
                      ? 'Processing Move...' 
                      : isMyTurn 
                        ? 'Your Turn - Choose a Move!' 
                        : 'Opponent\'s Turn - Please Wait'
                    }
                  </div>
                </div>
              )}
              
              <div className="space-y-2 text-sm text-white/90">
                {battleLog.map((logEntry, index) => (
                  <div key={index} className="border-b border-white/10 pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-white/50">
                        {logEntry.timestamp ? new Date(logEntry.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        logEntry.type === 'damage' ? 'bg-red-500/20 text-red-400' :
                        logEntry.type === 'heal' ? 'bg-green-500/20 text-green-400' :
                        logEntry.type === 'faint' ? 'bg-gray-500/20 text-gray-400' :
                        logEntry.type === 'forfeit' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {logEntry.type}
                      </span>
                    </div>
                    <div className="text-white/90 mt-1">
                      {logEntry.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mt-6 shadow-2xl border border-white/20">
          <div className="flex justify-between items-center text-sm text-white/80">
            <div>Phase: {gamePhase}</div>
            <div>Turn: {isMyTurn ? 'Yours' : 'Opponent'}</div>
            <div>Battle ID: {battleId}</div>
            <button
              onClick={() => {
                console.log('Testing battle_ended event');
                const testData = {
                  winnerId: user.user_id,
                  winnerName: user.username,
                  forfeiterName: 'Test Opponent',
                  reason: 'forfeit'
                };
                console.log('Manually triggering battle_ended with:', testData);
                handleBattleEnded(testData);
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Test Battle End
            </button>
            <button
              onClick={() => {
                console.log('Checking battle room status');
                socket.emit('debug_battle_room', { battleId });
              }}
              className="bg-green-500 text-white px-2 py-1 rounded text-xs ml-2"
            >
              Check Room
            </button>
            <button
              onClick={() => {
                console.log('Simulating opponent forfeit');
                const testData = {
                  winnerId: user.user_id, // Current player wins
                  winnerName: user.username,
                  forfeiterName: 'Opponent',
                  reason: 'forfeit'
                };
                console.log('Simulating opponent forfeit with:', testData);
                handleBattleEnded(testData);
              }}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs ml-2"
            >
              Simulate Opponent Forfeit
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

export default BattleArena;