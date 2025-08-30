
import { TradingPair, Trade } from "@shared/schema";

export interface TradingPairWithChange extends TradingPair {
  change?: number;
  changePercent?: string;
  priceDirection?: 'up' | 'down' | 'neutral';
  bidPrice?: string;
  askPrice?: string;
  lastUpdate?: Date;
}

export interface TradeWithCountdown extends Trade {
  countdown?: number;
  timeRemaining?: number;
  isActive?: boolean;
}

export interface LotSizeCalculation {
  standardLot: number;
  miniLot: number;
  microLot: number;
  nanoLot: number;
  pipValue: number;
  marginRequired: number;
}

export interface TradeSettings {
  duration: number; // in seconds
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
}
