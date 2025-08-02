import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

const TradeList = ({ trades, currentUserId, onUpdate }) => {
    const getStatusBadge = (trade) => {
        const baseStyles = 'px-2 py-1 rounded-full text-xs font-medium';
        
        switch(trade.status) {
            case 'accepted':
                return (
                    <span className={`${baseStyles} bg-green-100 text-green-800 flex items-center`}>
                        <Check className="w-3 h-3 mr-1" /> Completed
                    </span>
                );
            case 'rejected':
                return (
                    <span className={`${baseStyles} bg-red-100 text-red-800 flex items-center`}>
                        <X className="w-3 h-3 mr-1" /> Rejected
                    </span>
                );
            case 'cancelled':
                return (
                    <span className={`${baseStyles} bg-gray-100 text-gray-800 flex items-center`}>
                        <X className="w-3 h-3 mr-1" /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className={`${baseStyles} bg-yellow-100 text-yellow-800 flex items-center`}>
                        <Clock className="w-3 h-3 mr-1" /> Pending
                    </span>
                );
        }
    };

    const getUserRole = (trade) => {
        if (trade.user1_id === currentUserId) return 'You';
        if (trade.user2_id === currentUserId) return 'You';
        return null;
    };

    const getOtherUser = (trade) => {
        if (trade.user1_id === currentUserId) return trade.user2_username;
        if (trade.user2_id === currentUserId) return trade.user1_username;
        return null;
    };

    const getActionButtons = (trade) => {
        if (trade.status !== 'pending') return null;
        
        if (trade.user2_id === currentUserId) {
            return (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleTradeAction(trade.trade_id, 'accept')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleTradeAction(trade.trade_id, 'reject')}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Reject
                    </button>
                </div>
            );
        } else if (trade.user1_id === currentUserId) {
            return (
                <button
                    onClick={() => handleTradeAction(trade.trade_id, 'cancel')}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Cancel
                </button>
            );
        }
        return null;
    };

    const handleTradeAction = async (tradeId, action) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/trades/${tradeId}/${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error(`Failed to ${action} trade`);
            
            onUpdate();
        } catch (error) {
            console.error(`Error ${action}ing trade:`, error);
            // Handle error (show toast/notification)
        }
    };

    return (
        <div className="space-y-4">
            {trades.map((trade) => (
                <div key={trade.trade_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-medium">
                                    {trade.user1_id === currentUserId ? 'Your' : trade.user1_username}'s 
                                    trade with 
                                    {trade.user2_id === currentUserId ? 'You' : trade.user2_username}
                                </h3>
                                {getStatusBadge(trade)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                            </p>
                        </div>
                        {getActionButtons(trade)}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded p-3">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">
                                {trade.user1_id === currentUserId ? 'Your Offer' : `${trade.user1_username}'s Offer`}
                            </h4>
                            <div className="space-y-2">
                                {trade.offers
                                    ?.filter(offer => offer.user_id === trade.user1_id)
                                    .map(offer => (
                                        <div key={offer.offer_id} className="flex items-center space-x-2">
                                            <img 
                                                src={`/pokemon/${offer.sp_id}.png`} 
                                                alt={offer.pokemon_name}
                                                className="w-10 h-10 object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/pokemon/0.png';
                                                }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {offer.nickname || offer.pokemon_name}
                                                </p>
                                                <div className="flex space-x-1">
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                                        Lv. {offer.level}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        
                        <div className="border rounded p-3">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">
                                {trade.user2_id === currentUserId ? 'Your Offer' : `${trade.user2_username}'s Offer`}
                            </h4>
                            <div className="space-y-2">
                                {trade.offers
                                    ?.filter(offer => offer.user_id === trade.user2_id)
                                    .map(offer => (
                                        <div key={offer.offer_id} className="flex items-center space-x-2">
                                            <img 
                                                src={`/pokemon/${offer.sp_id}.png`} 
                                                alt={offer.pokemon_name}
                                                className="w-10 h-10 object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/pokemon/0.png';
                                                }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {offer.nickname || offer.pokemon_name}
                                                </p>
                                                <div className="flex space-x-1">
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                                        Lv. {offer.level}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TradeList;
