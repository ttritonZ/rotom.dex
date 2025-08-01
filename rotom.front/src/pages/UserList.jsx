import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../hooks/useUser";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const { user } = useUser();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      alert('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (userId) => {
    try {
      setIsSubmitting(true);
      await axios.patch(`${API_URL}/api/admin/users/${userId}/toggle-admin`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      alert('User admin status updated successfully');
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user admin status:', err);
      alert('Failed to update user admin status');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600">Manage user accounts and admin privileges</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr key={userItem.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.user_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userItem.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userItem.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userItem.is_admin 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userItem.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {userItem.user_id !== user?.user_id && (
                      <button
                        onClick={() => setShowConfirm(userItem)}
                        disabled={isSubmitting}
                        className={`px-3 py-1 rounded-md text-xs transition-colors ${
                          userItem.is_admin
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        } disabled:opacity-50`}
                      >
                        {isSubmitting && showConfirm?.user_id === userItem.user_id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Updating...
                          </div>
                        ) : (
                          userItem.is_admin ? 'Remove Admin' : 'Make Admin'
                        )}
                      </button>
                    )}
                    {userItem.user_id === user?.user_id && (
                      <span className="text-gray-400 text-xs">Current User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {showConfirm.is_admin ? 'remove admin privileges from' : 'grant admin privileges to'} <strong>{showConfirm.username}</strong>?
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => toggleAdminStatus(showConfirm.user_id)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showConfirm.is_admin
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
              >
                {isSubmitting ? 'Updating...' : 'Confirm'}
              </button>
              <button 
                onClick={() => setShowConfirm(null)}
                disabled={isSubmitting}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.is_admin).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Regular Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => !u.is_admin).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
