# ProTrader Supabase Setup Guide

This guide will help you set up the ProTrader application with Supabase as the backend database.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js installed on your system
3. The ProTrader source code

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `ProTrader`
   - Database Password: Choose a strong password (save this!)
   - Region: Choose the closest to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (1-2 minutes)

## Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to Settings → API
2. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public**: `eyJhbGci...` (your anon key)
   - **service_role**: `eyJhbGci...` (your service role key - keep this secret!)

3. Go to Settings → Database
4. Under "Connection string" → "Transaction pooler", copy the URI
5. Replace `[YOUR-PASSWORD]` with your database password

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```

## Step 4: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the entire contents of `supabase-setup.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the schema

This will create:
- All necessary tables (users, trading_pairs, trades, transactions, etc.)
- Indexes for performance
- Row Level Security policies
- Default admin user and trading pairs
- Sample news items

## Step 5: Configure Authentication (Optional)

If you want to use Supabase Auth instead of custom authentication:

1. Go to Authentication → Settings
2. Configure your site URL: `http://localhost:5000` (for development)
3. Add any additional redirect URLs for production
4. Configure email templates if needed
5. Set up OAuth providers if desired

## Step 6: Test the Connection

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5000` in your browser
4. Try logging in with the default admin credentials:
   - Username: `admin`
   - Password: `admin` (or whatever you set in the SQL)

## Step 7: Production Setup

For production deployment:

1. Update environment variables with production URLs
2. Set up custom domain in Supabase (if needed)
3. Configure CORS settings in Supabase
4. Set up database backups
5. Monitor usage and performance

## Database Tables Overview

The schema includes these main tables:

- **users**: User accounts and balances
- **trading_pairs**: Available trading pairs (EUR/USD, etc.)
- **trades**: User trading history
- **transactions**: Deposit/withdrawal requests
- **conversions**: Balance conversions between types
- **news**: Market news and alerts
- **referrals**: Referral system tracking
- **price_history**: Historical price data

## Security Features

- Row Level Security (RLS) enabled
- Users can only access their own data
- Public read access for trading pairs and news
- Secure API endpoints with proper authentication

## Admin Features

The admin user can:
- Approve/reject deposit and withdrawal requests
- Create market news and alerts
- Manually adjust user balances
- View platform statistics

## Trading Features

- Real-time price simulation
- 1-in-3 profit ratio trading logic
- Balance conversion between types
- Referral commission system
- Trading history with PDF export

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check that your IP is allowed in Supabase (shouldn't be an issue for Supabase projects)
- Ensure your database password is correct

### Authentication Issues
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Check that RLS policies are set up correctly
- Make sure the anon key has the right permissions

### Performance Issues
- Monitor your Supabase dashboard for usage stats
- Consider upgrading your Supabase plan if needed
- Optimize queries if necessary

## Support

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Review the browser console for errors
3. Verify all environment variables are set correctly
4. Check that the database schema was applied successfully

For Supabase-specific issues, refer to the [Supabase Documentation](https://supabase.com/docs).
