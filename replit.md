# Overview

EdgeMarket is a comprehensive forex trading platform that provides users with real-time trading capabilities, portfolio management, and market analysis tools. The application offers a simulated trading environment with 40+ trading pairs including major currencies, cryptocurrencies, and commodities. It features quick trading, copy trading, admin dashboard, transaction management, referral systems, and market news functionality.

## Recent Updates (August 30, 2025)
- ✅ **EdgeMarket App Successfully Moved to Root Directory** - All files transferred from ReactStart/ to root
- ✅ **Dependencies Installed** - All required packages installed and configured
- ✅ **Server Running on Port 5000** - Internal port 5000 with external access via port 80
- ✅ **Preview Active** - Application accessible through Replit preview with full functionality

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React 18 and TypeScript using a modern stack:
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API with custom providers for authentication and theme management
- **Data Fetching**: TanStack React Query for server state management with caching and synchronization
- **UI Framework**: Tailwind CSS with custom design system and Radix UI components for accessibility
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server follows a REST API architecture with Express.js:
- **Framework**: Express.js with TypeScript for type safety
- **Session Management**: Express-session middleware with configurable secrets
- **Storage Layer**: Abstracted storage interface with multiple implementations (memory, Supabase)
- **API Design**: RESTful endpoints with structured error handling and validation
- **Development Setup**: Hot reloading with Vite integration for seamless full-stack development

## Data Storage Solutions
The application uses a flexible storage architecture:
- **Primary Storage**: Supabase PostgreSQL for production data persistence
- **Fallback Storage**: In-memory storage using TypeScript classes for development/testing
- **Schema Management**: Drizzle ORM with PostgreSQL dialect for database operations
- **Data Models**: Comprehensive schemas for users, trades, transactions, trading pairs, and analytics

## Authentication and Authorization
Security is implemented through multiple layers:
- **Session-based Authentication**: Server-side session management with secure cookies
- **Role-based Access Control**: Admin and user roles with protected route enforcement
- **Supabase Auth Integration**: Optional integration with Supabase authentication service
- **Context-based State**: React Context provides authentication state across components

## External Dependencies
The application integrates with several external services and libraries:
- **Supabase**: PostgreSQL database hosting and authentication services
- **TradingView**: Chart integration for market visualization and technical analysis
- **PDF Generation**: jsPDF library for generating trading reports and statements
- **Real-time Updates**: Price simulation engine for live market data
- **UI Components**: Radix UI primitives for accessible interface components
- **Styling**: Tailwind CSS with custom configuration and shadcn/ui design system