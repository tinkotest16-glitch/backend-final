
# Advanced Trading Platform - Repl Setup Guide

## 🚀 Quick Setup Instructions

### 1. Create New Repl
1. Go to Replit.com and create a new Node.js repl
2. Name it "trading-platform" or similar
3. Delete the default files

### 2. Copy Project Files
Copy all files and folders from the original repl maintaining the exact structure:

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── db-storage.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   ├── schema.ts
│   └── types.ts
├── .env
├── .replit
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── Other config files...
```

### 3. Environment Setup
Create `.env` file with:
```
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://flkdzmffxijgmovvyqwf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsa2R6bWZmeGlqZ21vdnZ5cXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzA4MTYsImV4cCI6MjA2OTkwNjgxNn0.meLozIfyhGGtXlV5BEnmuNE8sybHHGov7u4JbklcU6c
```

### 4. Run Configuration
Create `.replit` file:
```
[nix]
channel = "stable-24_11"

[deployment]
run = ["npm", "run", "dev"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80
exposeLocalhost = true

[env]
NODE_ENV = "development"
PORT = "5000"
```

### 5. Install & Run
1. Click the "Run" button
2. Wait for dependencies to install
3. Server will start on port 5000
4. Access via the webview or public URL

## 📋 Project Features

### Core Trading Functionality
- **Real-time Trading**: Place buy/sell orders with instant execution
- **Active Trades Management**: Edit stop-loss and take-profit during trades
- **Trading History**: Complete transaction history with filtering
- **Balance Management**: Convert between main and trading balance
- **Quick Trade**: Fast trading interface with preset amounts

### Advanced Features
- **Live Price Charts**: Real-time price visualization
- **Chart Previews**: Mini charts for each trading pair
- **Market Data**: 50+ trading pairs including Forex, Crypto, Commodities
- **Profit/Loss Simulation**: Realistic trading outcomes (1 in 3 wins)
- **Responsive Design**: Works on desktop and mobile

### Technical Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **State Management**: TanStack Query
- **UI Components**: Radix UI + Custom components
- **Charts**: Canvas-based real-time charts
- **Authentication**: Cookie-based sessions

## 🔧 Configuration Details

### Port Configuration
- Development: 5000 (automatically forwarded to 80/443)
- Webview access through Repl's public URL
- CORS enabled for cross-origin requests

### Database
- In-memory storage for development
- Persistent user sessions
- Real-time price updates every 4 hours

### Trading Logic
- 1 in 3 trades are profitable (70-85% profit)
- 2 in 3 trades are losses (85-100% loss)
- Realistic spread calculations
- Stop-loss and take-profit execution

## 🎯 Key Components

### Frontend Components
- `TradingPairs`: Market overview with live prices
- `QuickTrade`: Fast trading interface
- `ActiveTrades`: Manage open positions with SL/TP editing
- `TradingHistory`: Complete transaction history
- `BalanceCards`: Account balance overview
- `ChartPreview`: Real-time price charts

### Backend Routes
- `POST /api/auth/login`: User authentication
- `GET /api/trading-pairs`: Get all trading pairs
- `POST /api/trades`: Execute new trades
- `PUT /api/trades/:id`: Update active trades (SL/TP)
- `GET /api/trades/history`: Get trading history
- `POST /api/convert-balance`: Balance conversion

## 🚨 Troubleshooting

### Common Issues
1. **Preview not showing**: Check port 5000 is running and .replit is configured
2. **API calls failing**: Ensure server is running and endpoints are correct
3. **Charts not loading**: Canvas rendering requires proper component mounting
4. **Trading failures**: Check balance conversion and trade validation logic

### Development Tips
1. Use browser dev tools to debug API calls
2. Check server console for backend errors
3. Ensure all environment variables are set
4. Verify file structure matches exactly

## 📱 Usage Instructions

### For Users
1. **Login**: Use any username/password to access
2. **Trading**: Select pair, amount, direction (Buy/Sell)
3. **Management**: Edit SL/TP on active trades
4. **History**: View all past transactions
5. **Balance**: Convert between main and trading balance

### For Developers
1. **Customization**: Modify trading pairs in `server/storage.ts`
2. **UI Changes**: Update components in `client/src/components/`
3. **Trading Logic**: Adjust win rates in `client/src/lib/trading-logic.ts`
4. **Styling**: Modify Tailwind classes or `index.css`

## 🔄 Updates & Maintenance

### Regular Updates
- Price data refreshes every 4 hours
- User sessions persist across restarts
- Trading history maintains chronological order

### Performance Optimization
- Component lazy loading
- Efficient state management
- Minimal re-renders
- Optimized chart rendering

---

**Note**: This is a demo trading platform for educational purposes. All trades are simulated with predetermined outcomes.
