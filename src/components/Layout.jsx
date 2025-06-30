import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout({ children }) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-pink-50">
      <nav className="bg-white/80 backdrop-blur shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-8">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-blue-700 drop-shadow">
            <span className="inline-block align-middle mr-2">🔎</span> Pokédex
          </Link>
          <div className="flex space-x-4 items-center">
            {user ? (
              <>
                <Link to="/pokedex" className="hover:text-blue-600 font-semibold transition-colors">Pokedex</Link>
                <span className="text-blue-400 font-medium">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-blue-700 transition-colors shadow"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-600 font-semibold transition-colors">Login</Link>
                <Link to="/register" className="hover:text-blue-600 font-semibold transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-10 px-4 md:px-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;
