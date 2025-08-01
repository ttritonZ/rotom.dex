import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Trophy, Sword, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const RecentBattles = () => {
  const [recentBattles, setRecentBattles] = useState([]);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [battleLogs, setBattleLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = { user_id: localStorage.getItem('user_id') };

  useEffect(() => {
    fetchRecentBattles();
  }, []);

  const fetchRecentBattles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/battle/recent/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentBattles(response.data);
    } catch (error) {
      console.error('Error fetching recent battles:', error);
      setError('Failed to load recent battles');
    } finally {
      setLoading(false);
    }
  };

  const fetchBattleLogs = async (battleId) => {
    try {
      setLogsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/battle/logs/${battleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBattleLogs(response.data);
    } catch (error) {
      console.error('Error fetching battle logs:', error);
      setError('Failed to load battle logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleBattleClick = (battle) => {
    setSelectedBattle(battle);
    fetchBattleLogs(battle.battle_id);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
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
                      onClick={() => handleBattleClick(battle)}
                      className={`w-full p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
                        selectedBattle?.battle_id === battle.battle_id
                          ? 'border-blue-400 bg-blue-500/20'
                          : 'border-white/20 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="text-white/80" size={16} />
                            <span className="text-white font-semibold">
                              {battle.user1_name} vs {battle.user2_name}
                            </span>
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
                      <span className="text-red-400">⚠️</span>
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
                        <span><strong>{selectedBattle.user1_name}</strong> vs <strong>{selectedBattle.user2_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{formatTime(selectedBattle.battle_time)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className={`font-semibold ${getBattleResult(selectedBattle).color} flex items-center gap-2`}>
                        {getBattleResult(selectedBattle).result === 'Victory' ? '🏆' : getBattleResult(selectedBattle).result === 'Defeat' ? '💀' : '❓'}
                        <span>Result: {getBattleResult(selectedBattle).result}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📝</span>
                        <span>{battleLogs.length} log entries</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {logsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white/80">Loading battle logs...</p>
                    </div>
                  ) : battleLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="text-white/50 mx-auto mb-4" size={32} />
                      <p className="text-white/80">No battle logs found</p>
                    </div>
                  ) : (
                    battleLogs.map((log, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getLogIcon(log.log_type)}</span>
                            <span className={`text-xs px-3 py-1 rounded-full border ${getLogTypeColor(log.log_type)} font-medium`}>
                              {log.log_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-white/50">
                            {formatTime(log.log_timestamp)}
                          </span>
                        </div>
                        <div className="text-white/90 text-sm leading-relaxed">
                          {log.log_message}
                        </div>
                        {log.username && (
                          <div className="mt-2 text-xs text-white/60">
                            By: {log.username}
                          </div>
                        )}
                      </div>
                    ))
                  )}
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