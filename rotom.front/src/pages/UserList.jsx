import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../hooks/useUser";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const { user } = useUser();

  const fetchUsers = async () => {
    const res = await axios.get(`${API_URL}/api/admin/users`);
    setUsers(Array.isArray(res.data) ? res.data : []);
  };

  const promote = async (userId) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/promote`);
      fetchUsers();
    } catch (err) {
      alert("Failed to promote user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User List</h2>
      <table className="table-auto w-full border bg-white">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Admin</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td className="border p-2">{u.user_id}</td>
              <td className="border p-2">{u.username}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.is_admin ? "Yes" : "No"}</td>
              <td className="border p-2">
                {!u.is_admin && u.user_id !== user.user_id && (
                  <button
                    onClick={() => promote(u.user_id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Promote to Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
