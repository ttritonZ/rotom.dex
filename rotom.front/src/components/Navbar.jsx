
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useState, useEffect } from "react";

export default function NavBar() {
  const { user, logout } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // State for navbar (keeping for compatibility)
  const [isNavbarMinimized, setIsNavbarMinimized] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get navbar colors based on current page
  const getNavbarColors = () => {
    const path = location.pathname;
    
    // Green theme (Home, Pokedex, Characters, Admin)
    if (path === '/' || path === '/pokedex' || path.startsWith('/characters') || path === '/admin') {
      return {
        minimized: 'from-emerald-300/95 to-green-400/95',
        scrolled: 'from-emerald-300/95 to-green-400/95',
        default: 'from-emerald-200/90 to-green-300/90',
        border: 'border-emerald-300/60',
        borderLight: 'border-emerald-300/40',
        glow: 'from-emerald-400 to-green-500'
      };
    }
    
    // Blue/Indigo theme (Shop, Pokemon Detail, My Pokemon, Items, Profile)
    if (path === '/shop' || path.startsWith('/pokemon/') || path.startsWith('/my-pokemon') || 
        path === '/items' || path.startsWith('/profile') || path === '/edit-profile') {
      return {
        minimized: 'from-blue-300/95 to-indigo-400/95',
        scrolled: 'from-blue-300/95 to-indigo-400/95',
        default: 'from-blue-200/90 to-indigo-300/90',
        border: 'border-blue-300/60',
        borderLight: 'border-blue-300/40',
        glow: 'from-blue-400 to-indigo-500'
      };
    }
    
    // Purple/Indigo theme (Forums, Forum Detail)
    if (path.startsWith('/forums')) {
      return {
        minimized: 'from-indigo-300/95 to-purple-400/95',
        scrolled: 'from-indigo-300/95 to-purple-400/95',
        default: 'from-indigo-200/90 to-purple-300/90',
        border: 'border-indigo-300/60',
        borderLight: 'border-indigo-300/40',
        glow: 'from-indigo-400 to-purple-500'
      };
    }
    
    // Dark theme (Battles page)
    if (path === '/battles') {
      return {
        minimized: 'from-slate-700/95 to-purple-800/95',
        scrolled: 'from-slate-700/95 to-purple-800/95',
        default: 'from-slate-600/90 to-purple-700/90',
        border: 'border-slate-600/60',
        borderLight: 'border-slate-600/40',
        glow: 'from-slate-500 to-purple-600'
      };
    }
    
    // Blue/Purple theme (Battle Arena, Recent Battles)
    if (path === '/battle-arena' || path === '/recent-battles') {
      return {
        minimized: 'from-sky-300/95 to-purple-400/95',
        scrolled: 'from-sky-300/95 to-purple-400/95',
        default: 'from-sky-200/90 to-purple-300/90',
        border: 'border-sky-300/60',
        borderLight: 'border-sky-300/40',
        glow: 'from-sky-400 to-purple-500'
      };
    }
    
    // Orange/Yellow theme (Battle Arena loading)
    if (path === '/battle-arena' && location.search.includes('loading')) {
      return {
        minimized: 'from-orange-300/95 to-yellow-400/95',
        scrolled: 'from-orange-300/95 to-yellow-400/95',
        default: 'from-orange-200/90 to-yellow-300/90',
        border: 'border-orange-300/60',
        borderLight: 'border-orange-300/40',
        glow: 'from-orange-400 to-yellow-500'
      };
    }
    
    // Default blue theme for login/register
    return {
      minimized: 'from-slate-300/95 to-blue-400/95',
      scrolled: 'from-slate-300/95 to-blue-400/95',
      default: 'from-slate-200/90 to-blue-300/90',
      border: 'border-slate-300/60',
      borderLight: 'border-slate-300/40',
      glow: 'from-slate-400 to-blue-500'
    };
  };

  const navbarColors = getNavbarColors();

  // Handle scroll effect for navbar (only for scrolled state, no minimization)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Keep navbar always expanded
  useEffect(() => {
    setIsNavbarMinimized(false);
  }, [location.pathname]);

  // Close mobile menu and profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isProfileDropdownOpen]);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/pokedex", label: "Pokédex", icon: "📖" },
    { path: "/characters", label: "Characters", icon: "👥" },
    { path: "/items", label: "Items", icon: "🎒" },
  ];

  const userNavItems = user ? [
    { path: "/forums", label: "Forums", icon: "💬" },
    { path: "/battles", label: "Battles", icon: "⚔️" },
    { path: "/shop", label: "Shop", icon: "🛒" },
    { path: "/my-pokemon", label: "My Pokémon", icon: "🎯" },
  ] : [];

  const userMenuItems = user ? [
  ] : [];

  // Get navigate function from react-router
  const navigate = useNavigate();
  
  // Logout handler
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout(navigate);
      // The logout function will handle the navigation
    }
  };

  // Handle navigation with loading state
  const handleNavigation = (path) => {
    setIsNavigating(true);
    setIsMobileMenuOpen(false);
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  };

  return (
    <nav className={`fixed top-0 z-50 transition-all duration-500 ease-out transform ${
      isNavbarMinimized 
        ? `left-0 w-12 h-12 rounded-r-full bg-gradient-to-r ${navbarColors.minimized} backdrop-blur-xl border ${navbarColors.border} shadow-2xl m-0` 
        : `left-0 right-0 bg-gradient-to-r ${navbarColors.scrolled} backdrop-blur-xl border-b ${navbarColors.border} shadow-2xl`
    } ${
      scrolled 
        ? `bg-gradient-to-r ${navbarColors.scrolled} backdrop-blur-xl border-b ${navbarColors.border} shadow-2xl` 
        : `bg-gradient-to-r ${navbarColors.default} backdrop-blur-md border-b ${navbarColors.borderLight} shadow-lg`
    }`}>
      <div className={`transition-all duration-500 ease-out ${
        isNavbarMinimized 
          ? 'w-full h-full flex items-center justify-center' 
          : 'max-w-7xl mx-auto px-0 pr-6 w-full relative'
      }`}>
        <div className={`flex items-center justify-between min-w-0 ${
          isNavbarMinimized ? 'h-full' : 'h-16 lg:h-20'
        }`}>
          {/* Logo and Brand */}
          <div className={`flex items-center space-x-2 flex-shrink-0 ${
            isNavbarMinimized ? 'justify-center' : 'pl-2 pr-8'
          }`}>
            {isNavbarMinimized ? (
              <button
                onClick={() => setIsNavbarMinimized(false)}
                className="group flex items-center justify-center w-full h-full transition-all duration-300 transform hover:scale-110 cursor-pointer"
              >
                <div className="relative">
                  <span className="text-2xl lg:text-3xl drop-shadow-lg logo-animate">▶</span>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${navbarColors.glow} rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
                </div>
              </button>
            ) : (
              <Link 
                to="/" 
                className="group flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative">
                  <img 
                    src="/src/assets/pokemons/0479_NULL.png" 
                    alt="Rotom" 
                    className="w-8 h-8 lg:w-10 lg:h-10 object-contain drop-shadow-lg logo-animate"
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                </div>
                <div className="flex flex-col">
                                  <span className="text-white font-black text-sm lg:text-base tracking-tight">
                  rotom.dex
                </span>
                <span className="text-xs text-green-100 font-medium">Pokémon Database</span>
                </div>
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden lg:flex items-center space-x-2 min-w-0 flex-1 justify-center mx-8 ${
            isNavbarMinimized ? 'opacity-0 pointer-events-none' : ''
          }`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-sm lg:text-base ${
                  isActive(item.path)
                    ? "bg-white/90 text-emerald-700 shadow-lg border border-white/50"
                    : "hover:bg-white/20 hover:text-white text-green-100 hover:shadow-md"
                }`}
              >
                <span className="text-lg group-hover:animate-bounce">{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                )}
              </Link>
            ))}

            {userNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-sm lg:text-base ${
                  isActive(item.path)
                    ? "bg-white/90 text-emerald-700 shadow-lg border border-white/50"
                    : "hover:bg-white/20 hover:text-white text-green-100 hover:shadow-md"
                }`}
              >
                <span className="text-lg group-hover:animate-bounce">{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className={`hidden lg:flex items-center space-x-2 min-w-0 flex-shrink-0 relative ml-auto ${
            isNavbarMinimized ? 'opacity-0 pointer-events-none' : ''
          }`}>
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group relative flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                        isActive(item.path)
                          ? "bg-white/90 text-emerald-700 shadow-md border border-white/50"
                          : "hover:bg-white/20 hover:text-white text-green-100"
                      }`}
                    >
                      <span className="group-hover:animate-pulse">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center space-x-2 profile-dropdown">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="group flex items-center space-x-2 lg:space-x-3 bg-white/90 backdrop-blur-sm hover:bg-white/95 px-3 lg:px-4 py-2 rounded-2xl border border-white/50 shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative">
                      <span className="text-emerald-600 text-lg lg:text-xl">👤</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white status-indicator"></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-emerald-700 text-xs lg:text-sm truncate">{user.username}</span>
                      <span className="text-xs text-emerald-600">Online</span>
                    </div>
                    <div className="ml-2">
                      <svg className={`w-4 h-4 text-emerald-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <div className={`absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl transition-all duration-300 transform origin-top-right ${
                    isProfileDropdownOpen 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors duration-200"
                      >
                        <span className="text-lg">👤</span>
                        <span>My Profile</span>
                      </Link>
                      
                      {user.is_admin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors duration-200"
                        >
                          <span className="text-lg">⚙️</span>
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      
                      <div className="border-t border-slate-200/60 my-1"></div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors duration-200 w-full text-left"
                      >
                        <span className="text-lg">🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="group flex items-center space-x-1 bg-white/90 backdrop-blur-sm hover:bg-white/95 px-2 lg:px-3 py-2 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-white/50 shadow-lg text-emerald-700 text-xs lg:text-sm"
                >
                  <span className="group-hover:animate-pulse">🔑</span>
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="group flex items-center space-x-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 px-2 lg:px-3 py-2 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg text-white text-xs lg:text-sm"
                >
                  <span className="group-hover:animate-bounce">📝</span>
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className={`lg:hidden mobile-menu ${
            isNavbarMinimized ? 'opacity-0 pointer-events-none' : ''
          }`}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="group flex items-center space-x-2 bg-gradient-to-r from-slate-100/80 to-slate-200/80 backdrop-blur-sm hover:from-slate-200 hover:to-slate-300 px-4 py-2 rounded-2xl transition-all duration-300 border border-slate-300/50 shadow-lg"
            >
              <div className="flex flex-col space-y-1">
                <span className={`block w-6 h-0.5 bg-slate-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-slate-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-slate-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden mobile-menu transition-all duration-500 ease-in-out overflow-hidden ${
          isNavbarMinimized ? 'hidden' : ''
        } ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/50 rounded-b-3xl shadow-2xl mt-2">
            <div className="px-6 py-8 space-y-6">
              {/* Main Navigation */}
              <div className="space-y-3">
                <h3 className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-4 flex items-center">
                  <span className="mr-2">🧭</span>
                  Navigation
                </h3>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center space-x-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-indigo-700 border border-indigo-200/50 shadow-lg"
                        : "hover:bg-white/60 hover:text-slate-800 text-slate-600"
                    }`}
                  >
                    <span className="text-xl group-hover:animate-bounce">{item.icon}</span>
                    <span className="text-lg">{item.label}</span>
                    {isActive(item.path) && (
                      <div className="ml-auto w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    )}
                  </Link>
                ))}
              </div>

              {/* User Navigation */}
              {userNavItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-4 flex items-center">
                    <span className="mr-2">⚡</span>
                    User Features
                  </h3>
                  {userNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center space-x-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-indigo-700 border border-indigo-200/50 shadow-lg"
                          : "hover:bg-white/60 hover:text-slate-800 text-slate-600"
                      }`}
                    >
                      <span className="text-xl group-hover:animate-bounce">{item.icon}</span>
                      <span className="text-lg">{item.label}</span>
                      {isActive(item.path) && (
                        <div className="ml-auto w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* User Menu */}
              {user ? (
                <div className="space-y-3">
                  <h3 className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-4 flex items-center">
                    <span className="mr-2">👤</span>
                    Account
                  </h3>
                  {/* Profile button removed - now accessible via dropdown */}

                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-center space-x-4 px-5 py-4 bg-gradient-to-r from-slate-100/80 to-slate-200/80 backdrop-blur-sm hover:from-slate-200 hover:to-slate-300 rounded-2xl border border-slate-300/50 shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative">
                      <span className="text-indigo-600 text-2xl">👤</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white status-indicator"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-lg">{user.username}</span>
                      <span className="text-sm text-slate-500">Online</span>
                    </div>
                  </Link>

                  {user.is_admin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center space-x-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 px-5 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 text-white"
                    >
                      <span className="text-xl group-hover:animate-spin">⚙️</span>
                      <span className="text-lg">Admin Tools</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="group flex items-center space-x-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 w-full text-white text-lg"
                  >
                    <span className="text-xl group-hover:animate-bounce">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-4 flex items-center">
                    <span className="mr-2">🔐</span>
                    Account
                  </h3>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-center space-x-4 bg-gradient-to-r from-slate-100/80 to-slate-200/80 backdrop-blur-sm hover:from-slate-200 hover:to-slate-300 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border border-slate-300/50 shadow-lg text-slate-700"
                  >
                    <span className="text-xl group-hover:animate-pulse">🔑</span>
                    <span className="text-lg">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-center space-x-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 text-white"
                  >
                    <span className="text-xl group-hover:animate-bounce">📝</span>
                    <span className="text-lg">Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
