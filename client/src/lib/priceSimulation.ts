// Price simulation utility for trading pairs
export class PriceSimulation {
  private basePrice: number;
  private volatility: number;
  private trend: number = 0;

  constructor(basePrice: number, volatility: number = 0.0001) {
    this.basePrice = basePrice;
    this.volatility = volatility;
  }

  generatePrice(): number {
    // Random walk with some trend
    const random = (Math.random() - 0.5) * 2; // -1 to 1
    const change = random * this.volatility;
    
    // Add small trend component
    this.trend += (Math.random() - 0.5) * 0.00001;
    this.trend = Math.max(-0.0005, Math.min(0.0005, this.trend)); // Limit trend
    
    this.basePrice += this.basePrice * (change + this.trend);
    
    // Prevent negative prices
    this.basePrice = Math.max(0.00001, this.basePrice);
    
    return this.basePrice;
  }

  setBasePrice(price: number) {
    this.basePrice = price;
  }

  getBasePrice(): number {
    return this.basePrice;
  }
}

// Trading logic utilities
export class TradingLogic {
  private tradeCount: number = 0;
  private readonly profitRatio: number = 0.33; // 1 in 3 trades should be profitable

  shouldTradeProfit(): boolean {
    this.tradeCount++;
    // Simple pattern: every 3rd trade is profitable on average
    const random = Math.random();
    return random < this.profitRatio;
  }

  calculateProfitPercentage(isProfit: boolean): number {
    if (isProfit) {
      // Winning trades: 70-85% profit
      return 70 + Math.random() * 15;
    } else {
      // Losing trades: lose 85-100%
      return -(85 + Math.random() * 15);
    }
  }

  getTradeCount(): number {
    return this.tradeCount;
  }

  resetTradeCount(): void {
    this.tradeCount = 0;
  }
}

export const tradingLogic = new TradingLogic();