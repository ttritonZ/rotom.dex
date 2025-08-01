import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext.jsx';
import { ArrowLeft, Send, Reply, Trash2, MessageCircle, Clock, User, RefreshCw, TrendingUp } from 'lucide-react';

export default function ForumDetailPage() {
  const { forum_id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [forumInfo, setForumInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [stats, setStats] = useState({
    totalComments: 0,
    myComments: 0,
    recentActivity: 0
  });
  const refreshIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setShouldAutoScroll(isAtBottom);
    }
  };

  // Auto-scroll to bottom when new comments arrive, but only if user is at bottom
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [comments, shouldAutoScroll]);

  const fetchComments = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/forums/${forum_id}/comments`);
      setComments(res.data);
      setLastRefresh(new Date());
      
      // Calculate stats
      const myCommentsCount = res.data.filter(c => {
        const commentorId = parseInt(c.commentor);
        const userId = parseInt(user?.user_id);
        return user && commentorId === userId;
      }).length;
      
      const recentActivity = res.data.filter(c => {
        const commentTime = new Date(c.comment_time);
        const now = new Date();
        return (now - commentTime) < (5 * 60 * 1000); // Last 5 minutes
      }).length;
      
      setStats({
        totalComments: res.data.length,
        myComments: myCommentsCount,
        recentActivity: recentActivity
      });
      
      // Get forum info from first comment or fetch separately
      if (res.data.length > 0) {
        setForumInfo({
          forum_name: res.data[0].forum_name,
          forum_description: res.data[0].forum_description,
          forum_manager: res.data[0].forum_manager
        });
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 300ms for fluid chat experience
  useEffect(() => {
    fetchComments(true);
    
    // Set up auto-refresh interval
    refreshIntervalRef.current = setInterval(() => {
      fetchComments();
    }, 300);

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [forum_id]);

  const postComment = async (reply_to = null) => {
    const commentText = replyingTo ? replyText : newComment;
    if (!commentText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/forums/comment`, {
        forum_id, 
        comment_text: commentText, 
        reply_to
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      setReplyingTo(null);
      setReplyText('');
      // Immediate refresh to show new comment
      setTimeout(() => fetchComments(), 100);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const deleteComment = async (comment_id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/forums/comment`, {
        data: { comment_id, forum_id },
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startReply = (comment) => {
    setReplyingTo(comment);
    setReplyText(`@${comment.username} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const isMyComment = (comment) => {
    // Convert both to numbers for comparison to handle string/number mismatches
    const commentorId = parseInt(comment.commentor);
    const userId = parseInt(user?.user_id);
    return user && commentorId === userId;
  };

  const canDeleteComment = (comment) => {
    // Convert both to numbers for comparison to handle string/number mismatches
    const commentorId = parseInt(comment.commentor);
    const userId = parseInt(user?.user_id);
    const forumManagerId = parseInt(forumInfo?.forum_manager);
    return user && (commentorId === userId || forumManagerId === userId);
  };

  const formatTime = (timeString) => {
    try {
      // Backend now sends ISO format strings, so we can parse directly
      const date = new Date(timeString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 0) return 'Just now'; // Future date
      if (diffInSeconds < 30) return 'Just now';
      if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting time:', error, timeString);
      return 'Unknown time';
    }
  };

  const formatTimeAgo = (date) => {
    try {
      const now = new Date();
      const targetDate = new Date(date);
      const diffInSeconds = Math.floor((now - targetDate) / 1000);
      
      if (diffInSeconds < 0) return 'Just now'; // Future date
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch (error) {
      console.error('Error formatting time ago:', error, date);
      return 'Unknown time';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 text-lg font-medium">Loading discussion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/forums')}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                {forumInfo?.forum_name || 'Discussion'}
              </h1>
              <p className="text-gray-600 text-lg">
                {forumInfo?.forum_description || 'Join the conversation'}
              </p>
            </div>
          </div>
          
          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalComments}</div>
                <div className="text-sm text-gray-500">Total Comments</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="text-green-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.myComments}</div>
                <div className="text-sm text-gray-500">My Comments</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.recentActivity}</div>
                <div className="text-sm text-gray-500">Recent Activity</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className={`text-orange-600 ${isRefreshing ? 'animate-spin' : ''}`} size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">Live</div>
                <div className="text-sm text-gray-500">Auto-refresh</div>
              </div>
            </div>
          </div>
          
          {/* Auto-refresh indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-4">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Auto-refreshing every 300ms</span>
            <span>•</span>
            <span>Last updated: {formatTimeAgo(lastRefresh)}</span>
          </div>
        </div>

        {/* Enhanced Comments Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="text-white" size={20} />
            </div>
            Live Discussion
          </h2>

          {comments.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <MessageCircle className="mx-auto text-gray-400 mb-6" size={64} />
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">No comments yet</h3>
                <p className="text-gray-500 mb-6">Be the first to start the conversation!</p>
                {user && (
                  <button 
                    onClick={() => document.getElementById('comment-input')?.focus()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Start Discussion
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto" ref={chatContainerRef} onScroll={handleScroll}>
              {comments.map((comment, index) => {
                const isMine = isMyComment(comment);
                const isReply = comment.reply_to !== null;
                const parentComment = isReply ? comments.find(c => c.comment_id === comment.reply_to) : null;
                
                return (
                  <div key={comment.comment_id} className="relative animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    {/* Reply indicator line */}
                    {isReply && (
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                    )}
                    
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isMine ? 'order-2' : 'order-1'}`}>
                        {/* Reply reference */}
                        {isReply && parentComment && (
                          <div className={`mb-2 ${isMine ? 'text-right' : 'text-left'}`}>
                            <div className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                              <Reply size={12} />
                              <span>Replying to </span>
                              <button 
                                onClick={() => navigate(`/user/${parentComment.commentor}`)}
                                className="font-semibold hover:underline cursor-pointer"
                                title={`View ${parentComment.username}'s profile`}
                              >
                                {parentComment.username}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Comment bubble */}
                        <div className={`relative ${isMine ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-2xl px-6 py-4 shadow-lg transition-all duration-300 hover:shadow-xl`}>
                          <div className="flex items-start gap-3">
                            {!isMine && (
                              <button 
                                onClick={() => navigate(`/user/${comment.commentor}`)}
                                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 hover:scale-110 transition-transform duration-200 cursor-pointer"
                                title={`View ${comment.username}'s profile`}
                              >
                                {comment.username?.charAt(0).toUpperCase()}
                              </button>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              {!isMine && (
                                <button 
                                  onClick={() => navigate(`/user/${comment.commentor}`)}
                                  className="font-semibold text-sm mb-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                                  title={`View ${comment.username}'s profile`}
                                >
                                  {comment.username}
                                </button>
                              )}
                              <div className="text-sm leading-relaxed break-words">
                                {comment.comment_text}
                              </div>
                            </div>
                            
                            {isMine && (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {comment.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Comment actions and timestamp */}
                        <div className={`flex items-center gap-3 mt-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{formatTime(comment.comment_time)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startReply(comment)}
                              className="text-xs text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
                            >
                              <Reply size={14} />
                            </button>
                            
                            {canDeleteComment(comment) && (
                              <button
                                onClick={() => deleteComment(comment.comment_id)}
                                className="text-xs text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-300"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Enhanced Comment Input */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {replyingTo && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Reply size={18} className="text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Replying to <span className="font-semibold">{replyingTo.username}</span>
                  </span>
                </div>
                <button
                  onClick={cancelReply}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                id="comment-input"
                value={replyingTo ? replyText : newComment}
                onChange={(e) => replyingTo ? setReplyText(e.target.value) : setNewComment(e.target.value)}
                placeholder={replyingTo ? "Write your reply..." : "Join the discussion..."}
                rows={3}
                className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-lg"
              />
            </div>
            <button
              onClick={() => replyingTo ? postComment(replyingTo.comment_id) : postComment()}
              disabled={!newComment.trim() && !replyText.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 self-end shadow-lg"
            >
              <Send size={18} />
              {replyingTo ? 'Reply' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
