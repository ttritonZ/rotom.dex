import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../hooks/useUser';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/auth/profile/${userId}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-700 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-2">Error loading profile</h3>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-2xl font-semibold text-slate-700 mb-2">Profile not found</h3>
          <p className="text-slate-500">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 px-6 pb-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Profile
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage your account and view your Pokémon journey statistics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200">
              {/* Profile Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-2 shadow-lg">
                    {profile.profile_image ? (
                      <img 
                        src={`/uploads/profiles/${profile.profile_image}`} 
                        alt={profile.username} 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/common/loading.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                        <span className="text-4xl">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-xl"></div>
                </div>
              </div>

              {/* Username */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{profile.username}</h2>
                <div className="inline-flex items-center space-x-2 bg-indigo-100 px-4 py-2 rounded-full">
                  <span className="text-indigo-600">⭐</span>
                  <span className="text-indigo-700 font-medium">Trainer</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-sm text-slate-600">Balance</p>
                        <p className="text-lg font-bold text-emerald-700">{formatMoney(profile.money_amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-sm text-slate-600">Member Since</p>
                        <p className="text-lg font-bold text-blue-700">{formatDate(profile.reg_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="mr-3">📋</span>
                Account Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                    <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                      <p className="text-slate-800 font-medium">
                        {profile.first_name} {profile.last_name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                    <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                      <p className="text-slate-800 font-medium">{profile.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Country</label>
                    <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                      <p className="text-slate-800 font-medium">{profile.country || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Account Status</label>
                    <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <p className="text-emerald-700 font-medium">Active</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Account Type</label>
                    <div className="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-200">
                      <p className="text-indigo-700 font-medium">
                        {user?.is_admin ? 'Administrator' : 'Standard User'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Registration Date</label>
                    <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                      <p className="text-slate-800 font-medium">{formatDate(profile.reg_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex justify-center">
                  <button 
                    onClick={() => navigate('/edit-profile')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <span>✏️</span>
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Section */}
        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="mr-3">📊</span>
              Journey Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="text-lg font-semibold text-blue-700 mb-1">Pokémon Caught</h4>
                <p className="text-2xl font-bold text-blue-800">0</p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 text-center">
                <div className="text-3xl mb-2">⚔️</div>
                <h4 className="text-lg font-semibold text-emerald-700 mb-1">Battles Won</h4>
                <p className="text-2xl font-bold text-emerald-800">0</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h4 className="text-lg font-semibold text-purple-700 mb-1">Achievements</h4>
                <p className="text-2xl font-bold text-purple-800">0</p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <h4 className="text-lg font-semibold text-amber-700 mb-1">Level</h4>
                <p className="text-2xl font-bold text-amber-800">1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
