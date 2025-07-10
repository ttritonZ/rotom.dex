import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return setUser(null);
      const res = await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    await axios.post("http://localhost:5000/api/auth/logout", {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
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
