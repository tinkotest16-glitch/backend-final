import { createClient } from '@supabase/supabase-js';
import type { User, Trade, Transaction, TradingPair, Conversion, News, Referral } from '@shared/schema';

export class SupabaseStorage {
  private supabase;
  private supabaseUrl: string; // Added to store Supabase URL for logging

  constructor() {
    // Hardcoded Supabase credentials for EdgeMarket
    const supabaseUrl = 'https://fmqlhrhgsormiqmsiafx.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcWxocmhnc29ybWlxbXNpYWZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ0NDAwMSwiZXhwIjoyMDcxMDIwMDAxfQ.psF8dY3VNLUPa8TZU08AVOfZGjZfMQ8fbepjRlWmscQ';

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    this.supabaseUrl = supabaseUrl; // Store Supabase URL

    console.log(`📊 SupabaseStorage initialized with URL: ${this.supabaseUrl ? 'Configured' : 'Not configured'}`);

    // Initialize default trading pairs if none exist
    this.initializeDefaultTradingPairs();
  }

  private async initializeDefaultTradingPairs() {
    try {
      const { data: existingPairs } = await this.supabase
        .from('trading_pairs')
        .select('id')
        .limit(1);

      if (!existingPairs || existingPairs.length === 0) {
        console.log('🔧 Initializing default trading pairs...');

        const defaultPairs = [
          { symbol: "EUR/USD", name: "Euro / US Dollar", base_price: "1.0850", current_price: "1.0850", spread: 0.0002, icon: "EU", color: "#3b82f6", volatility: "0.0001" },
          { symbol: "GBP/USD", name: "British Pound / US Dollar", base_price: "1.2750", current_price: "1.2750", spread: 0.0003, icon: "GB", color: "#ef4444", volatility: "0.0002" },
          { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", base_price: "145.50", current_price: "145.50", spread: 0.05, icon: "JP", color: "#10b981", volatility: "0.0003" },
          { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", base_price: "0.6650", current_price: "0.6650", spread: 0.0002, icon: "AU", color: "#f59e0b", volatility: "0.0002" },
          { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", base_price: "1.3580", current_price: "1.3580", spread: 0.0002, icon: "CA", color: "#8b5cf6", volatility: "0.0001" }
        ];

        for (const pair of defaultPairs) {
          await this.supabase
            .from('trading_pairs')
            .insert({
              ...pair,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }

        console.log('✅ Default trading pairs initialized');
      }
    } catch (error) {
      console.error('Error initializing default trading pairs:', error);
    }
  }

  // User operations
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        total_balance: userData.totalBalance || '100.00',
        trading_balance: userData.tradingBalance || '1000.00',
        profit: userData.profit || '100.00',
        is_admin: userData.isAdmin || false,
        referral_code: userData.referralCode,
        referred_by: userData.referredBy,
        referral_earnings: userData.referralEarnings || '0.00',
        is_quick_trade_locked: userData.isQuickTradeLocked || false,
        is_copy_trading_enabled: userData.isCopyTradingEnabled || false,
        copy_trading_master_user_id: userData.copyTradingMasterUserId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }

    return this.mapUserFromDB(data);
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data ? this.mapUserFromDB(data) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data ? this.mapUserFromDB(data) : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by username:', error);
      return null;
    }

    return data ? this.mapUserFromDB(data) : null;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    return data.map(user => this.mapUserFromDB(user));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const dbUpdates: any = {};

    if (updates.username) dbUpdates.username = updates.username;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.fullName) dbUpdates.full_name = updates.fullName;
    if (updates.totalBalance) dbUpdates.total_balance = updates.totalBalance;
    if (updates.tradingBalance) dbUpdates.trading_balance = updates.tradingBalance;
    if (updates.profit) dbUpdates.profit = updates.profit;
    if (updates.isAdmin !== undefined) dbUpdates.is_admin = updates.isAdmin;
    if (updates.isQuickTradeLocked !== undefined) dbUpdates.is_quick_trade_locked = updates.isQuickTradeLocked;
    if (updates.isCopyTradingEnabled !== undefined) dbUpdates.is_copy_trading_enabled = updates.isCopyTradingEnabled;
    if (updates.copyTradingMasterUserId) dbUpdates.copy_trading_master_user_id = updates.copyTradingMasterUserId;

    const { data, error } = await this.supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return this.mapUserFromDB(data);
  }

  async updateUserBalance(userId: string, totalBalance: string, tradingBalance?: string, profit?: string): Promise<User | null> {
    const updateData: any = {
      total_balance: totalBalance,
      updated_at: new Date().toISOString()
    };

    if (tradingBalance !== undefined) {
      updateData.trading_balance = tradingBalance;
    }

    if (profit !== undefined) {
      updateData.profit = profit;
    }

    const { data, error } = await this.supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user balance:', error);
      return null;
    }

    console.log(`💰 Updated balance for user ${userId}: Total=$${totalBalance}, Trading=$${tradingBalance || 'unchanged'}`);
    return data;
  }

