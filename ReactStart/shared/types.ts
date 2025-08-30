export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  isAdmin: boolean;
  totalBalance: string;
  tradingBalance: string;
  profit: string;
  referralCode: string;
  referredBy?: string | null;
  referralEarnings: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradingPair {
  id: string;
  symbol: string;
  name: string;
  basePrice: string;
  currentPrice: string;
  spread: string;
  isActive: boolean;
  icon: string;
  color: string;
  volatility: string;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  userId: string;
  pairId: string;
  type: string;
  amount: string;
  entryPrice: string;
  exitPrice: string | null;
  pnl: string | null;
  status: string;
  isProfit: boolean | null;
  duration: number | null;
  createdAt: Date;
  closedAt: Date | null;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: string;
  method: string;
  status: string;
  adminNotes: string | null;
  createdAt: Date;
  processedAt: Date | null;
  processedBy: string | null;
}

export interface Conversion {
  id: string;
  userId: string;
  fromType: string;
  toType: string;
  amount: string;
  createdAt: Date;
}

export interface News {
  id: string;
  title: string;
  content: string;
  type: string;
  severity: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  commission: string;
  totalEarnings: string;
  createdAt: Date;
}

export interface PriceHistory {
  id: string;
  pairId: string;
  price: string;
  timestamp: Date;
}