import { storage } from "./storage";

// Initialize default data for the trading platform
export async function initializeDefaultData() {
  try {
    console.log("Initializing default trading data...");

    // Create admin user if it doesn't exist
    let adminUser = await storage.getUserByEmail("z@test.com");
    if (!adminUser) {
      adminUser = await storage.createUser({
        username: "admin",
        email: "z@test.com", 
        password: "421",
        fullName: "System Administrator",
        isAdmin: true,
        totalBalance: "10000.00",
        tradingBalance: "5000.00",
        profit: "2500.00",
        referralEarnings: "0.00",
        referredBy: null
      });
      console.log("✅ Admin user created");
    }

    // Initialize 40 trading pairs
    const defaultPairs = [
      // Major Currency Pairs
      { symbol: "EUR/USD", name: "Euro / US Dollar", basePrice: "1.0850", currentPrice: "1.0850", icon: "EU", color: "#3b82f6", volatility: "0.0001" },
      { symbol: "GBP/USD", name: "British Pound / US Dollar", basePrice: "1.2750", currentPrice: "1.2750", icon: "GB", color: "#ef4444", volatility: "0.0002" },
      { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", basePrice: "145.50", currentPrice: "145.50", icon: "JP", color: "#10b981", volatility: "0.0003" },
      { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", basePrice: "0.6650", currentPrice: "0.6650", icon: "AU", color: "#f59e0b", volatility: "0.0002" },
      { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", basePrice: "1.3580", currentPrice: "1.3580", icon: "CA", color: "#8b5cf6", volatility: "0.0001" },
      { symbol: "EUR/GBP", name: "Euro / British Pound", basePrice: "0.8510", currentPrice: "0.8510", icon: "EG", color: "#06b6d4", volatility: "0.0001" },
      { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", basePrice: "0.8950", currentPrice: "0.8950", icon: "CH", color: "#84cc16", volatility: "0.0001" },
      { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", basePrice: "0.6150", currentPrice: "0.6150", icon: "NZ", color: "#06b6d4", volatility: "0.0002" },
      { symbol: "EUR/JPY", name: "Euro / Japanese Yen", basePrice: "157.80", currentPrice: "157.80", icon: "EJ", color: "#8b5cf6", volatility: "0.0002" },
      { symbol: "GBP/JPY", name: "British Pound / Japanese Yen", basePrice: "185.50", currentPrice: "185.50", icon: "GJ", color: "#ef4444", volatility: "0.0003" },
      
      // Minor Currency Pairs
      { symbol: "EUR/AUD", name: "Euro / Australian Dollar", basePrice: "1.6320", currentPrice: "1.6320", icon: "EA", color: "#f59e0b", volatility: "0.0002" },
      { symbol: "GBP/AUD", name: "British Pound / Australian Dollar", basePrice: "1.9180", currentPrice: "1.9180", icon: "GA", color: "#ef4444", volatility: "0.0003" },
      { symbol: "AUD/JPY", name: "Australian Dollar / Japanese Yen", basePrice: "96.75", currentPrice: "96.75", icon: "AJ", color: "#10b981", volatility: "0.0003" },
      { symbol: "CAD/JPY", name: "Canadian Dollar / Japanese Yen", basePrice: "107.15", currentPrice: "107.15", icon: "CJ", color: "#8b5cf6", volatility: "0.0002" },
      { symbol: "CHF/JPY", name: "Swiss Franc / Japanese Yen", basePrice: "162.50", currentPrice: "162.50", icon: "SJ", color: "#84cc16", volatility: "0.0002" },
      { symbol: "EUR/CAD", name: "Euro / Canadian Dollar", basePrice: "1.4730", currentPrice: "1.4730", icon: "EC", color: "#3b82f6", volatility: "0.0002" },
      { symbol: "GBP/CAD", name: "British Pound / Canadian Dollar", basePrice: "1.7320", currentPrice: "1.7320", icon: "GC", color: "#ef4444", volatility: "0.0002" },
      { symbol: "AUD/CAD", name: "Australian Dollar / Canadian Dollar", basePrice: "0.9030", currentPrice: "0.9030", icon: "AC", color: "#f59e0b", volatility: "0.0002" },
      { symbol: "NZD/JPY", name: "New Zealand Dollar / Japanese Yen", basePrice: "89.45", currentPrice: "89.45", icon: "NJ", color: "#06b6d4", volatility: "0.0003" },
      { symbol: "EUR/CHF", name: "Euro / Swiss Franc", basePrice: "0.9720", currentPrice: "0.9720", icon: "ES", color: "#3b82f6", volatility: "0.0001" },
      
      // Exotic Currency Pairs
      { symbol: "USD/SEK", name: "US Dollar / Swedish Krona", basePrice: "10.85", currentPrice: "10.85", icon: "SE", color: "#06b6d4", volatility: "0.0005" },
      { symbol: "USD/NOK", name: "US Dollar / Norwegian Krone", basePrice: "10.55", currentPrice: "10.55", icon: "NO", color: "#10b981", volatility: "0.0005" },
      { symbol: "USD/DKK", name: "US Dollar / Danish Krone", basePrice: "6.85", currentPrice: "6.85", icon: "DK", color: "#ef4444", volatility: "0.0004" },
      { symbol: "USD/SGD", name: "US Dollar / Singapore Dollar", basePrice: "1.3480", currentPrice: "1.3480", icon: "SG", color: "#f59e0b", volatility: "0.0003" },
      { symbol: "USD/ZAR", name: "US Dollar / South African Rand", basePrice: "18.75", currentPrice: "18.75", icon: "ZA", color: "#84cc16", volatility: "0.001" },
      
      // Cryptocurrencies
      { symbol: "BTC/USD", name: "Bitcoin / US Dollar", basePrice: "43500.00", currentPrice: "43500.00", icon: "BT", color: "#f97316", volatility: "0.002" },
      { symbol: "ETH/USD", name: "Ethereum / US Dollar", basePrice: "2650.00", currentPrice: "2650.00", icon: "ET", color: "#6366f1", volatility: "0.003" },
      { symbol: "LTC/USD", name: "Litecoin / US Dollar", basePrice: "72.50", currentPrice: "72.50", icon: "LT", color: "#94a3b8", volatility: "0.005" },
      { symbol: "ADA/USD", name: "Cardano / US Dollar", basePrice: "0.4850", currentPrice: "0.4850", icon: "AD", color: "#3b82f6", volatility: "0.008" },
      { symbol: "DOT/USD", name: "Polkadot / US Dollar", basePrice: "7.25", currentPrice: "7.25", icon: "DT", color: "#e91e63", volatility: "0.006" },
      { symbol: "BNB/USD", name: "Binance Coin / US Dollar", basePrice: "315.50", currentPrice: "315.50", icon: "BN", color: "#f59e0b", volatility: "0.004" },
      { symbol: "SOL/USD", name: "Solana / US Dollar", basePrice: "98.75", currentPrice: "98.75", icon: "SO", color: "#8b5cf6", volatility: "0.007" },
      { symbol: "AVAX/USD", name: "Avalanche / US Dollar", basePrice: "24.80", currentPrice: "24.80", icon: "AV", color: "#ef4444", volatility: "0.008" },
      
      // Commodities
      { symbol: "XAU/USD", name: "Gold / US Dollar", basePrice: "2015.50", currentPrice: "2015.50", icon: "AU", color: "#eab308", volatility: "0.0005" },
      { symbol: "XAG/USD", name: "Silver / US Dollar", basePrice: "24.75", currentPrice: "24.75", icon: "AG", color: "#94a3b8", volatility: "0.001" },
      { symbol: "XPD/USD", name: "Palladium / US Dollar", basePrice: "1285.50", currentPrice: "1285.50", icon: "PD", color: "#84cc16", volatility: "0.002" },
      { symbol: "XPT/USD", name: "Platinum / US Dollar", basePrice: "985.25", currentPrice: "985.25", icon: "PT", color: "#06b6d4", volatility: "0.0015" },
      { symbol: "WTI/USD", name: "Crude Oil WTI / US Dollar", basePrice: "78.45", currentPrice: "78.45", icon: "OI", color: "#000000", volatility: "0.003" },
      { symbol: "BRENT/USD", name: "Brent Oil / US Dollar", basePrice: "82.15", currentPrice: "82.15", icon: "BR", color: "#1f2937", volatility: "0.0025" },
      { symbol: "NATGAS/USD", name: "Natural Gas / US Dollar", basePrice: "2.85", currentPrice: "2.85", icon: "NG", color: "#059669", volatility: "0.005" }
    ];

    const existingPairs = await storage.getAllTradingPairs();
    if (existingPairs.length === 0) {
      for (const pair of defaultPairs) {
        await storage.createTradingPair(pair);
      }
      console.log("✅ Trading pairs initialized");
    }

    // Create sample news
    const existingNews = await storage.getAllNews();
    if (existingNews.length === 0) {
      const sampleNews = [
        {
          title: "Market Update: Strong USD Performance",
          content: "The US Dollar continues to show strength against major currencies as Federal Reserve maintains its hawkish stance.",
          type: "NEWS",
          severity: "INFO",
          isActive: true,
          createdBy: adminUser.id
        },
        {
          title: "Trading Alert: High Volatility Expected",
          content: "Due to upcoming economic data releases, expect increased volatility in EUR/USD and GBP/USD pairs.",
          type: "ALERT", 
          severity: "WARNING",
          isActive: true,
          createdBy: adminUser.id
        },
        {
          title: "System Maintenance Complete",
          content: "All trading systems are now fully operational. Happy trading!",
          type: "NEWS",
          severity: "INFO", 
          isActive: true,
          createdBy: adminUser.id
        }
      ];

      for (const news of sampleNews) {
        await storage.createNews(news);
      }
      console.log("✅ Sample news created");
    }

    console.log("🎉 Default data initialization complete!");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize default data:", error);
    return false;
  }
}