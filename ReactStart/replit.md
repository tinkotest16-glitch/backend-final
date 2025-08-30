# Overview

ProTrader is a comprehensive forex trading platform that provides users with real-time trading capabilities, portfolio management, and market analysis tools. The application offers a simulated trading environment with live price feeds, user account management, transaction processing, and administrative controls for managing the platform.

## Recent Updates (August 19, 2025)
- ✅ **EdgeMarket App Successfully Running on Port 80** - Fully operational with Supabase database connected
- ✅ **Supabase Integration Active** - Database credentials configured and storage layer operational
- ✅ **Health Check Confirmed** - API responding: `{"status":"ok","timestamp":"2025-08-19T12:31:07.814Z","port":"80"}`
- ✅ **Background Process Persistent** - Running continuously with nohup for uninterrupted operation
- ✅ **Preview Ready** - App accessible through Replit preview with all features functional
- ✅ **Admin System Active** - Login credentials: z@test.com / 421 for full admin access
- ✅ **All Trading Features Loaded** - Quick Trade, Copy Trading, Admin Panel, 40+ trading pairs operational

## Previous Updates (August 18, 2025)
- ✅ **EdgeMarket App Fully Deployed** - Complete trading platform with all features operational
- ✅ **Database Integration Complete** - Supabase credentials configured with memory storage fallback  
- ✅ **Admin System Active** - Full admin dashboard with user/wallet management (z@test.com/421)
- ✅ **Admin Transaction Management** - Pending deposits/withdrawals API working with sample data
- ✅ **Trading System Operational** - 40+ trading pairs with real-time price simulation
- ✅ **Server Running on Port 5000** - All API endpoints responding correctly with Replit routing
- ✅ **Authentication Working** - Login/logout functionality tested and verified
- ✅ **Memory Storage Initialized** - Default trading data and admin user created with sample transactions
- ✅ **Copy Trading Lock System** - Real-time monitoring with countdown timers and active trade management
- ✅ **Quick Trade Lock System** - Live position tracking with automatic price updates and P&L calculation
- ✅ **Admin Features Complete** - User management, wallet controls, alerts, page access controls
- ✅ **Frontend/Backend Integration** - React frontend communicating properly with Express API
- ✅ **Real-time Updates** - WebSocket integration for live price feeds configured
- ✅ **Transaction Testing Data** - Sample pending deposits/withdrawals created for admin panel testing
- ✅ **Trading Locks Responsive** - Copy trading and quick trade locks display properly with mobile support

## Previous Updates (August 17, 2025)
- ✅ **ProTrader Application Restored** - Successfully copied complete trading platform from ReactStarter folder
- ✅ **All Trading Pages Deployed** - Dashboard, trading, history, deposits, withdrawals, admin, market news, referrals, copy trading, signals
- ✅ **Authentication System** - Login/logout with ThemeProvider and AuthProvider context
- ✅ **Server running on port 80** - Express backend with TypeScript serving correctly on requested port
- ✅ **API Endpoints Active** - Health check, users, trading pairs, and all trading functionality accessible
- ✅ **40 Trading Pairs Implemented** - Expanded from 22 to 40 pairs including BTC, ETH, gold, silver, commodities
- ✅ **Take Profit/Stop Loss Simulation** - Added TP/SL input fields with adjustable values in Quick Trade
- ✅ **Enhanced Trading History** - Added TP/SL column showing Take Profit and Stop Loss values
- ✅ **Real-Time Balance Updates** - Trading balance updates instantly on trade execution and completion
- ✅ **Enhanced Chart Previews** - Replaced placeholders with actual charts opening TradingView
- ✅ **Separate Market News Page** - Created dedicated /market-news page with admin controls
- ✅ **Separate Referrals Page** - Created dedicated /referrals page with link sharing and earnings
- ✅ **Interface consistency fixed** - Added missing getUserTradeCount method to IStorage interface
- ✅ **Trading logic implemented** - 1-in-3 profit ratio system with 300-second (5-minute) auto-close trades
- ✅ **EdgeMarket Header/Footer** - Comprehensive responsive header and footer with theme toggle
- ✅ **Layout System** - Created Layout component with header/footer integration across pages
- ✅ **Theme Context** - Dark/light mode switching with localStorage persistence
- ✅ **Enhanced UI Contrast** - Improved text readability in both light and dark modes
- ✅ **Mobile Responsiveness** - Fixed mobile layout switching issues and improved responsive behavior
- ✅ **Scroll Navigation** - Trading pairs properly scroll to Quick Trade section when clicked
- ✅ **Balance Refresh** - Enhanced balance refresh functionality with proper query invalidation
- ✅ **Market News Content** - Added 3 default news items for better user experience
- ✅ **Navigation Improvements** - Fixed "Back to Dashboard" buttons on all pages
- ✅ **JSX Compilation Fixed** - Resolved all syntax errors in market-news.tsx and CSS issues
- ✅ **UI Component Library** - Added missing Sheet component for mobile navigation support
- ✅ **Logo Integration Complete** - Added user's logo across login page, header, and footer consistently
- ✅ **Quick Trade Enhanced** - Added new time duration options: 10min, 15min, 30min, 1hr, 4hr, 10hr, 24hr, 48hr
- ✅ **Withdrawals UI Improved** - Enhanced fee breakdown panel with yellow accent styling and centered button
- ✅ **Copy Trading Rules** - Implemented $800-$1000 investment range with proper validation
- ✅ **Branding Consistency** - Updated all references from "Edgemarket" to "EdgeMarket"
- ✅ **Balance System Fixed** - Corrected balance references to use totalBalance consistently across components
- ✅ **History Page Updated** - Fixed TanStack Query v5 compatibility for trading history display
- ✅ **LSP Errors Resolved** - Fixed SettingsModal props and other TypeScript issues
- ✅ **Balance Refresh System Enhanced** - Real-time balance updates with comprehensive query invalidation
- ✅ **Copy Trading Lock System** - Active trades with lock status, countdown timers, progress bars, $800-$10,000 range
- ✅ **Quick Trade Active Trades** - 15-minute default duration, close (✕) button, real-time countdown display
- ✅ **Withdrawals System Complete** - "Clear Withdrawal Fee" button, "Withdraw anyway" text, yellow-accented fee panel
- ✅ **Copy Trade History Display** - Shows locked trades with countdown timers and current returns
- ✅ **All Duration Options** - 10min, 15min, 30min, 1hr, 4hr, 10hr, 24hr, 48hr time durations implemented

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing modern development patterns:
- **Component Structure**: Uses shadcn/ui components for consistent styling and UX
- **State Management**: React Context for authentication state, React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom trading platform theme variables
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server follows a RESTful API design pattern:
- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM for database operations with PostgreSQL
- **Storage Interface**: Abstracted storage layer supporting multiple database implementations
- **Authentication**: Session-based authentication with user roles (admin/regular users)
- **API Design**: RESTful endpoints for trading operations, user management, and administrative functions

