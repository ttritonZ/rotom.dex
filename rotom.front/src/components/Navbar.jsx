
import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function NavBar() {
  const { user, logout } = useUser();

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center shadow">
      <div className="flex space-x-4 items-center">
        <Link to="/" className="text-xl font-bold">rotom.dex</Link>
        <Link to="/pokedex" className="hover:text-yellow-400">Pokedex</Link>
        <Link to="/characters" className="hover:text-yellow-400">Characters</Link>
        <Link to="/items" className="hover:text-yellow-400">Items</Link>
        {user && (
          <>
            <Link to="/forums" className="hover:text-yellow-400">Forums</Link>
            <Link to="/battles" className="hover:text-yellow-400">Battles</Link>
          </>
        )}
      </div>

      <div className="flex space-x-4 items-center">
        {user ? (
          <>
            <Link to="/profile" className="hover:text-yellow-400">{user.username}</Link>
            {user.is_admin && <Link to="/admin" className="hover:text-red-400 font-bold">Admin Tools</Link>}
            <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-yellow-400">Login</Link>
            <Link to="/register" className="hover:text-yellow-400">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
