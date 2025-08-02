import pool from '../db.js';

export const createTrade = async (req, res) => {
    const { recipientId, pokemonIds } = req.body;
    const userId = req.user.user_id;

    if (!recipientId || !pokemonIds?.length) {
        return res.status(400).json({ 
            success: false, 
            error: 'Recipient ID and at least one Pokémon ID are required' 
        });
    }

    if (recipientId === userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Cannot trade with yourself' 
        });
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Create the trade
        const tradeResult = await client.query(
            `INSERT INTO public.Trades (user1_id, user2_id)
             VALUES ($1, $2)
             RETURNING *`,
            [userId, recipientId]
        );

        const trade = tradeResult.rows[0];

        // Add trade offers
        for (const pokemonId of pokemonIds) {
            await client.query(
                `INSERT INTO public.Trade_Offers (trade_id, user_id, pokemon_id)
                 VALUES ($1, $2, $3)`,
                [trade.trade_id, userId, pokemonId]
            );
        }

        await client.query('COMMIT');
        
        res.status(201).json({ 
            success: true, 
            trade 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating trade:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create trade',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

export const getTradeDetails = async (req, res) => {
    const { tradeId } = req.params;
    const userId = req.user.user_id;

    try {
        const tradeResult = await pool.query(
            `SELECT t.*, 
                    u1.username as user1_username,
                    u2.username as user2_username
             FROM public.Trades t
             JOIN public."User" u1 ON t.user1_id = u1.user_id
             JOIN public."User" u2 ON t.user2_id = u2.user_id
             WHERE t.trade_id = $1 
             AND (t.user1_id = $2 OR t.user2_id = $2)`,
            [tradeId, userId]
        );

        if (tradeResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Trade not found or access denied' 
            });
        }

        const trade = tradeResult.rows[0];
        const offers = await pool.query(
            `SELECT o.*, p.pokemon_name, p.type_1, p.type_2, up.nickname, up.level
             FROM public.Trade_Offers o
             JOIN public.User_Pokemons up ON o.pokemon_id = up.user_pokemon_id
             JOIN public.Pokemon p ON up.sp_id = p.sp_id
             WHERE o.trade_id = $1`,
            [tradeId]
        );

        res.json({ 
            success: true, 
            trade: {
                ...trade,
                offers: offers.rows
            }
        });

    } catch (error) {
        console.error('Error getting trade details:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get trade details' 
        });
    }
};

// Add other trade-related functions (accept, reject, cancel, history) here
