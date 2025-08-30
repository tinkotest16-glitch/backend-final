-- EdgeMarket Complete Database Schema - Fully Synced with App
-- This schema includes all necessary tables for crypto-only transactions, wallet management, and full functionality

-- Create users table with all required fields
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  total_balance DECIMAL(15,2) DEFAULT 0.00,
  trading_balance DECIMAL(15,2) DEFAULT 0.00,
  profit DECIMAL(15,2) DEFAULT 0.00,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES users(id),
  referral_earnings DECIMAL(15,2) DEFAULT 0.00,
  is_quick_trade_locked BOOLEAN DEFAULT FALSE,
  is_copy_trading_enabled BOOLEAN DEFAULT FALSE,
  copy_trading_master_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trading pairs table
CREATE TABLE IF NOT EXISTS trading_pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  base_price DECIMAL(15,8) NOT NULL,
  current_price DECIMAL(15,8) NOT NULL,
  spread DECIMAL(6,4) DEFAULT 0.0008,
  is_active BOOLEAN DEFAULT TRUE,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  volatility DECIMAL(8,6) DEFAULT 0.0001,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for crypto deposits/withdrawals
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL')),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'CRYPTO',
  wallet_address TEXT,
  tx_hash TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES users(id)
);

-- Create trades table  
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  pair_id UUID REFERENCES trading_pairs(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
  amount DECIMAL(15,2) NOT NULL,
  entry_price DECIMAL(15,8) NOT NULL,
  exit_price DECIMAL(15,8),
  take_profit DECIMAL(15,8),
  stop_loss DECIMAL(15,8),
  pnl DECIMAL(15,2) DEFAULT 0.00,
  is_profit BOOLEAN,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  duration INTEGER DEFAULT 60,
  is_copy_trade BOOLEAN DEFAULT FALSE,
  copy_trade_master_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create conversions table for balance conversions
CREATE TABLE IF NOT EXISTS conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  from_type TEXT NOT NULL CHECK (from_type IN ('TOTAL', 'TRADING', 'PROFIT')),
  to_type TEXT NOT NULL CHECK (to_type IN ('TOTAL', 'TRADING', 'PROFIT')),
  amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'NEWS' CHECK (type IN ('NEWS', 'ALERT')),
  severity TEXT DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) NOT NULL,
  referee_id UUID REFERENCES users(id) NOT NULL,
  commission DECIMAL(15,2) DEFAULT 0.00,
  total_earnings DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price history table for charts
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID REFERENCES trading_pairs(id) NOT NULL,
  price DECIMAL(15,8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet addresses table for admin management
CREATE TABLE IF NOT EXISTS wallet_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  currency TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  network TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default wallet addresses
INSERT INTO wallet_addresses (currency, address, network, is_active) VALUES 
('BTC', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'Bitcoin', TRUE),
('ETH', '0x742d35Cc6634C0532925a3b8D6aC6E2a4c8e4e7D', 'Ethereum', TRUE),
('USDT', '0x8ba1f109551bD432803012645Hac136c1b4Q80b1', 'Ethereum', TRUE),
('LTC', 'LTC1qw508d6qejxtdg4y5r3zarvary0c5xw7k2h5z0f', 'Litecoin', TRUE),
('ADA', 'addr1qxyz123...cardano_address', 'Cardano', TRUE),
('DOT', '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5', 'Polkadot', TRUE)
ON CONFLICT (currency) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY; 
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (full access for z@test.com)
CREATE POLICY "Allow admin full access to users" ON users
  FOR ALL USING (auth.jwt() ->> 'email' = 'z@test.com');

CREATE POLICY "Allow admin full access to transactions" ON transactions  
  FOR ALL USING (auth.jwt() ->> 'email' = 'z@test.com');

CREATE POLICY "Allow admin full access to trades" ON trades
  FOR ALL USING (auth.jwt() ->> 'email' = 'z@test.com');

CREATE POLICY "Allow admin full access to conversions" ON conversions
  FOR ALL USING (auth.jwt() ->> 'email' = 'z@test.com');

CREATE POLICY "Allow admin full access to news" ON news
  FOR ALL USING (auth.jwt() ->> 'email' = 'z@test.com');

CREATE POLICY "Allow admin full access to referrals" ON referrals
  FOR ALL USING (auth.jwt() ->> 'email' = 'z@test.com');

CREATE POLICY "Allow admin full access to wallet_addresses" ON wallet_addresses
  FOR ALL USING (auth.jwt() ->> 'email' = 'z@test.com');

-- Create policies for users to access their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own trades" ON trades  
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversions" ON conversions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversions" ON conversions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view active news" ON news
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view wallet addresses" ON wallet_addresses
  FOR SELECT USING (is_active = TRUE);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_currency ON wallet_addresses(currency);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_wallet_addresses_updated_at 
    BEFORE UPDATE ON wallet_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();