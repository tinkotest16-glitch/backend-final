import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { formatPrice, formatCurrency } from "@/lib/format";

interface QuickTradeProps {
  selectedPair?: any;
  userId: string;
  tradingBalance: number;
}

interface ActiveTrade {
  id: string;
  type: 'BUY' | 'SELL';
  duration: number;      // seconds
  startTime: number;     // ms epoch
  amount: string;
  entryPrice: number;
  pair: any;
  remainingTime?: number; // seconds
}

export function QuickTrade({ selectedPair, userId, tradingBalance }: QuickTradeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState<string>("300"); // Default 5 minutes
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);

  const tradeMutation = useMutation({
    mutationFn: async (variables: any) => {
      const response = await apiRequest("POST", "/api/trades", variables);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Trade Opened",
        description: `Successfully opened ${data.type} trade for ${data.amount}`,
      });
      queryClient.invalidateQueries({ queryKey: ['tradingHistory'] });
      setAmount("");
      setTakeProfit("");
      setStopLoss("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateTradeAmount = (amt: number, balance: number) => {
    return amt > 0 && amt <= balance;
  };

  const calculateLotInfo = (amt: string, basePrice: number) => {
    const tradeAmount = parseFloat(amt || "0");
    const lotSize = basePrice > 0 ? tradeAmount / basePrice : 0;

    return {
      standardLot: lotSize.toFixed(2),
      miniLot: (lotSize / 10).toFixed(2),
      microLot: (lotSize / 100).toFixed(2),
      pipValue: selectedPair?.symbol?.includes('JPY')
        ? (tradeAmount / (basePrice || 1) * 0.01).toFixed(2)
        : (tradeAmount * 0.0001).toFixed(2),
      marginRequired: (tradeAmount * 0.01).toFixed(2),
    };
  };

  const handleTrade = (type: 'BUY' | 'SELL') => {
    if (!selectedPair || !amount) {
      toast({ title: "Error", description: "Please enter an amount.", variant: "destructive" });
      return;
    }

    const tradeAmount = parseFloat(amount);
    if (!validateTradeAmount(tradeAmount, tradingBalance)) {
      toast({ title: "Error", description: "Invalid trade amount or insufficient balance.", variant: "destructive" });
      return;
    }

    const entryPrice = type === 'BUY'
      ? parseFloat(selectedPair.askPrice || selectedPair.currentPrice)
      : parseFloat(selectedPair.bidPrice || selectedPair.currentPrice);

    if (!Number.isFinite(entryPrice)) {
      toast({ title: "Error", description: "Could not determine entry price.", variant: "destructive" });
      return;
    }

    const durationInSeconds = parseInt(duration, 10);
    if (!Number.isFinite(durationInSeconds)) {
      toast({ title: "Error", description: "Invalid duration selected.", variant: "destructive" });
      return;
    }

    const newTrade: ActiveTrade = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      duration: durationInSeconds,
      startTime: Date.now(),
      amount: amount,
      entryPrice,
      pair: selectedPair,
      remainingTime: durationInSeconds,
    };

    setActiveTrades(prev => [...prev, newTrade]);

    tradeMutation.mutate({
      pairId: selectedPair.id,
      type,
      amount: amount,
      entryPrice,
      userId: userId,
      status: "OPEN",
      duration: durationInSeconds,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev =>
        prev
          .map(trade => {
            const elapsed = Math.floor((Date.now() - trade.startTime) / 1000);
            const remaining = Math.max(0, trade.duration - elapsed);
            return { ...trade, remainingTime: remaining };
          })
          .filter(trade => (trade.remainingTime ?? 0) > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!selectedPair) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Quick Trade</CardTitle>
          <CardDescription>Select a trading pair to start trading</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const lotInfo = calculateLotInfo(amount, parseFloat(selectedPair.currentPrice));

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-trading-text">Quick Trade</CardTitle>
            <CardDescription className="text-trading-muted">
              Execute trades with real-time pricing
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-trading-success/10 text-trading-success border-trading-success/30">
            LIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selected Pair Info */}
          <div className="space-y-4">
            <Label className="text-trading-text font-medium">Selected Pair</Label>
            <div className="bg-trading-primary border-2 border-trading-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                    style={{ backgroundColor: selectedPair.color }}
                  >
                    {selectedPair.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-trading-text">{selectedPair.name}</div>
                    <div className="text-sm text-trading-muted">{selectedPair.symbol}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-trading-muted mb-1">BID (SELL)</div>
                  <div className="text-lg font-bold text-trading-danger">
                    {selectedPair.bidPrice && formatPrice(parseFloat(selectedPair.bidPrice), selectedPair.symbol.includes('JPY') ? 2 : 4)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-trading-muted mb-1">ASK (BUY)</div>
                  <div className="text-lg font-bold text-trading-success">
                    {selectedPair.askPrice && formatPrice(parseFloat(selectedPair.askPrice), selectedPair.symbol.includes('JPY') ? 2 : 4)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-trading-muted mt-3">
                <span>Spread: {selectedPair.spread && (parseFloat(selectedPair.spread) * 10000).toFixed(1)} pips</span>
                {selectedPair.changePercent && (
                  <span
                    className={cn(
                      "font-medium",
                      parseFloat(selectedPair.changePercent) > 0 ? "text-trading-success" : "text-trading-danger"
                    )}
                  >
                    {parseFloat(selectedPair.changePercent) > 0 ? "+" : ""}
                    {selectedPair.changePercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Trading Form */}
          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <Label className="text-sm text-trading-muted">Trading Amount</Label>
              <Input
                type="number"
                step="1"
                min="1"
                max={tradingBalance}
                placeholder="100"
                className="trading-input mt-1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex justify-between text-xs text-trading-muted mt-1">
                <span>Min: $1.00</span>
                <span>Available: {formatCurrency(tradingBalance)}</span>
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <Label className="text-sm text-trading-muted">Trade Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="trading-select mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="150">2.5 Minutes</SelectItem>
                  <SelectItem value="120">2 Minutes</SelectItem>
                  <SelectItem value="180">3 Minutes</SelectItem>
                  <SelectItem value="300">5 Minutes</SelectItem>
                  <SelectItem value="600">10 Minutes</SelectItem>
                  <SelectItem value="900">15 Minutes</SelectItem>
                  <SelectItem value="1800">30 Minutes</SelectItem>
                  <SelectItem value="3600">1 Hour</SelectItem>
                  <SelectItem value="14400">4 Hours</SelectItem>
                  <SelectItem value="36000">10 Hours</SelectItem>
                  <SelectItem value="86400">24 Hours</SelectItem>
                  <SelectItem value="172800">48 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Take Profit */}
            <div>
              <Label className="text-sm text-trading-muted">Take Profit</Label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                placeholder={`e.g., ${(parseFloat(selectedPair?.currentPrice || "1") * 1.01).toFixed(4)}`}
                className="trading-input mt-1"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
              />
              <div className="text-xs text-trading-muted mt-1">
                Optional - Set price to automatically close trade in profit
              </div>
            </div>

            {/* Stop Loss */}
            <div>
              <Label className="text-sm text-trading-muted">Stop Loss</Label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                placeholder={`e.g., ${(parseFloat(selectedPair?.currentPrice || "1") * 0.99).toFixed(4)}`}
                className="trading-input mt-1"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
              <div className="text-xs text-trading-muted mt-1">
                Optional - Set price to automatically close trade in loss
              </div>
            </div>
          </div>
        </div>

        {/* Lot Information */}
        {amount && (
          <div className="bg-trading-primary border border-trading-border rounded-lg p-4">
            <div className="text-sm text-trading-muted mb-3">Trade Information</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-trading-muted">Micro Lot</div>
                <div className="font-medium text-trading-text">{lotInfo.microLot}</div>
              </div>
              <div>
                <div className="text-trading-muted">Pip Value</div>
                <div className="font-medium text-trading-text">${lotInfo.pipValue}</div>
              </div>
              <div>
                <div className="text-trading-muted">Margin</div>
                <div className="font-medium text-trading-text">${lotInfo.marginRequired}</div>
              </div>
              <div>
                <div className="text-trading-muted">Risk</div>
                <div className="font-medium text-trading-warning">
                  {((parseFloat(amount) / tradingBalance) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            className="bg-trading-danger hover:bg-trading-danger/90 text-white"
            size="lg"
            onClick={() => handleTrade('SELL')}
            disabled={!amount || tradeMutation.isPending}
          >
            {tradeMutation.isPending ? (
              <div className="spinner w-4 h-4"></div>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 mr-2" />
                SELL {selectedPair.bidPrice && formatPrice(parseFloat(selectedPair.bidPrice), 4)}
              </>
            )}
          </Button>
          <Button
            className="bg-trading-success hover:bg-trading-success/90 text-white"
            size="lg"
            onClick={() => handleTrade('BUY')}
            disabled={!amount || tradeMutation.isPending}
          >
            {tradeMutation.isPending ? (
              <div className="spinner w-4 h-4"></div>
            ) : (
              <>
                <TrendingUp className="h-5 w-5 mr-2" />
                BUY {selectedPair.askPrice && formatPrice(parseFloat(selectedPair.askPrice), 4)}
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Active Trades */}
      {activeTrades.length > 0 && (
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-trading-text flex items-center space-x-2">
              <Clock className="h-5 w-5 text-trading-accent" />
              <span>Active Trades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTrades.map((trade) => {
                const currentPrice = parseFloat(selectedPair?.currentPrice || trade.entryPrice.toString());
                const entryPrice = trade.entryPrice;
                const priceDiff = currentPrice - entryPrice;
                const pnlSimulation =
                  (priceDiff / entryPrice) * parseFloat(trade.amount) * (trade.type === 'BUY' ? 1 : -1);
                const isProfit = pnlSimulation > 0;

                return (
                  <div key={trade.id} className="bg-trading-primary border border-trading-border rounded-lg p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge
                            className={cn(
                              "font-bold",
                              trade.type === 'BUY' ? "bg-trading-success" : "bg-trading-danger"
                            )}
                          >
                            {trade.type}
                          </Badge>
                          <span className="font-medium text-trading-text">
                            {trade.pair.symbol} • ${trade.amount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="countdown-timer text-trading-accent font-semibold">
                            {Math.floor((trade.remainingTime || 0) / 60)}:
                            {String((trade.remainingTime || 0) % 60).padStart(2, '0')}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
                              queryClient.invalidateQueries({ queryKey: ['tradingHistory'] });
                              queryClient.invalidateQueries({ queryKey: ['activeTrades'] });
                              toast({ title: "Trade Closed", description: "Trade has been closed manually" });
                            }}
                            className="text-trading-danger hover:bg-trading-danger/10 h-8 w-8 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>

                      {/* Live PnL Simulation */}
                      <div className="bg-trading-secondary rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-trading-muted">Entry Price:</span>
                            <div className="font-medium text-trading-text">{formatPrice(entryPrice, 4)}</div>
                          </div>
                          <div>
                            <span className="text-trading-muted">Current Price:</span>
                            <div className="font-medium text-trading-text">{formatPrice(currentPrice, 4)}</div>
                          </div>
                          <div>
                            <span className="text-trading-muted">Price Change:</span>
                            <div
                              className={cn(
                                "font-bold",
                                isProfit ? "text-trading-success" : "text-trading-danger"
                              )}
                            >
                              {isProfit ? '+' : ''}{formatPrice(priceDiff, 4)} ({((priceDiff / entryPrice) * 100).toFixed(2)}%)
                            </div>
                          </div>
                          <div>
                            <span className="text-trading-muted">P&L:</span>
                            <div
                              className={cn(
                                "font-bold",
                                isProfit ? "text-trading-success" : "text-trading-danger"
                              )}
                            >
                              {isProfit ? '+' : ''}{formatCurrency(pnlSimulation)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* TP/SL Display and Adjustment */}
                      {(takeProfit || stopLoss) && (
                        <div className="bg-trading-secondary/50 rounded-lg p-3">
                          <div className="text-xs text-trading-muted mb-2">Risk Management:</div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {takeProfit && (
                              <div className="space-y-1">
                                <div className="text-trading-success text-xs">Take Profit:</div>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  value={takeProfit}
                                  onChange={(e) => setTakeProfit(e.target.value)}
                                  className="h-8 text-xs bg-trading-primary border-trading-success/30"
                                />
                                <div className="text-xs text-trading-muted">
                                  Distance: {Math.abs(parseFloat(takeProfit) - currentPrice).toFixed(4)} pips
                                </div>
                              </div>
                            )}
                            {stopLoss && (
                              <div className="space-y-1">
                                <div className="text-trading-danger text-xs">Stop Loss:</div>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  value={stopLoss}
                                  onChange={(e) => setStopLoss(e.target.value)}
                                  className="h-8 text-xs bg-trading-primary border-trading-danger/30"
                                />
                                <div className="text-xs text-trading-muted">
                                  Distance: {Math.abs(parseFloat(stopLoss) - currentPrice).toFixed(4)} pips
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}

export default QuickTrade;