## Database Design
PostgreSQL database with the following core entities:
- **Users**: Account information, balances, referral system
- **Trading Pairs**: Currency pairs with real-time pricing and volatility data
- **Trades**: Individual trading transactions with entry/exit prices and P&L
- **Transactions**: Deposit/withdrawal operations with approval workflow
- **Conversions**: Balance transfers between different account types
- **News**: Market news and alerts with severity levels
- **Referrals**: User referral tracking and earnings
- **Price History**: Historical price data for charting

## Trading System Logic
The platform implements a controlled trading environment:
- **Price Simulation**: Real-time price updates every 2 seconds using volatility models
- **Trade Execution**: Automated 60-second trade duration with predetermined outcomes
- **Profit Distribution**: 1-in-3 trades result in profit to maintain platform sustainability
- **Balance Management**: Separate total balance and trading balance with conversion capabilities

## Authentication and Authorization
Role-based access control system:
- **User Authentication**: Username/password login with client-side session management
- **User Roles**: Regular users and administrators with different permissions
- **Route Protection**: Client-side route guards based on authentication status and user roles
- **Session Management**: Local storage-based session persistence

# Application Status

## Current Running State
- **Server Status**: ✅ Running on port 80
- **API Endpoints**: ✅ All endpoints functional and tested
- **Authentication**: ✅ Login/register working properly
- **Trading System**: ✅ 40 currency pairs initialized with proper data
- **Frontend**: ✅ React app served with Vite hot reloading
- **Storage**: ✅ In-memory storage with complete data model
- **Layout System**: ✅ Comprehensive header/footer with theme switching
- **Mobile Support**: ✅ Responsive design with proper mobile navigation

## Quick Start Commands
To run the application:
```bash
npm run dev
```
Or manually:
```bash
NODE_ENV=development tsx server/index.ts
```

Admin credentials: z@test.com / 421

# External Dependencies

## Database Services
- **Supabase**: Primary database hosting with PostgreSQL backend
- **Connection Pooling**: Transaction pooler for optimized database connections

## Price Data Integration
- **TradingView**: External charting service integration for advanced market analysis
- **Price Simulation**: Custom price feed simulation for real-time market data

## UI Component Libraries
- **shadcn/ui**: Modern React component library built on Radix UI
- **Radix UI**: Headless UI primitives for accessibility and customization
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools
- **Vite**: Build tool and development server
- **Replit Integration**: Development environment plugins and runtime error handling
- **PDF Generation**: jsPDF for trading reports and document generation

## Styling and Theming
- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS Variables**: Trading platform-specific color scheme and theming
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Query and State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form validation and management
- **Zod**: Schema validation for type-safe data handling