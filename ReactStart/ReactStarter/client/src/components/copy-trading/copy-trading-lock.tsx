import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, TrendingUp, Clock, DollarSign, X } from "lucide-react";

interface CopyTrade {
  id: string;
  masterTrader: string;
  amount: string;
  duration: number; // in minutes
  startTime: Date;
  currentReturn: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export function CopyTradingLock() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTrades, setActiveTrades] = useState<CopyTrade[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize with sample active trades for demonstration
  useEffect(() => {
    if (user) {
      const sampleTrades: CopyTrade[] = [
        {
          id: "ct1",
          masterTrader: "ProTrader_Alex",
          amount: "850.00",
          duration: 30, // 30 minutes
          startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          currentReturn: 12.5,
          status: "ACTIVE"
        },
        {
          id: "ct2", 
          masterTrader: "ForexMaster_Sarah",
          amount: "1200.00",
          duration: 60, // 1 hour
          startTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          currentReturn: -3.2,
          status: "ACTIVE"
        }
      ];
      
      setActiveTrades(sampleTrades);
      setIsLocked(sampleTrades.length > 0);
    }
  }, [user]);

  // Calculate remaining time for a trade
  const getRemainingTime = (trade: CopyTrade) => {
    const elapsed = Date.now() - trade.startTime.getTime();
    const remaining = Math.max(0, (trade.duration * 60 * 1000) - elapsed);
    return Math.floor(remaining / 1000); // in seconds
  };

  // Calculate progress percentage
  const getProgress = (trade: CopyTrade) => {
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

  const cancelTradeMutation = useMutation({
    mutationFn: async (tradeId: string) => {
      return apiRequest("DELETE", `/api/copy-trading/${tradeId}`);
    },
    onSuccess: (_, tradeId) => {
      setActiveTrades(prev => prev.filter(t => t.id !== tradeId));
      toast({ title: "Success", description: "Copy trade cancelled successfully" });
      
      // Check if no more active trades to unlock
      const remaining = activeTrades.filter(t => t.id !== tradeId);
      if (remaining.length === 0) {
        setIsLocked(false);
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to cancel trade", variant: "destructive" });
    }
  });

  // Auto-update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev => 
        prev.map(trade => {
          const remaining = getRemainingTime(trade);
          if (remaining <= 0 && trade.status === "ACTIVE") {
            // Trade completed
            toast({ 
              title: "Copy Trade Completed", 
              description: `Trade with ${trade.masterTrader} has finished with ${trade.currentReturn > 0 ? '+' : ''}${trade.currentReturn.toFixed(1)}% return` 
            });
            return { ...trade, status: "COMPLETED" as const };
          }
          return trade;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Lock Status Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLocked ? <Lock className="w-5 h-5 text-blue-600" /> : <Unlock className="w-5 h-5 text-green-600" />}
            Copy Trading Status
          </CardTitle>
          <CardDescription>
            {isLocked 
              ? `You have ${activeTrades.filter(t => t.status === "ACTIVE").length} active copy trades running`
              : "No active copy trades - you can start new trades"
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Active Trades */}
      {activeTrades.filter(t => t.status === "ACTIVE").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Copy Trades</CardTitle>
            <CardDescription>Monitor your ongoing copy trading positions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTrades.filter(t => t.status === "ACTIVE").map(trade => {
              const remainingSeconds = getRemainingTime(trade);
              const progress = getProgress(trade);
              
              return (
                <div key={trade.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{trade.masterTrader}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Investment: ${trade.amount}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${trade.currentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.currentReturn >= 0 ? '+' : ''}{trade.currentReturn.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ${(parseFloat(trade.amount) * (1 + trade.currentReturn / 100)).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Time Remaining
                      </span>
                      <span className="font-mono">{formatTime(remainingSeconds)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={trade.currentReturn >= 0 ? "default" : "destructive"}>
                      {trade.currentReturn >= 0 ? "Profitable" : "Loss"}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cancelTradeMutation.mutate(trade.id)}
                      disabled={cancelTradeMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel Trade
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Investment Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Investment Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span>Minimum Investment</span>
              <span className="font-semibold">$800</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span>Maximum Investment</span>
              <span className="font-semibold">$10,000</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span>Maximum Active Trades</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              * While you have active copy trades, new trading is temporarily locked for risk management
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lock Override (Admin/Debug) */}
      {user?.isAdmin && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => {
                setIsLocked(!isLocked);
                setActiveTrades([]);
                toast({ title: "Lock Status Changed", description: `Copy trading ${isLocked ? 'unlocked' : 'locked'}` });
              }}
              className="mr-2"
            >
              {isLocked ? "Force Unlock" : "Force Lock"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setActiveTrades([]);
                setIsLocked(false);
                toast({ title: "All Trades Cleared", description: "All copy trades have been cleared" });
              }}
            >
              Clear All Trades
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}