import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Pokemon Database</h1>
      <p className="text-xl text-gray-600 mb-8">
        Explore the world of Pokemon with our comprehensive database
      </p>
      
      {user ? (
        <div>
          <p className="mb-4">Welcome back, {user.email}!</p>
          <Link
            to="/pokedex"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 inline-block"
          >
            Explore Pokedex
          </Link>
        </div>
      ) : (
        <div className="space-x-4">
          <Link
            to="/register"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 inline-block"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 inline-block"
          >
            Login
          </Link>
        </div>
      )}
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Comprehensive Database</h3>
          <p className="text-gray-600">
            Access detailed information about Pokemon from all generations
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Advanced Search</h3>
          <p className="text-gray-600">
            Filter Pokemon by type, stats, abilities, and more
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Detailed Information</h3>
          <p className="text-gray-600">
            View stats, moves, evolutions, and complete Pokemon data
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
