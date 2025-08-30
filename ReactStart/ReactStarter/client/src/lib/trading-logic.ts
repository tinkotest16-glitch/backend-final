// Trading Logic Implementation - 1 in 3 trades wins
let tradeCounter = 0;

export interface TradeOutcome {
  isProfit: boolean;
  multiplier: number;
  profitPercentage: number;
}

export function determineTradeOutcome(): TradeOutcome {
  tradeCounter++;
  
  // 1 in 3 trades should be profit
  const shouldWin = tradeCounter % 3 === 0;
  
  if (shouldWin) {
    // Winning trade - 70-85% profit
    const profitPercentage = 70 + Math.random() * 15;
    return {
      isProfit: true,
      multiplier: 1 + (profitPercentage / 100),
      profitPercentage
    };
  } else {
    // Losing trade - lose 85-100% of investment
    const lossPercentage = 85 + Math.random() * 15;
    return {
      isProfit: false,
      multiplier: 1 - (lossPercentage / 100),
      profitPercentage: -lossPercentage
    };
  }
}

export function calculateTradePnL(amount: number, outcome: TradeOutcome): number {
  return amount * (outcome.multiplier - 1);
}

export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
}