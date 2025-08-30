import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  totalBalance: decimal("total_balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  tradingBalance: decimal("trading_balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  profit: decimal("profit", { precision: 15, scale: 2 }).notNull().default("0.00"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: uuid("referred_by").references((): any => users.id),
  referralEarnings: decimal("referral_earnings", { precision: 15, scale: 2 }).notNull().default("0.00"),
  isQuickTradeLocked: boolean("is_quick_trade_locked").notNull().default(false),
  isCopyTradingEnabled: boolean("is_copy_trading_enabled").notNull().default(false),
  copyTradingMasterUserId: uuid("copy_trading_master_user_id").references((): any => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Trading pairs table
export const tradingPairs = pgTable("trading_pairs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull().unique(), // e.g., "EUR/USD"
  name: text("name").notNull(), // e.g., "Euro / US Dollar"
  basePrice: decimal("base_price", { precision: 15, scale: 8 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 8 }).notNull(),
  spread: decimal("spread", { precision: 6, scale: 4 }).notNull().default("0.0008"),
  isActive: boolean("is_active").notNull().default(true),
  icon: text("icon").notNull(), // Icon abbreviation like "EU"
  color: text("color").notNull().default("#3b82f6"), // Color for UI
  volatility: decimal("volatility", { precision: 8, scale: 6 }).notNull().default("0.0001"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Trades table
export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  pairId: uuid("pair_id").notNull().references(() => tradingPairs.id),
  type: text("type").notNull(), // "BUY" or "SELL"
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 15, scale: 8 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 15, scale: 8 }),
  pnl: decimal("pnl", { precision: 15, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("OPEN"), // "OPEN", "CLOSED"
  isProfit: boolean("is_profit"),
  duration: integer("duration").default(60), // Duration in seconds
  takeProfit: decimal("take_profit", { precision: 15, scale: 8 }), // TP price simulation
  stopLoss: decimal("stop_loss", { precision: 15, scale: 8 }), // SL price simulation
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  closedAt: timestamp("closed_at"),
});

// Deposit/Withdrawal requests
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "DEPOSIT", "WITHDRAWAL"
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull(), // "BTC", "ETH", "USDT", etc.
  method: text("method").notNull().default("CRYPTO"), // Always "CRYPTO" for crypto-only system
  walletAddress: text("wallet_address"), // Destination address for withdrawals, source for deposits
  txHash: text("tx_hash"), // Transaction hash for verification
  status: text("status").notNull().default("PENDING"), // "PENDING", "APPROVED", "REJECTED"
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  processedAt: timestamp("processed_at"),
  processedBy: uuid("processed_by").references(() => users.id),
});

// Balance conversions
export const conversions = pgTable("conversions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  fromType: text("from_type").notNull(), // "TOTAL", "TRADING", "PROFIT"
  toType: text("to_type").notNull(), // "TOTAL", "TRADING", "PROFIT"
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Market news and alerts
export const news = pgTable("news", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("NEWS"), // "NEWS", "ALERT"
  severity: text("severity").default("INFO"), // "INFO", "WARNING", "CRITICAL"
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Referral tracking
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: uuid("referrer_id").notNull().references(() => users.id),
  refereeId: uuid("referee_id").notNull().references(() => users.id),
  commission: decimal("commission", { precision: 15, scale: 2 }).notNull().default("0.00"),
  totalEarnings: decimal("total_earnings", { precision: 15, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Price history for charts
export const priceHistory = pgTable("price_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pairId: uuid("pair_id").notNull().references(() => tradingPairs.id),
  price: decimal("price", { precision: 15, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

// Wallet addresses for crypto deposits/withdrawals
export const walletAddresses = pgTable("wallet_addresses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  currency: text("currency").notNull().unique(),
  address: text("address").notNull(),
  network: text("network").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  referralCode: true,
  referredBy: true,
  referralEarnings: true,
  isQuickTradeLocked: true,
  isCopyTradingEnabled: true,
  copyTradingMasterUserId: true,
});

// Trading pairs are read-only - no insert schema needed

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  closedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  processedAt: true,
  processedBy: true,
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
  timestamp: true,
});

export const insertWalletAddressSchema = createInsertSchema(walletAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Update user schema
export const updateUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  isQuickTradeLocked: z.boolean().optional(),
  isCopyTradingEnabled: z.boolean().optional(),
  copyTradingMasterUserId: z.string().uuid().nullable().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TradingPair = typeof tradingPairs.$inferSelect;
// Trading pairs are read-only - no insert type needed
export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type WalletAddress = typeof walletAddresses.$inferSelect;
export type InsertWalletAddress = z.infer<typeof insertWalletAddressSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;