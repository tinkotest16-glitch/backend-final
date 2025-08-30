import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertUserSchema, insertTradeSchema, insertTransactionSchema, insertConversionSchema, insertNewsSchema, updateUserSchema } from "@shared/schema";
import { z } from "zod";
import type { User } from "@shared/schema";
import { adminRouter } from "./admin-routes";

// Generate random referral code
function generateReferralCode(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

export function registerRoutes(app: Express): void {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    const isSupabaseConfigured = process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabaseStatus = "not_configured";

    if (isSupabaseConfigured) {
      try {
        const { verifySupabaseConnection } = await import("./verify-supabase");
        const isConnected = await verifySupabaseConnection();
        supabaseStatus = isConnected ? "connected" : "error";
      } catch (error) {
        supabaseStatus = "error";
      }
    }

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      port: process.env.PORT || '5000',
      supabase_status: supabaseStatus,
      environment: process.env.NODE_ENV || 'development',
      session_secret_configured: !!process.env.SESSION_SECRET
    });
  });

  // Authentication routes
  app.get("/api/auth/me", async (req, res) => {
    // For now, return null since we don't have session management
    // This prevents the auth hook from breaking
    res.json({ user: null });
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check for admin user first
      if (email === "z@test.com" && password === "421") {
        const adminUser: User = {
          id: "admin-user-id",
          username: "admin",
          email: "z@test.com",
          password: "421",
          fullName: "Admin User",
          totalBalance: "10000.00",
          tradingBalance: "5000.00",
          profit: "2500.00",
          isAdmin: true,
          referralCode: "ADMIN001",
          referralEarnings: "0.00",
          referredBy: null,
          isQuickTradeLocked: false,
          isCopyTradingEnabled: false,
          copyTradingMasterUserId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return res.json({ user: adminUser });
      }

      // Try to find user by email from Supabase
      let user = await storage.getUserByEmail(email);

      // If no user found, try by username for backward compatibility
      if (!user) {
        user = await storage.getUserByUsername(email);
      }

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // If Supabase is configured, create auth user there too
      if (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false
              }
            }
          );

          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              full_name: userData.fullName,
              username: userData.username
            }
          });

          if (authError) {
            console.error("Supabase Auth error:", authError);
            return res.status(400).json({ message: "Failed to create authentication account" });
          }

          console.log(`✅ Created Supabase Auth user: ${userData.email} with ID: ${authData.user.id}`);

          // Use Supabase user ID for our database
          // userData.id = authData.user.id;
        } catch (supabaseError) {
          console.error("Supabase integration error:", supabaseError);
          // Continue with local storage if Supabase fails
        }
      }

      const user = await storage.createUser({
        ...userData,
        referralCode: generateReferralCode(),
        referredBy: null,
        referralEarnings: "0.00",
        isQuickTradeLocked: false,
        isCopyTradingEnabled: false,
        copyTradingMasterUserId: null
      });

      // Handle referral if provided
      if (req.body.referralCode) {
        const referrer = await storage.getUserByEmail(req.body.referralCode); // Find by referral code
        if (referrer) {
          await storage.createReferral({
            referrerId: referrer.id,
            refereeId: user.id,
            commission: "0.10", // 10% commission
            totalEarnings: "0.00",
          });
        }
      }

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          isAdmin: user.isAdmin,
          totalBalance: user.totalBalance,
          tradingBalance: user.tradingBalance,
          profit: user.profit,
          referralCode: user.referralCode,
          referralEarnings: user.referralEarnings,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    // Simple logout response
    res.json({ message: "Logged out successfully" });
  });

  // User management routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        totalBalance: user.totalBalance,
        tradingBalance: user.tradingBalance,
        profit: user.profit,
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUser(userId, updates);
      const updatedUser = await storage.getUserById(userId);

      res.json(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Quick Trade Lock Management
  app.post("/api/user/:userId/quick-trade-lock", async (req, res) => {
    try {
      const { userId } = req.params;
      const { isLocked } = req.body;

      await storage.updateUser(userId, { isQuickTradeLocked: isLocked });

      res.json({ message: `Quick trade ${isLocked ? 'locked' : 'unlocked'} for user` });
    } catch (error) {
      console.error("Failed to update quick trade lock:", error);
      res.status(500).json({ message: "Failed to update quick trade lock" });
    }
  });

  // Copy Trading Management  
  app.post("/api/user/:userId/copy-trading", async (req, res) => {
    try {
      const { userId } = req.params;
      const { isEnabled } = req.body;

      await storage.updateUser(userId, { isCopyTradingEnabled: isEnabled });

      res.json({ message: `Copy trading ${isEnabled ? 'enabled' : 'disabled'} for user` });
    } catch (error) {
      console.error("Failed to update copy trading:", error);
      res.status(500).json({ message: "Failed to update copy trading" });
    }
  });

  // Trading pairs routes
  app.get("/api/trading-pairs", async (req, res) => {
    try {
      const pairs = await storage.getAllTradingPairs();
      res.json(pairs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/trading-pairs/:id", async (req, res) => {
    try {
      const pair = await storage.getTradingPair(req.params.id);
      if (!pair) {
        return res.status(404).json({ message: "Trading pair not found" });
      }
      res.json(pair);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Trading routes
  app.post("/api/trades", async (req, res) => {
    try {
      // Validate required fields manually first
      const { pairId, type, amount, entryPrice, userId, duration, takeProfit, stopLoss } = req.body;

      if (!pairId || !type || !amount || !entryPrice || !userId) {
        return res.status(400).json({ message: "Missing required fields: pairId, type, amount, entryPrice, userId" });
      }

      const tradeData = {
        pairId,
        type,
        amount: amount.toString(),
        entryPrice: entryPrice.toString(),
        userId,
        duration: duration || 60,
        takeProfit: takeProfit ? takeProfit.toString() : null,
        stopLoss: stopLoss ? stopLoss.toString() : null,
      };

      // Check user's trading balance
      const user = await storage.getUser(tradeData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const tradingBalance = parseFloat(user.tradingBalance);
      const tradeAmount = parseFloat(tradeData.amount);

      if (tradingBalance < tradeAmount) {
        return res.status(400).json({ message: "Insufficient trading balance" });
      }

      if (tradingBalance <= 0) {
        return res.status(400).json({ message: "Cannot trade with zero balance" });
      }

      // Implement 1-in-3 trading logic
      const tradeCount = await storage.getUserTradeCount(user.id);
      const shouldWin = (tradeCount + 1) % 3 === 0;

      let profitPercentage: number;
      let pnl: number;

      if (shouldWin) {
        // Winning trade: 70-85% profit
        profitPercentage = 70 + Math.random() * 15;
        pnl = tradeAmount * (profitPercentage / 100);
      } else {
        // Losing trade: lose 85-100%
        profitPercentage = -(85 + Math.random() * 15);
        pnl = tradeAmount * (profitPercentage / 100);
      }

      // Create trade with predetermined outcome
      const enhancedTradeData = {
        ...tradeData,
        pnl: pnl.toString(),
        isProfit: shouldWin,
        exitPrice: tradeData.entryPrice, // Will be updated when trade closes
        status: "OPEN" as const,
        duration: 60, // Default duration, will be overridden by the trade data's duration if provided
      };

      const newTrade = await storage.createTrade({
        ...enhancedTradeData,
        closedAt: null
      });

      // Deduct trade amount from trading balance
      await storage.updateUserBalance(user.id, undefined, tradingBalance - tradeAmount, undefined);

      // Auto-close trade after specified duration
      setTimeout(async () => {
        try {
          const trade = await storage.getTrade(newTrade.id);
          if (trade && trade.status === "OPEN") {
            // Ensure pnl and exitPrice are correctly set based on the initial calculation or dynamic market data if implemented
            const exitPrice = parseFloat(newTrade.exitPrice || newTrade.entryPrice); // For now, using entry price as exit price if not dynamically set
            const pnlValue = parseFloat(newTrade.pnl || "0");
            const isProfit = newTrade.isProfit ?? false;
            await storage.closeTrade(trade.id, exitPrice, pnlValue, isProfit);

            // Update user balance after closing
            const currentUser = await storage.getUser(user.id);
            if (currentUser) {
              const currentTradingBalance = parseFloat(currentUser.tradingBalance);
              const newTradingBalance = currentTradingBalance + tradeAmount + pnl;
              const newProfit = parseFloat(currentUser.profit) + pnl;
              await storage.updateUserBalance(user.id, undefined, newTradingBalance, newProfit);
            }
          }
        } catch (error) {
          console.error("Error auto-closing trade:", error);
        }
      }, tradeData.duration * 1000); // Use duration from trade data

      res.status(201).json(newTrade);
    } catch (error) {
      console.error("Trade creation error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/trades/user/:userId", async (req, res) => {
    try {
      const trades = await storage.getUserTrades(req.params.userId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/trades/:id/update", async (req, res) => {
    try {
      const { takeProfit, stopLoss } = req.body;

      // Validate the trade exists and is still open
      const existingTrade = await storage.getTrade(req.params.id);
      if (!existingTrade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      if (existingTrade.status !== "OPEN") {
        return res.status(400).json({ message: "Cannot update closed trade" });
      }

      const trade = await storage.updateTradeTPSL(req.params.id, takeProfit, stopLoss);

      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      res.json(trade);
    } catch (error) {
      console.error("Error updating trade TP/SL:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/trades/:id/close", async (req, res) => {
    try {
      const { exitPrice, pnl, isProfit } = req.body;
      const trade = await storage.closeTrade(req.params.id, exitPrice, pnl, isProfit);

      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // Update user's trading balance and profit
      const user = await storage.getUser(trade.userId);
      if (user) {
        const currentTradingBalance = parseFloat(user.tradingBalance);
        const currentProfit = parseFloat(user.profit);
        const tradeAmount = parseFloat(trade.amount);
        const tradePnl = parseFloat(pnl);

        // Return trade amount + PnL to trading balance - Fix NaN issues
        const safeTradeAmount = isNaN(tradeAmount) ? 0 : tradeAmount;
        const safeTradePnl = isNaN(tradePnl) ? 0 : tradePnl;
        const safeTradingBalance = isNaN(currentTradingBalance) ? 0 : currentTradingBalance;
        const safeProfit = isNaN(currentProfit) ? 0 : currentProfit;

        const newTradingBalance = safeTradingBalance + safeTradeAmount + safeTradePnl;
        const newProfit = safeProfit + safeTradePnl;

        await storage.updateUserBalance(user.id, undefined, newTradingBalance, newProfit);

        // Handle referral commission if user was referred
        if (user.referredBy && isProfit) {
          const commission = tradePnl * 0.1; // 10% commission
          await storage.updateReferralEarnings(user.referredBy, commission);
        }
      }

      res.json(trade);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Transaction routes (deposits/withdrawals)
  // Get user transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new transaction (deposit/withdrawal request)
  app.post("/api/transactions", async (req, res) => {
    try {
      const { type, amount, method } = req.body;

      if (!type || !amount || !method) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const transaction = await storage.createTransaction({
        userId: req.user.id,
        type,
        amount: amount.toString(),
        method,
        status: "PENDING"
      });

      console.log(`📊 New ${type} request: $${amount} via ${method} for user ${req.user.email}`);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions/pending", async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/transactions/:id/status", async (req, res) => {
    try {
      const { status, adminNotes, processedBy } = req.body;
      const transaction = await storage.updateTransactionStatus(req.params.id, status, adminNotes, processedBy);

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // If approved, update user's balance
      if (status === "APPROVED") {
        const user = await storage.getUser(transaction.userId);
        if (user) {
          const currentBalance = parseFloat(user.totalBalance);
          const amount = parseFloat(transaction.amount);

          if (transaction.type === "DEPOSIT") {
            await storage.updateUserBalance(user.id, currentBalance + amount, undefined, undefined);
          } else if (transaction.type === "WITHDRAWAL") {
            await storage.updateUserBalance(user.id, Math.max(0, currentBalance - amount), undefined, undefined);
          }
        }
      }

      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Conversion routes
  app.post("/api/conversions", async (req, res) => {
    try {
      const conversionData = insertConversionSchema.parse(req.body);

      // Validate and process conversion
      const user = await storage.getUser(conversionData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const amount = parseFloat(conversionData.amount);
      const totalBalance = parseFloat(user.totalBalance);
      const tradingBalance = parseFloat(user.tradingBalance);
      const profit = parseFloat(user.profit);

      // Validate source balance
      let sourceBalance = 0;
      if (conversionData.fromType === "TOTAL") sourceBalance = totalBalance;
      else if (conversionData.fromType === "TRADING") sourceBalance = tradingBalance;
      else if (conversionData.fromType === "PROFIT") sourceBalance = profit;

      if (sourceBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance for conversion" });
      }

      // Perform conversion
      let newTotalBalance = totalBalance;
      let newTradingBalance = tradingBalance;
      let newProfit = profit;

      // Deduct from source
      if (conversionData.fromType === "TOTAL") newTotalBalance -= amount;
      else if (conversionData.fromType === "TRADING") newTradingBalance -= amount;
      else if (conversionData.fromType === "PROFIT") newProfit -= amount;

      // Add to destination
      if (conversionData.toType === "TOTAL") newTotalBalance += amount;
      else if (conversionData.toType === "TRADING") newTradingBalance += amount;
      else if (conversionData.toType === "PROFIT") newProfit += amount;

      await storage.updateUserBalance(user.id, newTotalBalance, newTradingBalance, newProfit);

      const conversion = await storage.createConversion(conversionData);
      res.status(201).json(conversion);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/conversions/user/:userId", async (req, res) => {
    try {
      const conversions = await storage.getUserConversions(req.params.userId);
      res.json(conversions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const news = await storage.createNews({
        title: req.body.title,
        content: req.body.content,
        createdBy: req.body.createdBy,
        type: req.body.type || "info",
        isActive: req.body.isActive ?? true,
        severity: req.body.severity || null
      });
      res.status(201).json(news);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/news/:id", async (req, res) => {
    try {
      const { isActive } = req.body;
      const news = await storage.updateNews(req.params.id, { isActive });

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      res.json(news);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    try {
      const news = await storage.updateNews(req.params.id, { isActive: false });

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      res.json({ message: "News deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Referral routes
  app.get("/api/referrals/user/:userId", async (req, res) => {
    try {
      const referrals = await storage.getUserReferrals(req.params.userId);
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // This is a placeholder for the referral page navigation fix.
  // In a real application, this would involve routing logic.
  app.get('/api/referral-page-check', (req, res) => {
    res.json({ message: 'Referral page navigation is handled client-side.' });
  });

  // This is a placeholder for the trade history page navigation fix.
  // In a real application, this would involve routing logic.
  app.get('/api/trade-history-page-check', (req, res) => {
    res.json({ message: 'Trade history page navigation is handled client-side.' });
  });


  // Admin routes for user management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      console.log(`👥 Admin fetched ${usersWithoutPasswords.length} users`);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin route to get all transactions with real-time data
  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      console.log(`📊 Admin fetched ${transactions.length} transactions`);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Admin route to toggle user quick trade lock
  app.put("/api/admin/user/:id/quick-trade-lock", async (req, res) => {
    try {
      const { isQuickTradeLocked } = req.body;
      const user = await storage.updateUser(req.params.id, { isQuickTradeLocked });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`🔒 Admin ${isQuickTradeLocked ? 'locked' : 'unlocked'} quick trade for user ${user.username}`);
      res.json({ success: true, isQuickTradeLocked: user.isQuickTradeLocked });
    } catch (error) {
      console.error("Error updating quick trade lock:", error);
      res.status(500).json({ error: "Failed to update quick trade lock" });
    }
  });

  // Admin route to toggle user copy trading
  app.put("/api/admin/user/:id/copy-trading", async (req, res) => {
    try {
      const { isCopyTradingEnabled } = req.body;
      const user = await storage.updateUser(req.params.id, { isCopyTradingEnabled });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`📈 Admin ${isCopyTradingEnabled ? 'enabled' : 'disabled'} copy trading for user ${user.username}`);
      res.json({ success: true, isCopyTradingEnabled: user.isCopyTradingEnabled });
    } catch (error) {
      console.error("Error updating copy trading:", error);
      res.status(500).json({ error: "Failed to update copy trading" });
    }
  });

  // Admin route to get all trades
  app.get("/api/admin/trades", async (req, res) => {
    try {
      const trades = await storage.getAllTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/user/:id/balance", async (req, res) => {
    try {
      const { totalBalance, tradingBalance, profit } = req.body;
      const user = await storage.updateUserBalance(req.params.id, totalBalance, tradingBalance, profit);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        totalBalance: user.totalBalance,
        tradingBalance: user.tradingBalance,
        profit: user.profit,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Admin route to approve transaction and update user balance
  app.post("/api/admin/approve-transaction/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      // Get the transaction first
      const allTransactions = await storage.getAllTransactions();
      const targetTransaction = allTransactions.find(t => t.id === id);

      if (!targetTransaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Update transaction status
      const updatedTransaction = await storage.updateTransactionStatus(
        id,
        "APPROVED",
        adminNotes,
        "admin"
      );

      if (updatedTransaction) {
        const user = await storage.getUser(targetTransaction.userId);
        if (user) {
          const currentTotalBalance = parseFloat(user.totalBalance);
          const currentTradingBalance = parseFloat(user.tradingBalance);
          const transactionAmount = parseFloat(targetTransaction.amount);

          if (targetTransaction.type === "DEPOSIT") {
            // Add to total balance for deposits
            await storage.updateUserBalance(
              targetTransaction.userId,
              currentTotalBalance + transactionAmount,
              currentTradingBalance,
              parseFloat(user.profit)
            );
            console.log(`💰 Added $${transactionAmount} to user ${user.username}'s total balance`);
          } else if (targetTransaction.type === "WITHDRAWAL") {
            // Deduct from total balance for withdrawals
            await storage.updateUserBalance(
              targetTransaction.userId,
              Math.max(0, currentTotalBalance - transactionAmount),
              currentTradingBalance,
              parseFloat(user.profit)
            );
            console.log(`💸 Deducted $${transactionAmount} from user ${user.username}'s total balance`);
          }
        }
      }

      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error approving transaction:", error);
      res.status(500).json({ error: "Failed to approve transaction" });
    }
  });

  // Admin route to reject transaction
  app.post("/api/admin/reject-transaction/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const updatedTransaction = await storage.updateTransactionStatus(
        id,
        "REJECTED",
        adminNotes,
        "admin"
      );

      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      res.status(500).json({ error: "Failed to reject transaction" });
    }
  });


  // Routes registered successfully
}