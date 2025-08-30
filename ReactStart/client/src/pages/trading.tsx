import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTradingPairs } from "@/hooks/use-trading";
import { usePriceSimulation } from "@/hooks/use-prices";
import TradingPairs from "@/components/trading/trading-pairs";
import { QuickTrade } from "@/components/trading/quick-trade";
import { EnhancedChartPreview } from "@/components/charts/enhanced-chart-preview";
import { ActiveTrades } from "@/components/trading/active-trades";
import { TradingHistory } from "@/components/trading/trading-history";
import { Layout } from "@/components/layout/layout";
import { EnhancedTradingPair } from "@/lib/price-simulation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Trading() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPairId, setSelectedPairId] = useState<string>("");

  const { data: tradingPairs, isLoading: pairsLoading } = useTradingPairs();
  const simulatedPairs = usePriceSimulation(tradingPairs);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trading-primary flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedPair = simulatedPairs.find(pair => pair.id === selectedPairId) || simulatedPairs[0];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between mb-4 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-trading-text">Trading</h1>
          <Button 
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="border-trading-border hover:bg-trading-secondary text-trading-text"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* 1. Trading Pair Container */}
        <div className="w-full">
          <TradingPairs 
            pairs={simulatedPairs}
            selectedPairId={selectedPairId}
            onSelectPair={setSelectedPairId}
            isLoading={pairsLoading}
          />
        </div>

        {/* 2. Current Price Chart */}
        {selectedPair && (
          <div className="w-full">
            <EnhancedChartPreview
              pair={selectedPair}
              className="w-full h-64 lg:h-80"
            />
          </div>
        )}

        {/* 3. Quick Trade Container */}
        <div id="quick-trade" className="w-full">
          <QuickTrade 
            selectedPair={selectedPair}
            userId={user.id}
            tradingBalance={parseFloat(user.tradingBalance)}
          />
        </div>

        {/* 4. Active Trade Container */}
        <div className="w-full">
          <ActiveTrades userId={user.id} />
        </div>

        {/* 5. Trading History Section */}
        <div className="w-full">
          <TradingHistory userId={user.id} />
        </div>
      </div>
    </Layout>
  );
}