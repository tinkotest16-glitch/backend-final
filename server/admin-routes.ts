import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage";

export const adminRouter = Router();

// Get all users (admin only)
adminRouter.get("/users", async (req, res) => {
  try {
    const users = await storage.getAllUsers();

    // Also fetch Supabase Auth users
    let authUsers: any[] = [];
    try {
      const { createServerClient } = await import("../client/src/lib/supabase");
      const supabaseAdmin = createServerClient();

      const { data: supabaseUsers, error } = await supabaseAdmin.auth.admin.listUsers();
      if (!error && supabaseUsers) {
        authUsers = supabaseUsers.users.map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          is_supabase_user: true
        }));
      }
    } catch (supabaseError) {
      console.error("Error fetching Supabase users:", supabaseError);
    }

    console.log(`👥 Admin fetched ${users.length} users`);
    res.json({
      database_users: users,
      auth_users: authUsers,
      total_database_users: users.length,
      total_auth_users: authUsers.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete user (admin only)
adminRouter.delete("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow deleting admin users
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Delete user and their data
    await storage.deleteUser(userId);
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Get all transactions (admin only)
adminRouter.get("/transactions", async (req, res) => {
  try {
    const transactions = await storage.getAllTransactions();
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get pending transactions (admin only)
adminRouter.get("/transactions/pending", async (req, res) => {
  try {
    const transactions = await storage.getAllTransactions();
    const pending = transactions.filter(t => t.status === "PENDING");
    res.json(pending);
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update transaction status
adminRouter.put("/transactions/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const transactions = await storage.getAllTransactions();
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Get admin user ID from the authenticated session or use the default admin
    const adminUsers = await storage.getAllUsers();
    const adminUser = adminUsers.find(u => u.email === "z@test.com") || adminUsers.find(u => u.isAdmin);
    const adminUserId = adminUser ? adminUser.id : "system-admin";

    const updatedTransaction = await storage.updateTransactionStatus(id, status, adminNotes, adminUserId);

    // If approved, update user balance
    if (status === "APPROVED") {
      const user = await storage.getUser(transaction.userId);
      if (user) {
        const currentBalance = parseFloat(user.totalBalance);
        const amount = parseFloat(transaction.amount);

        if (transaction.type === "DEPOSIT") {
          await storage.updateUserBalance(
            user.id, 
            currentBalance + amount
          );
          console.log(`💰 Approved deposit: $${amount} for user ${user.email}`);
        } else if (transaction.type === "WITHDRAWAL") {
          await storage.updateUserBalance(
            user.id, 
            currentBalance - amount
          );
          console.log(`💸 Approved withdrawal: $${amount} for user ${user.email}`);
        }
      }
    }

    console.log(`📊 Transaction ${id} ${status.toLowerCase()} by admin`);
    res.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user balance and referral data
adminRouter.put("/user/:id/balance", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      totalBalance, 
      tradingBalance, 
      profit,
      referralCount,
      activeReferrals,
      referralEarnings 
    } = req.body;

    const user = await storage.updateUserBalance(
      id, 
      parseFloat(totalBalance),
      parseFloat(tradingBalance),
      parseFloat(profit),
      referralCount,
      activeReferrals,
      parseFloat(referralEarnings)
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating user balance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete user
adminRouter.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting admin users
    const user = await storage.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Delete user
    await storage.deleteUser(id);

    // Remove from localStorage signup records if exists
    const signupsKey = 'edgemarket_signups';
    const signups = JSON.parse(localStorage.getItem(signupsKey) || '[]');
    const updatedSignups = signups.filter((signup: any) => signup.email !== user.email);
    localStorage.setItem(signupsKey, JSON.stringify(updatedSignups));

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create news/alert
adminRouter.post("/news", async (req, res) => {
  try {
    const { title, content, type, severity } = req.body;

    // Get admin user ID
    const adminUsers = await storage.getAllUsers();
    const adminUser = adminUsers.find(u => u.email === "z@test.com") || adminUsers.find(u => u.isAdmin);
    const adminUserId = adminUser ? adminUser.id : "system-admin";

    const news = await storage.createNews({
      title,
      content,
      type: type || "NEWS",
      severity: severity || "INFO",
      isActive: true,
      createdBy: adminUserId
    });

    console.log(`📢 News created: ${title}`);
    res.json(news);
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update news status
adminRouter.put("/news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const news = await storage.updateNews(id, { isActive });

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.json(news);
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Lock/unlock user quick trading
adminRouter.put("/user/:id/lock", async (req, res) => {
  try {
    const { id } = req.params;
    const { lock } = req.body;

    const user = await storage.updateUser(id, {
      isQuickTradeLocked: lock
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User lock status updated", locked: lock });
  } catch (error) {
    console.error("Error updating user lock status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user statistics
adminRouter.get("/stats", async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    const transactions = await storage.getAllTransactions();
    const news = await storage.getAllNews();

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => !u.isQuickTradeLocked).length,
      pendingTransactions: transactions.filter(t => t.status === "PENDING").length,
      totalDeposits: transactions
        .filter(t => t.type === "DEPOSIT" && t.status === "APPROVED")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      totalWithdrawals: transactions
        .filter(t => t.type === "WITHDRAWAL" && t.status === "APPROVED")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      activeNews: news.filter(n => n.isActive).length
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});