import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../hooks/useUser"; // assumes you have user context

export default function AdminDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.is_admin) {
      navigate("/");
    }
  }, [user]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-3">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <Link to="/admin/add-pokemon" className="hover:bg-gray-700 px-3 py-2 rounded">Add Pokémon</Link>
        <Link to="/admin/add-character" className="hover:bg-gray-700 px-3 py-2 rounded">Add Character</Link>
        <Link to="/admin/add-item" className="hover:bg-gray-700 px-3 py-2 rounded">Add Item</Link>

        <hr className="border-gray-700 my-2" />

        <Link to="/admin/manage-pokemon" className="hover:bg-gray-700 px-3 py-2 rounded">Manage Pokémon</Link>
        <Link to="/admin/manage-character" className="hover:bg-gray-700 px-3 py-2 rounded">Manage Character</Link>
        <Link to="/admin/manage-item" className="hover:bg-gray-700 px-3 py-2 rounded">Manage Item</Link>

        <hr className="border-gray-700 my-2" />

        <Link to="/admin/users" className="hover:bg-gray-700 px-3 py-2 rounded">User List</Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
