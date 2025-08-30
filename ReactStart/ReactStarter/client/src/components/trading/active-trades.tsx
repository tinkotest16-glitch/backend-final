import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Edit2, Check, X, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Trade, TradingPair } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatPrice } from "@/lib/utils";

interface ActiveTradesProps {
  userId: string;
}

export function ActiveTrades({ userId }: ActiveTradesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTrade, setEditingTrade] = useState<string | null>(null);
  const [tempTP, setTempTP] = useState("");
  const [tempSL, setTempSL] = useState("");

  // Get active trades
  const { data: activeTrades, isLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades/user", userId],
    select: (trades) => trades?.filter(trade => trade.status === "OPEN") || [],
    refetchInterval: 1000, // Refresh every second for real-time updates
  });

  // Get trading pairs for display
  const { data: tradingPairs } = useQuery<TradingPair[]>({
    queryKey: ["/api/trading-pairs"],
  });

  // Update TP/SL mutation
  const updateTradeMutation = useMutation({
    mutationFn: async ({ tradeId, takeProfit, stopLoss }: {
      tradeId: string;
      takeProfit?: string;
      stopLoss?: string;
    }) => {
      const response = await apiRequest("PUT", `/api/trades/${tradeId}/update`, {
        takeProfit,
        stopLoss,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update trade");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades/user", userId] });
      setEditingTrade(null);
      setTempTP("");
      setTempSL("");
      toast({
        title: "Trade Updated",
        description: "TP/SL levels updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update TP/SL levels",
        variant: "destructive",
      });
    },
  });

  const handleEditStart = (trade: Trade) => {
    setEditingTrade(trade.id);
    setTempTP(trade.takeProfit || "");
    setTempSL(trade.stopLoss || "");
  };

  const handleSaveEdit = (tradeId: string) => {
    updateTradeMutation.mutate({
      tradeId,
      takeProfit: tempTP || undefined,
      stopLoss: tempSL || undefined,
    });
  };

  const handleCancelEdit = () => {
    setEditingTrade(null);
    setTempTP("");
    setTempSL("");
  };

  // Calculate remaining time for each trade - Fixed to 300 seconds (5 minutes)
  const getTradeRemainingTime = (trade: Trade) => {
    const createdTime = new Date(trade.createdAt).getTime();
    const currentTime = Date.now();
    const elapsed = Math.floor((currentTime - createdTime) / 1000);
    const duration = 3600; // 3600 seconds (60 minutes) duration
    const remaining = Math.max(0, duration - elapsed);
    return remaining;
  };

  // Auto close trades when timer reaches zero
  React.useEffect(() => {
    if (!activeTrades || activeTrades.length === 0) return;

    const checkTradeExpiry = () => {
      activeTrades.forEach(trade => {
        const remaining = getTradeRemainingTime(trade);
        if (remaining === 0) {
          handleCloseTrade(trade.id, "Time expired");
        }
      });
    };

    const interval = setInterval(checkTradeExpiry, 1000);
    return () => clearInterval(interval);
  }, [activeTrades]);

  const handleCloseTrade = async (tradeId: string, reason: string) => {
    try {
      await apiRequest("POST", `/api/trades/${tradeId}/close`, { reason });
      queryClient.invalidateQueries({ queryKey: ["/api/trades/user", userId] });
      toast({
        title: "Trade Closed",
        description: `Trade ${tradeId} closed due to ${reason}.`,
      });
    } catch (error: any) {
      toast({
        title: "Close Trade Failed",
        description: error.message || "Failed to close trade",
        variant: "destructive",
      });
    }
  };


  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Active Trades</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="spinner w-6 h-6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Active Trades ({activeTrades?.length || 0})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activeTrades || activeTrades.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No active trades</p>
            <p className="text-sm mt-2">Your open trades will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTrades.map((trade) => {
              const pair = tradingPairs?.find(p => p.id === trade.pairId);
              const isEditing = editingTrade === trade.id;
              const remainingTime = getTradeRemainingTime(trade);

              return (
                <div key={trade.id} className="bg-trading-primary rounded-lg p-4 border border-trading-border">
                  {/* Trade Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {trade.type === 'BUY' ? (
                          <TrendingUp className="h-4 w-4 mr-2 text-trading-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-2 text-trading-danger" />
                        )}
                        <span className="text-white font-medium">{pair?.symbol}</span>
                      </div>
                      <Badge className={`font-bold ${
                        trade.type === 'BUY' ? 'bg-trading-success' : 'bg-trading-danger'
                      }`}>
                        {trade.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{formatCurrency(parseFloat(trade.amount))}</div>
                      <div className="text-xs text-gray-400">
                        Entry: {formatPrice(parseFloat(trade.entryPrice), 4)}
                      </div>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-trading-accent">
                          {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-trading-muted">Time Remaining</div>
                      </div>
                    </div>
                  </div>

                  {/* TP/SL Section */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-400 flex items-center justify-between">
                          Take Profit
                          {!isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStart(trade)}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </Label>
                        {isEditing ? (
                          <Input
                            value={tempTP}
                            onChange={(e) => setTempTP(e.target.value)}
                            placeholder="Enter TP level"
                            className="trading-input mt-1 h-8 text-sm"
                            type="number"
                            step="0.0001"
                          />
                        ) : (
                          <div className="text-trading-success text-sm mt-1 font-medium">
                            {trade.takeProfit ? formatPrice(parseFloat(trade.takeProfit), 4) : "Not set"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs text-gray-400">Stop Loss</Label>
                        {isEditing ? (
                          <Input
                            value={tempSL}
                            onChange={(e) => setTempSL(e.target.value)}
                            placeholder="Enter SL level"
                            className="trading-input mt-1 h-8 text-sm"
                            type="number"
                            step="0.0001"
                          />
                        ) : (
                          <div className="text-trading-danger text-sm mt-1 font-medium">
                            {trade.stopLoss ? formatPrice(parseFloat(trade.stopLoss), 4) : "Not set"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Edit Controls */}
                    {isEditing && (
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="border-trading-border h-8 px-3"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(trade.id)}
                          className="trading-button-primary h-8 px-3"
                          disabled={updateTradeMutation.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {updateTradeMutation.isPending ? "Updating..." : "Update"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Current Status */}
                  <div className="mt-3 pt-3 border-t border-trading-border">
                    <div className="flex justify-between items-center text-xs text-trading-muted">
                      <span>Status: <span className="text-trading-accent">ACTIVE</span></span>
                      <span>Duration: 3600s (60 min)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}