import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(undefined); // Start with undefined to indicate loading

  const fetchUser = async () => {
    console.log('UserContext: fetchUser called');
    try {
      const token = localStorage.getItem('token');
      console.log('UserContext: token found:', !!token);
      if (!token) {
        console.log('UserContext: no token, setting user to null');
        return setUser(null);
      }
      
      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/auth/me`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      console.log('UserContext: API response:', res.data);
      setUser(res.data);
    } catch (error) {
      console.error('UserContext: Error fetching user:', error);
      // Fallback to localStorage data if API fails
      const storedUserId = localStorage.getItem('user_id');
      const storedUsername = localStorage.getItem('username');
      const storedIsAdmin = localStorage.getItem('isAdmin');
      console.log('UserContext: Fallback data:', { storedUserId, storedUsername, storedIsAdmin });
      if (storedUserId && storedUsername) {
        const fallbackUser = {
          user_id: parseInt(storedUserId),
          username: storedUsername,
          is_admin: storedIsAdmin === 'true'
        };
        console.log('UserContext: Using fallback user:', fallbackUser);
        setUser(fallbackUser);
      } else {
        console.log('UserContext: No fallback data, setting user to null');
        setUser(null);
        localStorage.removeItem('token');
      }
    }
  };

  const logout = async (navigate) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        try {
          await axios.post(`${API_URL}/api/auth/logout`, {}, { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000 // 5 second timeout
          });
        } catch (error) {
          // Even if the logout API call fails, we still want to clear local state
          console.error('Logout API error (continuing with local logout):', error);
        }
      }
      
      // Clear all auth-related data
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('user_id');
      localStorage.removeItem('isAdmin');
      
      // If navigate function was provided, redirect to login
      if (navigate && typeof navigate === 'function') {
        navigate('/login');
      }
      
      // Force a hard refresh to ensure all components reset
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      // Even in case of error, try to clear local state
      setUser(null);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}
