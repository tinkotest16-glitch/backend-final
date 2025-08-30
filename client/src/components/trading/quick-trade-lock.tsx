import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Lock, Clock, TrendingUp, X, Activity } from "lucide-react";

interface ActiveQuickTrade {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  amount: string;
  duration: number; // in minutes
  startTime: Date;
  entryPrice: string;
  currentPrice: string;
  pnl: number;
  status: "ACTIVE" | "COMPLETED";
}

export function QuickTradeLock() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTrades, setActiveTrades] = useState<ActiveQuickTrade[]>([]);

  // Initialize with sample active quick trades for demonstration
  useEffect(() => {
    if (user) {
      const sampleTrades: ActiveQuickTrade[] = [
        {
          id: "qt1",
          pair: "EUR/USD",
          type: "BUY",
          amount: "100.00",
          duration: 15, // 15 minutes default
          startTime: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
          entryPrice: "1.0856",
          currentPrice: "1.0863",
          pnl: 6.45,
          status: "ACTIVE"
        },
        {
          id: "qt2",
          pair: "GBP/USD", 
          type: "SELL",
          amount: "150.00",
          duration: 15,
          startTime: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
          entryPrice: "1.2443",
          currentPrice: "1.2438",
          pnl: 0.60,
          status: "ACTIVE"
        }
      ];
      
      setActiveTrades(sampleTrades);
    }
  }, [user]);

  // Calculate remaining time for a trade
  const getRemainingTime = (trade: ActiveQuickTrade) => {
    const elapsed = Date.now() - trade.startTime.getTime();
    const remaining = Math.max(0, (trade.duration * 60 * 1000) - elapsed);
    return Math.floor(remaining / 1000); // in seconds
  };

  // Calculate progress percentage
  const getProgress = (trade: ActiveQuickTrade) => {
    const elapsed = Date.now() - trade.startTime.getTime();
    const total = trade.duration * 60 * 1000;
    return Math.min(100, (elapsed / total) * 100);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Close trade manually
  const closeTrade = (tradeId: string) => {
    setActiveTrades(prev => prev.filter(t => t.id !== tradeId));
    toast({ title: "Trade Closed", description: "Quick trade closed successfully" });
  };

  // Auto-update countdown timers and prices
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev =>
        prev.map(trade => {
          const remaining = getRemainingTime(trade);
          
          // Simulate price updates (small random changes)
          const priceChange = (Math.random() - 0.5) * 0.0010; // ±0.5 pips
          const currentPrice = (parseFloat(trade.currentPrice) + priceChange).toFixed(4);
          
          // Calculate PnL based on price movement
          const entryPrice = parseFloat(trade.entryPrice);
          const currentPriceNum = parseFloat(currentPrice);
          const priceDiff = trade.type === "BUY" ? (currentPriceNum - entryPrice) : (entryPrice - currentPriceNum);
          const pnl = (priceDiff / entryPrice) * parseFloat(trade.amount);

          if (remaining <= 0 && trade.status === "ACTIVE") {
            // Trade completed
            toast({
              title: "Quick Trade Completed",
              description: `${trade.pair} ${trade.type} trade finished with ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} P&L`
            });
            return { ...trade, status: "COMPLETED" as const, pnl };
          }
          
          return { ...trade, currentPrice, pnl };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [toast]);

  const activeTradesCount = activeTrades.filter(t => t.status === "ACTIVE").length;

  if (!user || activeTradesCount === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-600" />
          Active Quick Trades
        </CardTitle>
        <CardDescription>
          You have {activeTradesCount} active quick trades running
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTrades.filter(t => t.status === "ACTIVE").map(trade => {
          const remainingSeconds = getRemainingTime(trade);
          const progress = getProgress(trade);
          
          return (
            <div key={trade.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={trade.type === "BUY" ? "default" : "secondary"}>
                    {trade.type}
                  </Badge>
                  <span className="font-semibold">{trade.pair}</span>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ${trade.amount}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Entry: </span>
                  <span className="font-mono">{trade.entryPrice}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Current: </span>
                  <span className="font-mono">{trade.currentPrice}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time Remaining
                  </span>
                  <span className="font-mono text-orange-600">{formatTime(remainingSeconds)}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => closeTrade(trade.id)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Close Trade
                </Button>
              </div>
            </div>
          );
        })}
        
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded">
          <Lock className="w-4 h-4 inline mr-1" />
          New trades are locked while you have active positions
        </div>
      </CardContent>
    </Card>
  );
}