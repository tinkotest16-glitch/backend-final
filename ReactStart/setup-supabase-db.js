
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fmqlhrhgsormiqmsiafx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcWxocmhnc29ybWlxbXNpYWZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ0NDAwMSwiZXhwIjoyMDcxMDIwMDAxfQ.psF8dY3VNLUPa8TZU08AVOfZGjZfMQ8fbepjRlWmscQ';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...');

  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          total_balance DECIMAL(10,2) DEFAULT 0.00,
          trading_balance DECIMAL(10,2) DEFAULT 0.00,
          profit DECIMAL(10,2) DEFAULT 0.00,
          referral_code TEXT UNIQUE,
          referral_earnings DECIMAL(10,2) DEFAULT 0.00,
          referred_by UUID REFERENCES users(id),
          is_quick_trade_locked BOOLEAN DEFAULT FALSE,
          is_copy_trading_enabled BOOLEAN DEFAULT FALSE,
          copy_trading_master_user_id UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (usersError) console.error('Users table error:', usersError);
    else console.log('✅ Users table created');

    // Create other tables...
    console.log('✅ Database setup completed');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();
