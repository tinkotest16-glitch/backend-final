-- EdgeMarket Complete SQL Schema for Supabase
-- This schema creates all necessary tables for the EdgeMarket trading platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    total_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    trading_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    profit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    referral_code TEXT NOT NULL UNIQUE,
    referred_by UUID REFERENCES users(id),
    referral_earnings DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    is_quick_trade_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_copy_trading_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    copy_trading_master_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trading pairs table (READ-ONLY from backend - no admin management)
CREATE TABLE trading_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    base_price DECIMAL(15, 8) NOT NULL,
    current_price DECIMAL(15, 8) NOT NULL,
    spread DECIMAL(6, 4) NOT NULL DEFAULT 0.0008,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    icon TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    volatility DECIMAL(8, 6) NOT NULL DEFAULT 0.0001,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    pair_id UUID NOT NULL REFERENCES trading_pairs(id),
    type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    entry_price DECIMAL(15, 8) NOT NULL,
    exit_price DECIMAL(15, 8),
    pnl DECIMAL(15, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'OPEN',
    is_profit BOOLEAN,
    duration INTEGER DEFAULT 60,
    take_profit DECIMAL(15, 8),
    stop_loss DECIMAL(15, 8),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP
);

-- Transactions table (deposits/withdrawals)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES users(id)
);

