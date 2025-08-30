
import { TradingPair } from "@shared/schema";
import { TradingPairWithChange } from "../types/trading";

export interface EnhancedTradingPair extends TradingPairWithChange {
  bidPrice: string;
  askPrice: string;
  spread: string;
  lastUpdate: Date;
}

class PriceSimulator {
  private pairs: Map<string, EnhancedTradingPair> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(pairs: EnhancedTradingPair[]) => void> = new Set();
  private isRunning: boolean = false;

  initialize(tradingPairs: TradingPair[]) {
    tradingPairs.forEach(pair => {
      const basePrice = parseFloat(pair.currentPrice);
      const spread = parseFloat(pair.spread);
      const halfSpread = spread / 2;
      
      this.pairs.set(pair.id, {
        ...pair,
        change: 0,
        changePercent: "0.00",
        priceDirection: 'neutral',
        bidPrice: (basePrice - halfSpread).toFixed(pair.symbol.includes('JPY') ? 2 : 4),
        askPrice: (basePrice + halfSpread).toFixed(pair.symbol.includes('JPY') ? 2 : 4),
        spread: pair.spread,
        lastUpdate: new Date()
      });
    });
    
    this.startSimulation();
  }

  subscribe(callback: (pairs: EnhancedTradingPair[]) => void) {
    this.subscribers.add(callback);
    
    // Send initial data
    if (this.pairs.size > 0) {
      callback(Array.from(this.pairs.values()));
    }
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private startSimulation() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.isRunning = true;
    // Update prices every 1.5 seconds for more realistic simulation
    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, 1500);
  }

  private updatePrices() {
    if (!this.isRunning) return;

    const updatedPairs: EnhancedTradingPair[] = [];

    this.pairs.forEach((pair, id) => {
      const volatility = parseFloat(pair.volatility);
      const currentPrice = parseFloat(pair.currentPrice);
      const spread = parseFloat(pair.spread);
      
      // Generate more realistic price movement with trend bias
      const trendBias = (Math.random() - 0.5) * 0.1; // Small trend bias
      const randomComponent = (Math.random() - 0.5) * volatility * 2;
      const change = trendBias + randomComponent;
      
      const newPrice = Math.max(0.0001, currentPrice + change);
      
      // Calculate bid and ask prices
      const halfSpread = spread / 2;
      const bidPrice = newPrice - halfSpread;
      const askPrice = newPrice + halfSpread;
      
      // Calculate change percentage
      const changePercent = ((change / currentPrice) * 100).toFixed(2);
      
      // Determine price direction
      let priceDirection: 'up' | 'down' | 'neutral' = 'neutral';
      const threshold = 0.00001;
      if (change > threshold) priceDirection = 'up';
      else if (change < -threshold) priceDirection = 'down';

      const updatedPair: EnhancedTradingPair = {
        ...pair,
        currentPrice: newPrice.toString(),
        bidPrice: bidPrice.toFixed(pair.symbol.includes('JPY') ? 2 : 4),
        askPrice: askPrice.toFixed(pair.symbol.includes('JPY') ? 2 : 4),
        change,
        changePercent,
        priceDirection,
        lastUpdate: new Date()
      };

      this.pairs.set(id, updatedPair);
      updatedPairs.push(updatedPair);
    });

    // Notify all subscribers with updated data
    this.subscribers.forEach(callback => {
      try {
        callback(updatedPairs);
      } catch (error) {
        console.error('Error in price simulation callback:', error);
      }
    });
  }

  stop() {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  restart() {
    this.stop();
    this.startSimulation();
  }

  getPair(id: string): EnhancedTradingPair | undefined {
    return this.pairs.get(id);
  }

  getAllPairs(): EnhancedTradingPair[] {
    return Array.from(this.pairs.values());
  }

  updatePairPrice(id: string, price: number) {
    const pair = this.pairs.get(id);
    if (pair) {
      const spread = parseFloat(pair.spread);
      const halfSpread = spread / 2;
      
      this.pairs.set(id, {
        ...pair,
        currentPrice: price.toString(),
        bidPrice: (price - halfSpread).toFixed(pair.symbol.includes('JPY') ? 2 : 4),
        askPrice: (price + halfSpread).toFixed(pair.symbol.includes('JPY') ? 2 : 4),
        lastUpdate: new Date()
      });
    }
  }
}

export const priceSimulator = new PriceSimulator();
