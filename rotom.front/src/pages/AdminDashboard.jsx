import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";

export default function AdminDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Add Content",
      items: [
        { name: "Add Pokémon", path: "/admin/add-pokemon", icon: "🐾" },
        { name: "Add Character", path: "/admin/add-character", icon: "👤" },
        { name: "Add Item", path: "/admin/add-item", icon: "🎒" }
      ]
    },
    {
      title: "Manage Content",
      items: [
        { name: "Manage Pokémon", path: "/admin/manage-pokemon", icon: "📊" },
        { name: "Manage Characters", path: "/admin/manage-character", icon: "👥" },
        { name: "Manage Items", path: "/admin/manage-item", icon: "📦" }
      ]
    },
    {
      title: "User Management",
      items: [
        { name: "User List", path: "/admin/users", icon: "👤" }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Sidebar */}
      <aside className="w-80 bg-gradient-to-b from-green-600 to-emerald-700 text-white shadow-xl">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-green-100 text-sm">Pokémon Management</p>
            </div>
          </div>

          <nav className="space-y-6">
            {menuItems.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-green-200 text-sm font-semibold uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-green-100 hover:bg-green-500 hover:text-white transition-all duration-200 group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-green-500">
            <div className="px-4 py-3 bg-green-500 rounded-lg">
              <p className="text-sm font-medium">Welcome, {user?.username || 'Admin'}!</p>
              <p className="text-xs text-green-100">Administrator Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-lg p-6 min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
