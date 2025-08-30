
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS trading_pairs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    total_balance DECIMAL(15,2) DEFAULT 100.00,
    trading_balance DECIMAL(15,2) DEFAULT 1000.00,
    profit DECIMAL(15,2) DEFAULT 100.00,
    is_admin BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(10) UNIQUE,
    referred_by UUID REFERENCES users(id),
    referral_earnings DECIMAL(15,2) DEFAULT 0.00,
    is_quick_trade_locked BOOLEAN DEFAULT FALSE,
    is_copy_trading_enabled BOOLEAN DEFAULT FALSE,
    copy_trading_master_user_id UUID REFERENCES users(id),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trading_pairs table
CREATE TABLE trading_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    basePrice DECIMAL(15,8) NOT NULL,
    currentPrice DECIMAL(15,8) NOT NULL,
    spread DECIMAL(8,4) DEFAULT 0.0008,
    isActive BOOLEAN DEFAULT TRUE,
    icon VARCHAR(255),
    color VARCHAR(7) DEFAULT '#3b82f6',
    volatility DECIMAL(8,4) DEFAULT 0.0001,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pairId UUID NOT NULL REFERENCES trading_pairs(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    amount DECIMAL(15,2) NOT NULL,
    entryPrice DECIMAL(15,8) NOT NULL,
    exitPrice DECIMAL(15,8),
    pnl DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    isProfit BOOLEAN,
    duration INTEGER DEFAULT 60,
    takeProfit DECIMAL(15,8),
    stopLoss DECIMAL(15,8),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closedAt TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL')),
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    adminNotes TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processedAt TIMESTAMP WITH TIME ZONE,
    processedBy VARCHAR(255)
);

-- Create conversions table
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fromType VARCHAR(20) NOT NULL CHECK (fromType IN ('TOTAL', 'TRADING', 'PROFIT')),
    toType VARCHAR(20) NOT NULL CHECK (toType IN ('TOTAL', 'TRADING', 'PROFIT')),
    amount DECIMAL(15,2) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'NEWS' CHECK (type IN ('NEWS', 'ALERT', 'MAINTENANCE')),
    severity VARCHAR(20) DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    isActive BOOLEAN DEFAULT TRUE,
    createdBy VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refereeId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commission DECIMAL(15,2) DEFAULT 0.00,
    totalEarnings DECIMAL(15,2) DEFAULT 0.00,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrerId, refereeId)
);

-- Create price_history table
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pairId UUID NOT NULL REFERENCES trading_pairs(id) ON DELETE CASCADE,
    price DECIMAL(15,8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_trades_user_id ON trades(userId);
CREATE INDEX idx_trades_pair_id ON trades(pairId);
CREATE INDEX idx_trades_created_at ON trades(createdAt);
CREATE INDEX idx_transactions_user_id ON transactions(userId);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_price_history_pair_id ON price_history(pairId);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp);

-- Insert default admin user
INSERT INTO users (
    username, 
    email, 
    password, 
    full_name, 
    is_admin, 
    total_balance, 
    trading_balance, 
    profit, 
    referral_code
) VALUES (
    'admin', 
    'z@test.com', 
    '421', 
    'Admin User', 
    TRUE, 
    10000.00, 
    5000.00, 
    2500.00, 
    'ADMIN001'
);

-- Insert default trading pairs
INSERT INTO trading_pairs (symbol, name, basePrice, currentPrice, icon, color, volatility) VALUES
('EUR/USD', 'Euro vs US Dollar', 1.0500, 1.0500, '🇪🇺🇺🇸', '#3b82f6', 0.0001),
('GBP/USD', 'British Pound vs US Dollar', 1.2500, 1.2500, '🇬🇧🇺🇸', '#10b981', 0.0001),
('USD/JPY', 'US Dollar vs Japanese Yen', 150.00, 150.00, '🇺🇸🇯🇵', '#f59e0b', 0.0001),
('AUD/USD', 'Australian Dollar vs US Dollar', 0.6500, 0.6500, '🇦🇺🇺🇸', '#ef4444', 0.0001),
('USD/CAD', 'US Dollar vs Canadian Dollar', 1.3500, 1.3500, '🇺🇸🇨🇦', '#8b5cf6', 0.0001),
('NZD/USD', 'New Zealand Dollar vs US Dollar', 0.6000, 0.6000, '🇳🇿🇺🇸', '#06b6d4', 0.0001),
('EUR/GBP', 'Euro vs British Pound', 0.8500, 0.8500, '🇪🇺🇬🇧', '#84cc16', 0.0001),
('CHF/USD', 'Swiss Franc vs US Dollar', 1.1000, 1.1000, '🇨🇭🇺🇸', '#f97316', 0.0001);

-- Insert default news
INSERT INTO news (title, content, type, severity, createdBy) VALUES
('Welcome to EdgeMarket!', 'Start your trading journey with us. You have been credited with $100 in your total balance and $1000 in trading balance.', 'NEWS', 'INFO', 'system'),
('Trading Platform Live', 'Our advanced trading platform is now live with real-time price updates and instant trade execution.', 'ALERT', 'INFO', 'system'),
('Risk Warning', 'Trading involves substantial risk and may result in the loss of your invested capital. Please trade responsibly.', 'ALERT', 'WARNING', 'system');

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text OR is_admin = true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for trades table
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid()::text = userId::text);
CREATE POLICY "Users can insert own trades" ON trades FOR INSERT WITH CHECK (auth.uid()::text = userId::text);

-- Create policies for transactions table
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid()::text = userId::text);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid()::text = userId::text);

-- Create policies for conversions table
CREATE POLICY "Users can view own conversions" ON conversions FOR SELECT USING (auth.uid()::text = userId::text);
CREATE POLICY "Users can insert own conversions" ON conversions FOR INSERT WITH CHECK (auth.uid()::text = userId::text);

-- Create policies for referrals table
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid()::text = referrerId::text OR auth.uid()::text = refereeId::text);

-- Allow public read access to trading_pairs and news
CREATE POLICY "Public read access to trading pairs" ON trading_pairs FOR SELECT USING (true);
CREATE POLICY "Public read access to news" ON news FOR SELECT USING (isActive = true);

-- Allow public read access to price_history
CREATE POLICY "Public read access to price history" ON price_history FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
