import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext.jsx';
import { Search, Plus, MessageCircle, Users, Calendar, RefreshCw, TrendingUp, Clock, Sparkles } from 'lucide-react';

export default function ForumPage() {
  const [forums, setForums] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newForum, setNewForum] = useState({ name: '', description: '' });
  const [addError, setAddError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [stats, setStats] = useState({
    totalForums: 0,
    activeForums: 0,
    recentActivity: 0
  });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const refreshIntervalRef = useRef(null);

  const fetchForums = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/forums`);
      setForums(res.data);
      setLastRefresh(new Date());
      
      // Calculate stats
      setStats({
        totalForums: res.data.length,
        activeForums: res.data.filter(f => f.recent_activity).length,
        recentActivity: res.data.filter(f => {
          const created = new Date(f.created_at);
          const now = new Date();
          return (now - created) < (24 * 60 * 60 * 1000); // Last 24 hours
        }).length
      });
    } catch (error) {
      console.error('Error fetching forums:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 500ms for fluid interaction
  useEffect(() => {
    fetchForums(true);
    
    // Set up auto-refresh interval
    refreshIntervalRef.current = setInterval(() => {
      fetchForums();
    }, 500);

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const filteredForums = forums
    .filter(f => f.forum_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.forum_name.localeCompare(b.forum_name));

  const handleSearch = (e) => {
    e.preventDefault();
    fetchForums();
  };

  const handleAddForum = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newForum.name.trim() || !newForum.description.trim()) {
      setAddError('Name and description required');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setAddError('Please log in to create a forum');
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/forums`, {
        forum_name: newForum.name,
        forum_description: newForum.description
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setShowAdd(false);
      setNewForum({ name: '', description: '' });
      fetchForums();
    } catch (err) {
      if (err.response?.status === 401) {
        setAddError('Please log in to create a forum');
      } else if (err.response?.data?.message) {
        setAddError(err.response.data.message);
      } else {
        setAddError('Failed to add forum');
      }
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 text-lg font-medium">Loading forums...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-20 px-6 pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent mb-4">
            Community Forums
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with fellow trainers and discuss strategies, trades, and adventures
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Last updated: {formatTimeAgo(lastRefresh)}</span>
          </div>
        </div>

        {/* Enhanced Search and Add Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search forums by name..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                <Search size={18} />
                Search
              </button>
              <button 
                type="button" 
                onClick={() => { setSearch(''); fetchForums(); }} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                Clear
              </button>
              {user && (
                <button 
                  type="button" 
                  onClick={() => setShowAdd(v => !v)} 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                  <Plus size={18} />
                  {showAdd ? 'Cancel' : 'New Forum'}
                </button>
              )}
            </div>
          </form>

          {/* Enhanced Add Forum Form */}
          {showAdd && user && (
            <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Plus size={20} className="text-white" />
                </div>
                Create New Forum
              </h3>
              <form onSubmit={handleAddForum} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Forum Name</label>
                  <input
                    type="text"
                    value={newForum.name}
                    onChange={e => setNewForum(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter forum name..."
                    className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
                  <textarea
                    value={newForum.description}
                    onChange={e => setNewForum(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe what this forum is about..."
                    rows={4}
                    className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-lg"
                    required
                  />
                </div>
                {addError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                    {addError}
                  </div>
                )}
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Create Forum
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Enhanced Forums List */}
        <div className="space-y-6">
          {filteredForums.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <MessageCircle className="mx-auto text-gray-400 mb-6" size={64} />
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">No forums found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or create a new forum!</p>
                {user && (
                  <button 
                    onClick={() => setShowAdd(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Create First Forum
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Enhanced Stats Bar */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{stats.totalForums}</div>
                      <div className="text-sm text-gray-500">Total Forums</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{stats.activeForums}</div>
                      <div className="text-sm text-gray-500">Active Forums</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{stats.recentActivity}</div>
                      <div className="text-sm text-gray-500">Recent Activity</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">Live</div>
                      <div className="text-sm text-gray-500">Auto-refresh</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forum Cards */}
              <div className="grid gap-6">
                {filteredForums.map((f, index) => (
                  <div 
                    key={f.forum_id} 
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                              <MessageCircle className="text-white" size={24} />
                            </div>
                            <div>
                              <h2 className="text-3xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors cursor-pointer" 
                                  onClick={() => navigate(`/forums/${f.forum_id}`)}>
                                {f.forum_name}
                              </h2>
                              <p className="text-gray-600 leading-relaxed text-lg">{f.forum_description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                          <Users size={16} />
                          <span>Community</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Created by {f.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} />
                            <span>Active discussions</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/forums/${f.forum_id}`)} 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                        >
                          <MessageCircle size={18} />
                          View Discussion
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

