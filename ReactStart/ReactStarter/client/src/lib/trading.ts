// Trading result interface
export interface TradeResult {
  isProfit: boolean;
  pnl: number;
  exitPrice: number;
}

// Trading logic implementation - 1 in 3 trades profit
let tradeCounter = 0;

export const executeTrade = (amount: number, type: 'BUY' | 'SELL', entryPrice: number): TradeResult => {
  tradeCounter++;
  
  // Every 3rd trade is profit, others are loss
  const isProfit = tradeCounter % 3 === 0;
  
  // Calculate realistic PnL based on market movements
  const baseReturn = amount * 0.1; // 10% base return
  const variation = (Math.random() - 0.5) * baseReturn * 0.5; // ±25% variation
  
  let pnl: number;
  let exitPrice: number;
  
  if (isProfit) {
    pnl = baseReturn + variation;
    // Fix NaN issue by ensuring proper calculation
    const pnlPercentage = amount > 0 && entryPrice > 0 ? (pnl / amount) : 0.01;
    exitPrice = type === 'BUY' 
      ? entryPrice * (1 + pnlPercentage * 0.01)
      : entryPrice * (1 - pnlPercentage * 0.01);
  } else {
    pnl = -(baseReturn * 0.3 + Math.abs(variation)); // Smaller loss than profit
    const pnlPercentage = amount > 0 && entryPrice > 0 ? (Math.abs(pnl) / amount) : 0.01;
    exitPrice = type === 'BUY'
      ? entryPrice * (1 - pnlPercentage * 0.01)
      : entryPrice * (1 + pnlPercentage * 0.01);
  }
  
  return {
    isProfit,
    pnl: Math.round(pnl * 100) / 100, // Round to 2 decimal places
    exitPrice: Math.round(exitPrice * 100000) / 100000 // Round to 5 decimal places for forex
  };
};

export const validateTradeAmount = (amount: number, tradingBalance: number): boolean => {
  if (tradingBalance <= 0) return false;
  if (amount <= 0) return false;
  if (amount > tradingBalance) return false;
  return true;
};

export const calculateSpread = (basePrice: number, spread: number): { bid: number; ask: number } => {
  const halfSpread = spread / 2;
  return {
    bid: basePrice - halfSpread,
    ask: basePrice + halfSpread
  };
};

export const formatCurrency = (amount: string | number, decimals: number = 2): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};

export const generateReferralCode = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatPrice = (price: string | number, decimals: number = 4): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return num.toFixed(decimals);
};
