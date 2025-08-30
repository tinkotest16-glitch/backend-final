import { useState, useEffect } from "react";
import { TradingPair } from "@shared/schema";
import { TradingPairWithChange } from "@/types/trading";
import { priceSimulator, EnhancedTradingPair } from "@/lib/price-simulation";

export function usePriceSimulation(tradingPairs?: TradingPair[]): EnhancedTradingPair[] {
  const [pairs, setPairs] = useState<EnhancedTradingPair[]>([]);

  useEffect(() => {
    if (tradingPairs && tradingPairs.length > 0) {
      priceSimulator.initialize(tradingPairs);

      const unsubscribe = priceSimulator.subscribe((updatedPairs) => {
        setPairs(updatedPairs);
      });

      return () => {
        unsubscribe();
        priceSimulator.stop();
      };
    }
  }, [tradingPairs]);

  return pairs;
}

export function useLivePrices() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Update timestamp every minute to show "live" status
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatLastUpdate = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  return {
    lastUpdate: formatLastUpdate(),
    isLive: true
  };
}