  // Trading Pairs operations - Updated with new columns
  async getAllTradingPairs(): Promise<TradingPair[]> {
    const { data, error } = await this.supabase
      .from('trading_pairs')
      .select(`
        id,
        symbol,
        name,
        base_price,
        current_price,
        spread,
        icon,
        color,
        volatility,
        is_active,
        updated_at
      `)
      .eq('is_active', true)
      .order('symbol');

    if (error) {
      console.error('Error fetching trading pairs:', error);
      return [];
    }

    return data.map(pair => this.mapTradingPairFromDB(pair));
  }

  async updateTradingPair(id: number, updates: { bid_price?: number; ask_price?: number }): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('trading_pairs')
        .update({
          bid_price: updates.bid_price,
          ask_price: updates.ask_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating trading pair:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error updating trading pair:', err);
      return false;
    }
  }

  async getTradingPair(id: string): Promise<TradingPair | null> {
    const { data, error } = await this.supabase
      .from('trading_pairs')
      .select(`
        id,
        symbol,
        name,
        base_price,
        current_price,
        spread,
        icon,
        color,
        volatility,
        is_active,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching trading pair:', error);
      return null;
    }

    return this.mapTradingPairFromDB(data);
  }

  // Trade operations
  async createTrade(tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trade> {
    const { data, error } = await this.supabase
      .from('trades')
      .insert({
        pairid: tradeData.pairId,
        userid: tradeData.userId,
        type: tradeData.type,
        amount: tradeData.amount,
        entryprice: tradeData.entryPrice,
        exitprice: tradeData.exitPrice,
        pnl: tradeData.pnl,
        status: tradeData.status,
        takeprofit: tradeData.takeProfit,
        stoploss: tradeData.stopLoss,
        duration: tradeData.duration,
        isprofit: tradeData.isProfit
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trade:', error);
      throw new Error('Failed to create trade');
    }

    return this.mapTradeFromDB(data);
  }

  async getTrade(id: string): Promise<Trade | null> {
    const { data, error } = await this.supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching trade:', error);
      return null;
    }

    return this.mapTradeFromDB(data);
  }

  async getUserTrades(userId: string): Promise<Trade[]> {
    const { data, error } = await this.supabase
      .from('trades')
      .select('*')
      .eq('userid', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user trades:', error);
      return [];
    }

    return data.map(trade => this.mapTradeFromDB(trade));
  }

  async getAllTrades(): Promise<Trade[]> {
    const { data, error } = await this.supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all trades:', error);
      return [];
    }

    return data.map(trade => this.mapTradeFromDB(trade));
  }

  async closeTrade(id: string, exitPrice: number, pnl: number, isProfit: boolean): Promise<Trade | null> {
    const { data, error } = await this.supabase
      .from('trades')
      .update({
        exitprice: exitPrice.toString(),
        pnl: pnl.toString(),
        isprofit: isProfit,
        status: 'CLOSED'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error closing trade:', error);
      return null;
    }

    return this.mapTradeFromDB(data);
  }

  async updateTradeTPSL(id: string, takeProfit?: string, stopLoss?: string): Promise<Trade | null> {
    const updates: any = {};
    if (takeProfit) updates.takeprofit = takeProfit;
    if (stopLoss) updates.stoploss = stopLoss;

    const { data, error } = await this.supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating trade TP/SL:', error);
      return null;
    }

    return this.mapTradeFromDB(data);
  }

  async getUserTradeCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('userid', userId);

    if (error) {
      console.error('Error fetching user trade count:', error);
      return 0;
    }

    return count || 0;
  }

  // Transaction operations
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'processedAt'>): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert({
        user_id: transactionData.userId,
        type: transactionData.type,
        amount: transactionData.amount,
        method: transactionData.method,
        status: transactionData.status || 'PENDING',
        admin_notes: transactionData.adminNotes,
        processed_by: transactionData.processedBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }

    return this.mapTransactionFromDB(data);
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }

    return data.map(transaction => this.mapTransactionFromDB(transaction));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending transactions:', error);
      return [];
    }

    return data.map(transaction => this.mapTransactionFromDB(transaction));
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching transaction by ID:', error);
      return null;
    }

    return data;
  }

  async updateTransactionStatus(id: string, status: string, adminNotes?: string, processedBy?: string): Promise<Transaction | null> {
    const updates: any = { status };
    if (adminNotes) updates.admin_notes = adminNotes;
    if (processedBy) updates.processed_by = processedBy;

    // Add processed timestamp
    if (status === 'APPROVED' || status === 'REJECTED') {
      updates.processed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction status:', error);
      return null;
    }

    return this.mapTransactionFromDB(data);
  }

  // News operations
  async getAllNews(): Promise<News[]> {
    const { data, error } = await this.supabase
      .from('news')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      return [];
    }

    return data.map(news => this.mapNewsFromDB(news));
  }

  async createNews(newsData: Omit<News, 'id' | 'createdAt'>): Promise<News> {
    const { data, error } = await this.supabase
      .from('news')
      .insert({
        title: newsData.title,
        content: newsData.content,
        type: newsData.type || 'NEWS',
        severity: newsData.severity || 'INFO',
        isactive: newsData.isActive,
        createdby: newsData.createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating news:', error);
      throw new Error('Failed to create news');
    }

    return this.mapNewsFromDB(data);
  }

  async updateNews(id: string, updates: Partial<News>): Promise<News | null> {
    const dbUpdates: any = {};
    if (updates.isActive !== undefined) dbUpdates.isactive = updates.isActive;

    const { data, error } = await this.supabase
      .from('news')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating news:', error);
      return null;
    }

    return this.mapNewsFromDB(data);
  }

  // Conversion operations
  async createConversion(conversionData: Omit<Conversion, 'id' | 'createdAt'>): Promise<Conversion> {
    const { data, error } = await this.supabase
      .from('conversions')
      .insert({
        userid: conversionData.userId,
        fromtype: conversionData.fromType,
        totype: conversionData.toType,
        amount: conversionData.amount
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversion:', error);
      throw new Error('Failed to create conversion');
    }

    return this.mapConversionFromDB(data);
  }

  async getUserConversions(userId: string): Promise<Conversion[]> {
    const { data, error } = await this.supabase
      .from('conversions')
      .select('*')
      .eq('userid', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user conversions:', error);
      return [];
    }

    return data.map(conversion => this.mapConversionFromDB(conversion));
  }

  // Referral operations
  async getUserReferrals(userId: string): Promise<Referral[]> {
    const { data, error } = await this.supabase
      .from('referrals')
      .select('*')
      .eq('referrerid', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user referrals:', error);
      return [];
    }

    return data.map(referral => this.mapReferralFromDB(referral));
  }

  async createReferral(referralData: Omit<Referral, 'id' | 'createdAt'>): Promise<Referral> {
    const { data, error } = await this.supabase
      .from('referrals')
      .insert({
        referrerid: referralData.referrerId,
        refereeid: referralData.refereeId,
        commission: referralData.commission,
        totalearnings: referralData.totalEarnings
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating referral:', error);
      throw new Error('Failed to create referral');
    }

    return this.mapReferralFromDB(referralData);
  }

  async updateReferralEarnings(referrerId: string, additionalEarnings: number): Promise<void> {
    const { error } = await this.supabase.rpc('update_referral_earnings', {
      referrer_id: referrerId,
      additional_earnings: additionalEarnings
    });

    if (error) {
      console.error('Error updating referral earnings:', error);
    }
  }

  // Mapper functions to convert snake_case to camelCase
  private mapUserFromDB(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      password: dbUser.password,
      fullName: dbUser.full_name,
      totalBalance: dbUser.total_balance,
      tradingBalance: dbUser.trading_balance,
      profit: dbUser.profit,
      isAdmin: dbUser.is_admin,
      referralCode: dbUser.referral_code,
      referredBy: dbUser.referred_by,
      referralEarnings: dbUser.referral_earnings,
      isQuickTradeLocked: dbUser.is_quick_trade_locked,
      isCopyTradingEnabled: dbUser.is_copy_trading_enabled,
      copyTradingMasterUserId: dbUser.copy_trading_master_user_id,
      createdAt: new Date(dbUser.created_at || dbUser.createdat),
      updatedAt: new Date(dbUser.updated_at || dbUser.updatedat || dbUser.created_at || dbUser.createdat)
    };
  }

  private mapTradingPairFromDB(dbPair: any): TradingPair {
    return {
      id: dbPair.id,
      symbol: dbPair.symbol,
      name: dbPair.name,
      basePrice: dbPair.base_price || dbPair.baseprice,
      currentPrice: dbPair.current_price || dbPair.currentprice,
      spread: dbPair.spread || "0.0008",
      icon: dbPair.icon,
      color: dbPair.color,
      volatility: dbPair.volatility,
      isActive: dbPair.is_active !== undefined ? dbPair.is_active : dbPair.isactive,
      updatedAt: new Date(dbPair.updated_at || dbPair.updatedat || new Date())
    };
  }

  private mapTradeFromDB(dbTrade: any): Trade {
    return {
      id: dbTrade.id,
      pairId: dbTrade.pairid,
      userId: dbTrade.userid,
      type: dbTrade.type,
      amount: dbTrade.amount,
      entryPrice: dbTrade.entryprice,
      exitPrice: dbTrade.exitprice,
      pnl: dbTrade.pnl,
      status: dbTrade.status,
      takeProfit: dbTrade.takeprofit,
      stopLoss: dbTrade.stoploss,
      duration: dbTrade.duration,
      isProfit: dbTrade.isprofit,
      createdAt: new Date(dbTrade.created_at || dbTrade.createdat),
      updatedAt: new Date(dbTrade.updated_at || dbTrade.updatedat || dbTrade.created_at || dbTrade.createdat)
    };
  }

  private mapTransactionFromDB(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      userId: dbTransaction.user_id || dbTransaction.userid,
      type: dbTransaction.type,
      amount: dbTransaction.amount,
      method: dbTransaction.method,
      status: dbTransaction.status,
      adminNotes: dbTransaction.admin_notes || dbTransaction.adminnotes,
      processedBy: dbTransaction.processed_by || dbTransaction.processedby,
      createdAt: new Date(dbTransaction.created_at || dbTransaction.createdat),
      processedAt: dbTransaction.processed_at ? new Date(dbTransaction.processed_at) : dbTransaction.processedat ? new Date(dbTransaction.processedat) : undefined
    };
  }

  private mapNewsFromDB(dbNews: any): News {
    return {
      id: dbNews.id,
      title: dbNews.title,
      content: dbNews.content,
      type: dbNews.type,
      severity: dbNews.severity,
      isActive: dbNews.isactive,
      createdBy: dbNews.createdby,
      createdAt: new Date(dbNews.created_at || dbNews.createdat)
    };
  }

  private mapConversionFromDB(dbConversion: any): Conversion {
    return {
      id: dbConversion.id,
      userId: dbConversion.userid,
      fromType: dbConversion.fromtype,
      toType: dbConversion.totype,
      amount: dbConversion.amount,
      createdAt: new Date(dbConversion.created_at || dbConversion.createdat)
    };
  }

  private mapReferralFromDB(dbReferral: any): Referral {
    return {
      id: dbReferral.id,
      referrerId: dbReferral.referrerid,
      refereeId: dbReferral.refereeid,
      commission: dbReferral.commission,
      totalEarnings: dbReferral.totalearnings,
      createdAt: new Date(dbReferral.created_at || dbReferral.createdat)
    };
  }
}