import { randomUUID } from 'crypto'

// Simple in-memory storage for development
export class DatabaseStorage {
  private users: any[] = [];
  private tradingPairs: any[] = [];
  private trades: any[] = [];
  private transactions: any[] = [];
  private conversions: any[] = [];
  private news: any[] = [];
  private referrals: any[] = [];
  private priceHistory: any[] = [];

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add default admin user
    this.users.push({
      id: 'admin-user-id',
      username: 'admin',
      email: 'z@test.com',
      password: '421',
      fullName: 'Admin User',
      isAdmin: true,
      totalBalance: '10000.00',
      tradingBalance: '5000.00',
      profit: '1000.00',
      referralEarnings: '100.00',
      referralCode: 'ADMIN001',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add 40 default trading pairs
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

    defaultPairs.forEach(pair => {
      this.tradingPairs.push({
        id: randomUUID(),
        ...pair,
        spread: '0.0008',
        isActive: true,
        updatedAt: new Date()
      });
    });

    // Add sample transactions for admin testing
    this.transactions.push(
      {
        id: randomUUID(),
        userId: 'admin-user-id',
        type: 'DEPOSIT',
        amount: '1000.00',
        status: 'PENDING',
        method: 'BANK_TRANSFER',
        reference: 'DEP001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        userId: 'admin-user-id',
        type: 'WITHDRAWAL',
        amount: '500.00',
        status: 'PENDING',
        method: 'BANK_TRANSFER',
        reference: 'WTH001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        userId: 'admin-user-id',
        type: 'DEPOSIT',
        amount: '2500.00',
        status: 'COMPLETED',
        method: 'CREDIT_CARD',
        reference: 'DEP002',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Add default news
    this.news.push({
      id: randomUUID(),
      title: 'Welcome to EdgeMarket',
      content: 'Start trading with our advanced platform.',
      type: 'NEWS',
      severity: 'INFO',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // User methods
  async getUser(id: string): Promise<any | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(userData: any): Promise<any> {
    const user = {
      id: randomUUID(),
      ...userData,
      referralCode: `REF_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, updates: any): Promise<any | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates, updatedAt: new Date() };
      return this.users[userIndex];
    }
    return undefined;
  }

  async updateUserBalance(id: string, totalBalance?: number, tradingBalance?: number, profit?: number): Promise<any | undefined> {
    const updates: any = {};
    if (totalBalance !== undefined) updates.totalBalance = totalBalance.toString();
    if (tradingBalance !== undefined) updates.tradingBalance = tradingBalance.toString();
    if (profit !== undefined) updates.profit = profit.toString();
    return this.updateUser(id, updates);
  }

  async getAllUsers(): Promise<any[]> {
    return [...this.users];
  }

  // Trading pair methods
  async getAllTradingPairs(): Promise<any[]> {
    return this.tradingPairs.filter(pair => pair.isActive);
  }

  async getTradingPair(id: string): Promise<any | undefined> {
    return this.tradingPairs.find(pair => pair.id === id);
  }

  async createTradingPair(pairData: any): Promise<any> {
    const pair = {
      id: randomUUID(),
      ...pairData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tradingPairs.push(pair);
    return pair;
  }

  async updateTradingPairPrice(id: string, price: number): Promise<any | undefined> {
    const pairIndex = this.tradingPairs.findIndex(pair => pair.id === id);
    if (pairIndex !== -1) {
      this.tradingPairs[pairIndex].currentPrice = price.toString();
      this.tradingPairs[pairIndex].updatedAt = new Date();
      return this.tradingPairs[pairIndex];
    }
    return undefined;
  }

  // Trading methods
  async createTrade(tradeData: any): Promise<any> {
    const trade = {
      id: randomUUID(),
      ...tradeData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.trades.push(trade);
    return trade;
  }

  async getTrade(id: string): Promise<any | undefined> {
    return this.trades.find(trade => trade.id === id);
  }

  async getUserTrades(userId: string): Promise<any[]> {
    return this.trades.filter(trade => trade.userId === userId);
  }

  async getAllTrades(): Promise<any[]> {
    return [...this.trades];
  }

  async getUserTradeCount(userId: string): Promise<number> {
    return this.trades.filter(trade => trade.userId === userId).length;
  }

  async updateTradeTPSL(id: string, takeProfit?: string, stopLoss?: string): Promise<any | undefined> {
    const tradeIndex = this.trades.findIndex(trade => trade.id === id);
    if (tradeIndex !== -1) {
      if (takeProfit) this.trades[tradeIndex].takeProfit = takeProfit;
      if (stopLoss) this.trades[tradeIndex].stopLoss = stopLoss;
      this.trades[tradeIndex].updatedAt = new Date();
      return this.trades[tradeIndex];
    }
    return undefined;
  }

  async closeTrade(id: string, exitPrice: number, pnl: number, isProfit: boolean): Promise<any | undefined> {
    const tradeIndex = this.trades.findIndex(trade => trade.id === id);
    if (tradeIndex !== -1) {
      this.trades[tradeIndex].exitPrice = exitPrice.toString();
      this.trades[tradeIndex].pnl = pnl.toString();
      this.trades[tradeIndex].isProfit = isProfit;
      this.trades[tradeIndex].status = 'CLOSED';
      this.trades[tradeIndex].closedAt = new Date();
      return this.trades[tradeIndex];
    }
    return undefined;
  }

  // Transaction methods
  async createTransaction(transactionData: any): Promise<any> {
    const transaction = {
      id: randomUUID(),
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<any[]> {
    return this.transactions.filter(transaction => transaction.userId === userId);
  }

  async getPendingTransactions(): Promise<any[]> {
    return this.transactions.filter(transaction => transaction.status === 'PENDING');
  }

  async getAllTransactions(): Promise<any[]> {
    return [...this.transactions];
  }

  async updateTransactionStatus(id: string, status: string, adminNotes?: string, processedBy?: string): Promise<any | undefined> {
    const transactionIndex = this.transactions.findIndex(transaction => transaction.id === id);
    if (transactionIndex !== -1) {
      this.transactions[transactionIndex].status = status;
      if (adminNotes) this.transactions[transactionIndex].adminNotes = adminNotes;
      if (processedBy) this.transactions[transactionIndex].processedBy = processedBy;
      this.transactions[transactionIndex].updatedAt = new Date();
      return this.transactions[transactionIndex];
    }
    return undefined;
  }

  // Conversion methods
  async createConversion(conversionData: any): Promise<any> {
    const conversion = {
      id: randomUUID(),
      ...conversionData,
      createdAt: new Date()
    };
    this.conversions.push(conversion);
    return conversion;
  }

  async getUserConversions(userId: string): Promise<any[]> {
    return this.conversions.filter(conversion => conversion.userId === userId);
  }

  // News methods
  async getAllNews(): Promise<any[]> {
    return this.news.filter(item => item.isActive);
  }

  async createNews(newsData: any): Promise<any> {
    const newsItem = {
      id: randomUUID(),
      ...newsData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.news.push(newsItem);
    return newsItem;
  }

  async updateNews(id: string, updates: any): Promise<any | undefined> {
    const newsIndex = this.news.findIndex(item => item.id === id);
    if (newsIndex !== -1) {
      this.news[newsIndex] = { ...this.news[newsIndex], ...updates, updatedAt: new Date() };
      return this.news[newsIndex];
    }
    return undefined;
  }

  // Referral methods
  async getReferral(referrerId: string, refereeId: string): Promise<any | undefined> {
    return this.referrals.find(referral => referral.referrerId === referrerId && referral.refereeId === refereeId);
  }

  async createReferral(referralData: any): Promise<any> {
    const referral = {
      id: randomUUID(),
      ...referralData,
      createdAt: new Date()
    };
    this.referrals.push(referral);
    return referral;
  }

  async getUserReferrals(userId: string): Promise<any[]> {
    return this.referrals.filter(referral => referral.referrerId === userId);
  }

  async updateReferralEarnings(referrerId: string, amount: number): Promise<void> {
    const user = await this.getUser(referrerId);
    if (user) {
      const currentEarnings = parseFloat(user.referralEarnings || '0');
      await this.updateUser(referrerId, {
        referralEarnings: (currentEarnings + amount).toString()
      });
    }
  }

  // Price history methods
  async addPriceHistory(priceHistoryData: any): Promise<any> {
    const priceHistory = {
      id: randomUUID(),
      ...priceHistoryData,
      timestamp: new Date()
    };
    this.priceHistory.push(priceHistory);
    return priceHistory;
  }

  async getPairPriceHistory(pairId: string, limit: number = 100): Promise<any[]> {
    return this.priceHistory
      .filter(history => history.pairId === pairId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async updateCopyTradeStatus(copyTradeId: string, status: string): Promise<void> {
    // Mock implementation for now
    console.log(`Copy trade ${copyTradeId} status updated to ${status}`);
  }

  async getTransactions(): Promise<any[]> {
    // Mock implementation - in real app this would query transactions table
    return [
      {
        id: "tx1",
        userId: "admin-user-id",
        type: "DEPOSIT",
        amount: "1000.00",
        currency: "BTC",
        method: "Bitcoin",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      },
      {
        id: "tx2",
        userId: "test-user-id",
        type: "WITHDRAWAL",
        amount: "500.00",
        currency: "ETH",
        method: "Ethereum",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        walletAddress: "0x742d35Cc6464C4532d61B8fF5eA5D8a4E2e3A5b9"
      }
    ];
  }

  async getTransactionById(transactionId: string): Promise<any> {
    const transactions = await this.getTransactions();
    return transactions.find(tx => tx.id === transactionId);
  }

  async updateTransactionStatus(transactionId: string, status: string, adminNotes?: string): Promise<void> {
    // Mock implementation - in real app this would update database
    console.log(`Transaction ${transactionId} status updated to ${status}`, adminNotes);
  }
}

export const dbStorage = new DatabaseStorage()