-- Create Trades table
CREATE TABLE IF NOT EXISTS public.Trades (
    trade_id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES public."User"(user_id) NOT NULL,
    user2_id INTEGER REFERENCES public."User"(user_id) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_by INTEGER REFERENCES public."User"(user_id),
    cancellation_reason TEXT,
    CHECK (user1_id != user2_id)
);

-- Create Trade_Offers table
CREATE TABLE IF NOT EXISTS public.Trade_Offers (
    offer_id SERIAL PRIMARY KEY,
    trade_id INTEGER REFERENCES public.Trades(trade_id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES public."User"(user_id) NOT NULL,
    pokemon_id INTEGER REFERENCES public.User_Pokemons(user_pokemon_id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trade_id, pokemon_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user1_id ON public.Trades(user1_id);
CREATE INDEX IF NOT EXISTS idx_trades_user2_id ON public.Trades(user2_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.Trades(status);
CREATE INDEX IF NOT EXISTS idx_trade_offers_trade_id ON public.Trade_Offers(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_user_id ON public.Trade_Offers(user_id);

-- Add comments
COMMENT ON TABLE public.Trades IS 'Stores trade information between two users';
COMMENT ON COLUMN public.Trades.status IS 'pending, accepted, rejected, cancelled, completed';
COMMENT ON TABLE public.Trade_Offers IS 'Stores which Pokémon are being offered in each trade';
