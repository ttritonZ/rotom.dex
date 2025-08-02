import React, { useState, useEffect } from 'react';
import { X, Search, Plus, XCircle } from 'lucide-react';

const TradeModal = ({ onClose, onCreate, currentUserId }) => {
    const [step, setStep] = useState(1);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPokemon, setUserPokemon] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (step === 1) {
            // Fetch users when the component mounts or search query changes
            const searchUsers = async () => {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/users/search?q=${encodeURIComponent(searchQuery)}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    
                    if (!response.ok) throw new Error('Failed to fetch users');
                    
                    const data = await response.json();
                    // Filter out current user from results
                    setUsers(data.users.filter(user => user.user_id !== currentUserId));
                } catch (err) {
                    console.error('Error searching users:', err);
                    setError('Failed to search users');
                }
            };

            const debounceTimer = setTimeout(() => {
                if (searchQuery.trim().length > 0) {
                    searchUsers();
                } else {
                    setUsers([]);
                }
            }, 300);

            return () => clearTimeout(debounceTimer);
        }
    }, [searchQuery, step, currentUserId]);

    useEffect(() => {
        if (step === 2 && selectedUser) {
            // Fetch current user's Pokémon when moving to step 2
            const fetchUserPokemon = async () => {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/pokemon/user/${currentUserId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    
                    if (!response.ok) throw new Error('Failed to fetch your Pokémon');
                    
                    const data = await response.json();
                    setUserPokemon(data.pokemon || []);
                } catch (err) {
                    console.error('Error fetching user Pokémon:', err);
                    setError('Failed to load your Pokémon');
                }
            };

            fetchUserPokemon();
        }
    }, [step, selectedUser, currentUserId]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setStep(2);
    };

    const togglePokemonSelect = (pokemon) => {
        setSelectedPokemon(prev => {
            const isSelected = prev.some(p => p.user_pokemon_id === pokemon.user_pokemon_id);
            if (isSelected) {
                return prev.filter(p => p.user_pokemon_id !== pokemon.user_pokemon_id);
            } else {
                return [...prev, pokemon];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedPokemon.length === 0) {
            setError('Please select at least one Pokémon to trade');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/trades`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        recipientId: selectedUser.user_id,
                        pokemonIds: selectedPokemon.map(p => p.user_pokemon_id)
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create trade');
            }

            const data = await response.json();
            onCreate(data.trade);
            onClose();
        } catch (err) {
            console.error('Error creating trade:', err);
            setError(err.message || 'Failed to create trade');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepOne = () => (
        <div>
            <h3 className="text-lg font-medium mb-4">Select a Trainer to Trade With</h3>
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search trainers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="max-h-60 overflow-y-auto border rounded-md">
                {users.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <li key={user.user_id}>
                                <button
                                    onClick={() => handleUserSelect(user)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                                >
                                    <img 
                                        src={user.profile_image || '/default-avatar.png'} 
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full mr-3"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                    <span className="font-medium">{user.username}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : searchQuery ? (
                    <div className="p-4 text-center text-gray-500">
                        No trainers found
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        Search for a trainer to start trading
                    </div>
                )}
            </div>
        </div>
    );

    const renderStepTwo = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Select Pokémon to Trade</h3>
                <button
                    onClick={() => {
                        setStep(1);
                        setError('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Back to Search
                </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                    Trading with: <span className="font-medium">{selectedUser?.username}</span>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                    Select the Pokémon you want to offer in this trade.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="max-h-96 overflow-y-auto border rounded-md p-2">
                {userPokemon.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {userPokemon.map((pokemon) => {
                            const isSelected = selectedPokemon.some(p => p.user_pokemon_id === pokemon.user_pokemon_id);
                            return (
                                <div 
                                    key={pokemon.user_pokemon_id}
                                    onClick={() => togglePokemonSelect(pokemon)}
                                    className={`relative p-2 border rounded-md cursor-pointer transition-colors ${
                                        isSelected 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                    <img 
                                        src={`/pokemon/${pokemon.sp_id}.png`} 
                                        alt={pokemon.nickname || pokemon.pokemon_name}
                                        className="w-full h-16 object-contain mx-auto"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/pokemon/0.png';
                                        }}
                                    />
                                    <p className="text-xs font-medium text-center mt-1 truncate">
                                        {pokemon.nickname || pokemon.pokemon_name}
                                    </p>
                                    <div className="flex justify-center space-x-1 mt-1">
                                        <span className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-800">
                                            Lv. {pokemon.level}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        You don't have any Pokémon to trade.
                    </div>
                )}
            </div>

            {selectedPokemon.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Pokémon ({selectedPokemon.length})</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedPokemon.map(pokemon => (
                            <div 
                                key={pokemon.user_pokemon_id}
                                className="flex items-center bg-white px-2 py-1 rounded-full border border-gray-200 text-xs"
                            >
                                <span className="mr-1">{pokemon.nickname || pokemon.pokemon_name}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        togglePokemonSelect(pokemon);
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        selectedPokemon.length === 0 || isSubmitting
                            ? 'bg-blue-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={selectedPokemon.length === 0 || isSubmitting}
                >
                    {isSubmitting ? 'Sending Trade...' : 'Send Trade Request'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {step === 1 ? 'New Trade' : 'Select Pokémon'}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {step === 1 ? renderStepOne() : renderStepTwo()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradeModal;
