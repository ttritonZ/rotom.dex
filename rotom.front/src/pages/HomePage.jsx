import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function HomePage() {
  const { user } = useUser();

  const quickActions = [
    {
      title: "Browse Pokédex",
      description: "Explore all Pokémon with detailed stats",
      icon: "🔴",
      link: "/pokedex",
      color: "from-red-400 to-red-600"
    },
    {
      title: "Meet Characters",
      description: "Discover trainers, champions & rivals",
      icon: "👥",
      link: "/characters",
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Find Items",
      description: "Battle items, healing gear & treasures",
      icon: "🎒",
      link: "/items",
      color: "from-green-400 to-green-600"
    },
    {
      title: "Join Battles",
      description: "Fight other trainers in epic battles",
      icon: "⚔️",
      link: "/battles",
      color: "from-purple-400 to-purple-600"
    },
    {
      title: "Visit Forums",
      description: "Connect with the community",
      icon: "💬",
      link: "/forums",
      color: "from-orange-400 to-orange-600"
    },
    {
      title: "Shop Items",
      description: "Buy powerful items & equipment",
      icon: "🛒",
      link: "/shop",
      color: "from-pink-400 to-pink-600"
    }
  ];

  const features = [
    {
      title: "Comprehensive Database",
      description: "Access detailed information about Pokémon, characters, and items from all regions.",
      icon: "📊"
    },
    {
      title: "Battle System",
      description: "Engage in strategic battles with other trainers using your favorite Pokémon.",
      icon: "⚔️"
    },
    {
      title: "Community Forums",
      description: "Connect with fellow trainers, share strategies, and discuss your favorite Pokémon.",
      icon: "💬"
    },
    {
      title: "Item Management",
      description: "Discover and manage powerful items to enhance your Pokémon's abilities.",
      icon: "🎒"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 pt-20">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          Welcome to <span className="text-green-600">rotom.dex</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your ultimate Pokémon encyclopedia. Discover, battle, and connect with the Pokémon world.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          {!user ? (
            <>
              <Link 
                to="/login" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
              <Link 
                to="/register" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Account
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/profile" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                My Profile
              </Link>
              <Link 
                to="/battles" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Battle
              </Link>
            </>
          )}
        </div>
      </div>

             {/* Quick Actions Section */}
       <div className="max-w-7xl mx-auto px-6 py-20">
         <div className="text-center mb-16">
           <h2 className="text-4xl font-bold text-gray-800 mb-4">Quick Actions</h2>
           <p className="text-xl text-gray-600 max-w-2xl mx-auto">Jump right into what you're looking for with our intuitive navigation</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {quickActions.map((action) => (
             <Link
               key={action.title}
               to={action.link}
               className="group relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200 overflow-hidden"
             >
               {/* Background gradient effect */}
               <div className={`absolute inset-0 bg-gradient-to-br ${action.color.replace('400', '50').replace('600', '100')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
               
               <div className="relative z-10">
                 <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                   <span className="text-2xl group-hover:animate-bounce">{action.icon}</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-gray-900 transition-colors duration-300">{action.title}</h3>
                 <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{action.description}</p>
                 
                 {/* Arrow indicator */}
                 <div className="mt-6 flex items-center text-sm font-semibold text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                   <span>Explore</span>
                   <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                 </div>
               </div>
             </Link>
           ))}
         </div>
       </div>

      {/* Features Section */}
      <div className="bg-white/50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose rotom.dex?</h2>
            <p className="text-gray-600">Everything you need for your Pokémon journey in one place</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of trainers exploring the Pokémon world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              to="/pokedex" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Explore Pokédex
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
