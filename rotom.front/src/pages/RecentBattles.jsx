import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Trophy, Sword, User, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { SocketContext } from '../contexts/SocketContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const RecentBattles = () => {
  const [recentBattles, setRecentBattles] = useState([]);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [battleLogs, setBattleLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const user = { user_id: localStorage.getItem('user_id') };

  // Check authentication and redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) {
      console.log('No auth token or user ID found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Fetch recent battles
  const fetchRecentBattles = async () => {
    console.log('fetchRecentBattles called');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) {
      console.error('No auth token or user ID found in localStorage');
      navigate('/login');
      return;
    }

    try {
      console.log('Starting to fetch recent battles...');
      setRefreshing(true);
      setLoading(true);
      
      const url = `${API_URL}/api/battle/recent/${userId}`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} battles`);
        setRecentBattles(response.data);
        setError(null);
      } else {
        console.warn('Unexpected response format:', response.data);
        setError('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error fetching recent battles:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        navigate('/login');
        return;
      }
      
      setError('Failed to load recent battles. ' + 
        (error.response?.data?.error || 'Please try again later.')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Set up socket listeners for battle updates
  useEffect(() => {
    if (!socket || !socket.socket) return;
    
    const handleBattleUpdated = () => {
      console.log('Received battle update, refreshing...');
      fetchRecentBattles();
    };
    
    socket.socket.on('battle_updated', handleBattleUpdated);
    socket.socket.emit('join_room', `user_${user.user_id}`);
    
    return () => {
      socket.socket.off('battle_updated', handleBattleUpdated);
      socket.socket.emit('leave_room', `user_${user.user_id}`);
    };
  }, [socket, user.user_id]);
  
  // Initial data fetch
  useEffect(() => {
    fetchRecentBattles();
  }, []);



  const fetchBattleLogs = useCallback(async (battleId) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No auth token found, redirecting to login');
      navigate('/login');
      return [];
    }

    try {
      setLogsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/battle/logs/${battleId}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data && Array.isArray(response.data)) {
        setBattleLogs(response.data);
        return response.data;
      } else {
        console.warn('Unexpected battle logs format:', response.data);
        setError('Invalid battle logs format');
        return [];
      }
    } catch (error) {
      console.error('Error fetching battle logs:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        navigate('/login');
        return [];
      }
      
      setError('Failed to load battle logs. ' + 
        (error.response?.data?.error || 'Please try again.')
      );
      return [];
    } finally {
      setLogsLoading(false);
    }
  }, [navigate]);

  const handleBattleClick = async (battle) => {
    try {
      console.log('Battle card clicked:', battle);
      setSelectedBattle(battle);
      await fetchBattleLogs(battle.battle_id);
      // Join battle room for real-time updates
      if (socket && socket.socket) {
        socket.socket.emit('join_room', `battle_${battle.battle_id}`);
      }
    } catch (error) {
      console.error('Error selecting battle:', error);
      setError('Failed to load battle details');
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (selectedBattle && socket && socket.socket) {
      // Leave battle room when going back
      socket.socket.emit('leave_room', `battle_${selectedBattle.battle_id}`);
    }
    setSelectedBattle(null);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    if (selectedBattle) {
      fetchBattleLogs(selectedBattle.battle_id);
    } else {
      fetchRecentBattles();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBattleResult = (battle) => {
    if (battle.winner === user.user_id) {
      return { result: 'Victory', color: 'text-green-400' };
    } else if (battle.loser === user.user_id) {
      return { result: 'Defeat', color: 'text-red-400' };
    }
    return { result: 'Unknown', color: 'text-gray-400' };
  };

  const getLogTypeColor = (logType) => {
    switch (logType) {
      case 'damage': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'heal': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'faint': return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
      case 'forfeit': return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      case 'move': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'status': return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      case 'battle_start': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'battle_end': return 'bg-indigo-500/20 text-indigo-400 border-indigo-400/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
    }
  };

  const getLogIcon = (logType) => {
    switch (logType) {
      case 'damage': return '⚔️';
      case 'heal': return '💚';
      case 'faint': return '💀';
      case 'forfeit': return '🏳️';
      case 'move': return '🎯';
      case 'status': return '✨';
      case 'battle_start': return '⚡';
      case 'battle_end': return '🏆';
      default: return '📝';
    }
  };

  // Handle socket events for real-time battle logs
  useEffect(() => {
    if (!socket || !socket.socket || !selectedBattle) return;

    const handleNewLog = (log) => {
      setBattleLogs(prevLogs => [...prevLogs, log]);
    };

    socket.socket.on('battle_log', handleNewLog);
    
    return () => {
      socket.socket.off('battle_log', handleNewLog);
      if (selectedBattle) {
        socket.socket.emit('leave_room', `battle_${selectedBattle.battle_id}`);
      }
    };
  }, [socket, selectedBattle]);

  // Auto-scroll to bottom when new logs arrive
  const logsEndRef = useRef(null);
  const logsContainerRef = useRef(null);
  
  useEffect(() => {
    if (logsEndRef.current && logsContainerRef.current) {
      const container = logsContainerRef.current;
      const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isScrolledToBottom) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [battleLogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl border border-white/20">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Clock className="text-white animate-spin" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Recent Battles</h2>
          <p className="text-white/80">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 pt-20 px-6 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/battles')}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-2xl group transition-all duration-300"
              >
                <ArrowLeft className="text-white group-hover:scale-110 transition-transform" size={24} />
                <span className="text-white font-semibold">Back to Battles</span>
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Recent Battles</h1>
              <p className="text-white/80">View your battle history and logs</p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Battles List */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sword className="text-white" size={20} />
              Battle History
            </h2>
            {recentBattles.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="text-white/50 mx-auto mb-4" size={48} />
                <p className="text-white/80">No recent battles found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentBattles.map((battle) => {
                  const battleResult = getBattleResult(battle);
                  return (
                    <button
                      key={battle.battle_id}
                      type="button"
                      onClick={() => handleBattleClick(battle)}
                      style={{ pointerEvents: 'auto', zIndex: 1 }}
                      className={`w-full p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md outline-none focus:outline-none ${
                        selectedBattle?.battle_id === battle.battle_id
                          ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400'
                          : battle.status === 'finished'
                            ? 'border-green-400 bg-green-500/10'
                            : 'border-white/20 bg-white/10 hover:bg-white/20 focus:ring-2 focus:ring-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="text-white/80" size={16} />
                            <span className="text-white font-semibold">
                              {battle.player1_username} vs {battle.player2_username}
                            </span>
                            {battle.status === 'finished' ? (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/30 text-green-200 text-xs font-bold">Finished</span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/30 text-yellow-200 text-xs font-bold">Active</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-white/80 flex items-center gap-1">
                              <Clock size={12} />
                              {formatTime(battle.battle_time)}
                            </span>
                            <span className={`font-semibold ${battleResult.color} flex items-center gap-1`}>
                              {battleResult.result === 'Victory' ? '🏆' : battleResult.result === 'Defeat' ? '💀' : '❓'}
                              {battleResult.result}
                            </span>
                            <span className="text-white/60 flex items-center gap-1">
                              <span>📝</span>
                              {battle.log_count || 0} logs
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/60">
                            Battle #{battle.battle_id}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Battle Logs */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="text-white" size={20} />
              Battle Log
            </h2>

            {selectedBattle ? (
              <div>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400"></span>
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  </div>
                )}
                <div className="mb-6 p-4 bg-white/10 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Sword size={20} />
                    Battle #{selectedBattle.battle_id}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>
                          <strong>{selectedBattle.player1_username}</strong> vs{' '}
                          <strong>{selectedBattle.player2_username}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{formatTime(selectedBattle.battle_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-full ${
                          selectedBattle.status === 'finished' 
                            ? 'bg-green-500/30 text-green-200' 
                            : 'bg-yellow-500/30 text-yellow-200'
                        } text-xs font-bold`}>
                          {selectedBattle.status === 'finished' ? 'Finished' : 'Active'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className={`font-semibold ${getBattleResult(selectedBattle).color} flex items-center gap-2`}>
                        {getBattleResult(selectedBattle).result === 'Victory' ? '' : getBattleResult(selectedBattle).result === 'Defeat' ? '' : ''}
                        <span>Result: {getBattleResult(selectedBattle).result}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span></span>
                          <div className="flex items-center gap-2">
                            <span>Status: </span>
                            <span className={selectedBattle.status === 'finished' ? 'text-green-400' : 'text-yellow-400'}>
                              {selectedBattle.status === 'finished' ? 'Finished' : 'Active'}
                            </span>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Battle Logs Section */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-300">Battle Logs</h3>
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                      {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto pr-2 rounded-lg bg-black/20 p-4">
                    {logsLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-400">Loading logs...</p>
                      </div>
                    ) : battleLogs.length > 0 ? (
                      <div className="space-y-2" ref={logsContainerRef}>
                        {battleLogs.map((log, index) => (
                          <div 
                            key={`${log.log_id || index}-${log.log_timestamp}`} 
                            className={`p-3 rounded-lg border ${getLogTypeColor(log.log_type)} transition-all duration-200 hover:scale-[1.01]`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-sm opacity-70 mt-0.5">{getLogIcon(log.log_type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-medium text-sm truncate max-w-[120px]">
                                    {log.username || 'System'}
                                  </span>
                                  <span className="text-xs opacity-60 whitespace-nowrap">
                                    {formatTime(log.log_timestamp)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm break-words">{log.log_message || log.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={logsEndRef} />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <p>No battle logs found for this match</p>
                        <button 
                          onClick={handleRefresh}
                          className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mx-auto"
                        >
                          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                          Try again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="text-white/50 mx-auto mb-4" size={48} />
                <p className="text-white/80">Select a battle to view its logs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentBattles; 