-- Balance conversions
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    from_type TEXT NOT NULL,
    to_type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- News table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    severity TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referee_id UUID NOT NULL REFERENCES users(id),
    commission DECIMAL(5, 4) NOT NULL DEFAULT 0.10,
    total_earnings DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Price history table (for charting)
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair_id UUID NOT NULL REFERENCES trading_pairs(id),
    price DECIMAL(15, 8) NOT NULL,
    volume DECIMAL(15, 2) DEFAULT 0.00,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_pair_id ON trades(pair_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_news_active ON news(is_active);
CREATE INDEX idx_price_history_pair_timestamp ON price_history(pair_id, timestamp);

-- Insert default trading pairs (40 pairs total)
INSERT INTO trading_pairs (symbol, name, base_price, current_price, icon, color, volatility) VALUES
-- Major Currency Pairs
('EUR/USD', 'Euro / US Dollar', 1.0850, 1.0850, 'EU', '#3b82f6', 0.0001),
('GBP/USD', 'British Pound / US Dollar', 1.2750, 1.2750, 'GB', '#ef4444', 0.0002),
('USD/JPY', 'US Dollar / Japanese Yen', 145.50, 145.50, 'JP', '#10b981', 0.0003),
('AUD/USD', 'Australian Dollar / US Dollar', 0.6650, 0.6650, 'AU', '#f59e0b', 0.0002),
('USD/CAD', 'US Dollar / Canadian Dollar', 1.3580, 1.3580, 'CA', '#8b5cf6', 0.0001),
('EUR/GBP', 'Euro / British Pound', 0.8510, 0.8510, 'EG', '#06b6d4', 0.0001),
('USD/CHF', 'US Dollar / Swiss Franc', 0.8950, 0.8950, 'CH', '#84cc16', 0.0001),
('NZD/USD', 'New Zealand Dollar / US Dollar', 0.6150, 0.6150, 'NZ', '#06b6d4', 0.0002),
('EUR/JPY', 'Euro / Japanese Yen', 157.80, 157.80, 'EJ', '#8b5cf6', 0.0002),
('GBP/JPY', 'British Pound / Japanese Yen', 185.50, 185.50, 'GJ', '#ef4444', 0.0003),

-- Minor Currency Pairs
('EUR/AUD', 'Euro / Australian Dollar', 1.6320, 1.6320, 'EA', '#f59e0b', 0.0002),
('GBP/AUD', 'British Pound / Australian Dollar', 1.9180, 1.9180, 'GA', '#ef4444', 0.0003),
('AUD/JPY', 'Australian Dollar / Japanese Yen', 96.75, 96.75, 'AJ', '#10b981', 0.0003),
('CAD/JPY', 'Canadian Dollar / Japanese Yen', 107.15, 107.15, 'CJ', '#8b5cf6', 0.0002),
('CHF/JPY', 'Swiss Franc / Japanese Yen', 162.50, 162.50, 'SJ', '#84cc16', 0.0002),
('EUR/CAD', 'Euro / Canadian Dollar', 1.4730, 1.4730, 'EC', '#3b82f6', 0.0002),
('GBP/CAD', 'British Pound / Canadian Dollar', 1.7320, 1.7320, 'GC', '#ef4444', 0.0002),
('AUD/CAD', 'Australian Dollar / Canadian Dollar', 0.9030, 0.9030, 'AC', '#f59e0b', 0.0002),
('NZD/JPY', 'New Zealand Dollar / Japanese Yen', 89.45, 89.45, 'NJ', '#06b6d4', 0.0003),
('EUR/CHF', 'Euro / Swiss Franc', 0.9720, 0.9720, 'ES', '#3b82f6', 0.0001),

-- Exotic Currency Pairs
('USD/SEK', 'US Dollar / Swedish Krona', 10.85, 10.85, 'SE', '#06b6d4', 0.0005),
('USD/NOK', 'US Dollar / Norwegian Krone', 10.55, 10.55, 'NO', '#10b981', 0.0005),
('USD/DKK', 'US Dollar / Danish Krone', 6.85, 6.85, 'DK', '#ef4444', 0.0004),
('USD/SGD', 'US Dollar / Singapore Dollar', 1.3480, 1.3480, 'SG', '#f59e0b', 0.0003),
('USD/ZAR', 'US Dollar / South African Rand', 18.75, 18.75, 'ZA', '#84cc16', 0.001),

-- Cryptocurrencies
('BTC/USD', 'Bitcoin / US Dollar', 43500.00, 43500.00, 'BT', '#f97316', 0.002),
('ETH/USD', 'Ethereum / US Dollar', 2650.00, 2650.00, 'ET', '#6366f1', 0.003),
('LTC/USD', 'Litecoin / US Dollar', 72.50, 72.50, 'LT', '#94a3b8', 0.005),
('ADA/USD', 'Cardano / US Dollar', 0.4850, 0.4850, 'AD', '#3b82f6', 0.008),
('DOT/USD', 'Polkadot / US Dollar', 7.25, 7.25, 'DT', '#e91e63', 0.006),
('BNB/USD', 'Binance Coin / US Dollar', 315.50, 315.50, 'BN', '#f59e0b', 0.004),
('SOL/USD', 'Solana / US Dollar', 98.75, 98.75, 'SO', '#8b5cf6', 0.007),
('AVAX/USD', 'Avalanche / US Dollar', 24.80, 24.80, 'AV', '#ef4444', 0.008),

-- Commodities
('XAU/USD', 'Gold / US Dollar', 2015.50, 2015.50, 'AU', '#eab308', 0.0005),
('XAG/USD', 'Silver / US Dollar', 24.75, 24.75, 'AG', '#94a3b8', 0.001),
('XPD/USD', 'Palladium / US Dollar', 1285.50, 1285.50, 'PD', '#84cc16', 0.002),
('XPT/USD', 'Platinum / US Dollar', 985.25, 985.25, 'PT', '#06b6d4', 0.0015),
('WTI/USD', 'Crude Oil WTI / US Dollar', 78.45, 78.45, 'OI', '#000000', 0.003),
('BRENT/USD', 'Brent Oil / US Dollar', 82.15, 82.15, 'BR', '#1f2937', 0.0025),
('NATGAS/USD', 'Natural Gas / US Dollar', 2.85, 2.85, 'NG', '#059669', 0.005);

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
    referral_code,
    referral_earnings
) VALUES (
    'admin',
    'z@test.com',
    '421',
    'Admin User',
    TRUE,
    10000.00,
    5000.00,
    2500.00,
    'ADMIN001',
    0.00
);

-- Insert sample news
INSERT INTO news (title, content, type, severity, created_by, is_active) VALUES
('Market Opening', 'Markets are now open for trading. Good luck!', 'info', 'low', (SELECT id FROM users WHERE email = 'z@test.com'), TRUE),
('High Volatility Alert', 'Increased volatility expected in EUR/USD pair today.', 'warning', 'medium', (SELECT id FROM users WHERE email = 'z@test.com'), TRUE),
('System Maintenance', 'Scheduled maintenance tonight from 2-4 AM UTC.', 'maintenance', 'high', (SELECT id FROM users WHERE email = 'z@test.com'), TRUE);