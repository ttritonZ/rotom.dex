import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 py-10 px-4 md:px-8">
      <h1 className="section-title mb-6 drop-shadow-lg">Welcome to Pokédex</h1>
      <p className="text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-light italic">
        Explore the world of Pokémon with our beautiful, comprehensive database.
      </p>
      {user ? (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-lg text-blue-600 font-semibold animate-fade-in">Welcome back, {user.email}!</p>
          <Link
            to="/pokedex"
            className="btn-primary text-xl font-bold shadow-lg animate-bounce"
          >
            Explore Pokédex
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Link
            to="/register"
            className="btn-primary text-xl font-bold shadow-lg animate-bounce"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 text-xl font-bold shadow transition-colors"
          >
            Login
          </Link>
        </div>
      )}
      <div className="divider"></div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl px-2 md:px-0">
        <div className="card bg-white p-10 rounded-2xl shadow-2xl text-center hover:scale-105 transition-transform border border-blue-100">
          <h3 className="text-2xl font-bold mb-3 text-blue-700">Comprehensive Database</h3>
          <p className="text-gray-600 text-lg">Access detailed information about Pokémon from all generations.</p>
        </div>
        <div className="card bg-white p-10 rounded-2xl shadow-2xl text-center hover:scale-105 transition-transform border border-blue-100">
          <h3 className="text-2xl font-bold mb-3 text-blue-700">Advanced Search</h3>
          <p className="text-gray-600 text-lg">Filter Pokémon by type, stats, abilities, and more.</p>
        </div>
        <div className="card bg-white p-10 rounded-2xl shadow-2xl text-center hover:scale-105 transition-transform border border-blue-100">
          <h3 className="text-2xl font-bold mb-3 text-blue-700">Detailed Information</h3>
          <p className="text-gray-600 text-lg">View stats, moves, evolutions, and complete Pokémon data.</p>
        </div>
      </div>
    </div>
  )
}

export default Home
