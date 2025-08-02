import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import TradeList from '../components/trading/TradeList';
import TradeModal from '../components/trading/TradeModal';
import { PlusCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const TradingCenter = () => {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('pending');
    const [trades, setTrades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrades(activeTab);
    }, [activeTab]);

    const fetchTrades = async (status = 'pending') => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/trades?status=${status}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch trades');
            const data = await response.json();
            setTrades(data.trades || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching trades:', err);
            setError('Failed to load trades. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTrade = (newTrade) => {
        setTrades(prev => [newTrade, ...prev]);
        setShowTradeModal(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Trading Center</h1>
                <button
                    onClick={() => setShowTradeModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    New Trade
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                        {['pending', 'accepted', 'rejected', 'cancelled'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} Trades
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-600 text-center py-8">{error}</div>
                    ) : trades.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No {activeTab} trades found
                        </div>
                    ) : (
                        <TradeList 
                            trades={trades} 
                            currentUserId={user?.user_id} 
                            onUpdate={fetchTrades}
                        />
                    )}
                </div>
            </div>

            {showTradeModal && (
                <TradeModal 
                    onClose={() => setShowTradeModal(false)}
                    onCreate={handleCreateTrade}
                    currentUserId={user?.user_id}
                />
            )}
        </div>
    );
};

export default TradingCenter;
