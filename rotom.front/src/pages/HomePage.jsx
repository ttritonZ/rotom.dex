import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto text-center py-20">
        <h1 className="text-5xl font-bold text-gray-800 mb-4 drop-shadow">Welcome to rotom.dex</h1>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Your all-in-one Pokémon encyclopedia. Discover Pokémon, characters, items, and more!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/pokedex" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-red-500">Pokedex</h2>
            <p className="text-gray-500 mt-2">Browse all known Pokémon and their stats.</p>
          </Link>

          <Link to="/characters" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-blue-500">Characters</h2>
            <p className="text-gray-500 mt-2">Explore trainers, rivals, and champions.</p>
          </Link>

          <Link to="/items" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-green-500">Items</h2>
            <p className="text-gray-500 mt-2">Discover battle items, healing gear, and more.</p>
          </Link>
        </div>

        <div className="flex justify-center space-x-6">
          {!user ? (
            <>
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow">Login</Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/forums" className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg shadow">Forums</Link>
              <Link to="/profile" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg shadow">My Profile</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
