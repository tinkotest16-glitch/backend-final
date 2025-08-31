import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EnhancedTradingPair } from "@/lib/price-simulation";
import { useCreateTrade, useTradeHistory } from "@/hooks/use-trading";
import { formatPrice, formatCurrency, validateTradeAmount } from "@/lib/trading";
import { TrendingUp, TrendingDown, BarChart3, ExternalLink, Clock, Calculator, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SimpleChartPreview } from "@/components/charts/simple-chart-preview";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth"; // Assuming useAuth is for user authentication state
import { useToast } from "@/hooks/use-toast"; // Assuming useToast is for showing notifications

interface QuickTradeProps {
  selectedPair?: EnhancedTradingPair;
  userId: string;
  tradingBalance: number;
}

interface ActiveTrade {
  id: string;
  type: 'BUY' | 'SELL';
  duration: number;
  startTime: number;
  amount: string;
  entryPrice: number;
  pair: EnhancedTradingPair;
  remainingTime?: number; // Added for countdown display
}

export function QuickTrade({ selectedPair, userId, tradingBalance }: QuickTradeProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if quick trade is locked for this user (only if explicitly locked)
  if (user?.isQuickTradeLocked === true) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Quick Trade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-trading-danger mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-trading-danger mb-2">Quick Trade Locked</h3>
            <p className="text-trading-muted">
              Your quick trade access has been restricted. Please contact support for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }


  const [amount, setAmount] = useState<string>("");
    const [duration, setDuration] = useState<number>(300); // Default 5 minutes
  const [lotSize, setLotSize] = useState<number>(0.01);
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null); // State for countdown
  const queryClient = useQueryClient();

  const { data: tradeHistory } = useTradeHistory(userId); // Assuming this hook fetches user's trade history

  // Handle the trade mutation with integrated countdown and auto-closing
  const tradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await apiRequest("POST", "/api/trades", tradeData);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to place trade');
      }

      console.log('Trade placed successfully:', result);
      return result;
    },
    onSuccess: (newTrade) => {
      toast({
        title: "Trade Placed Successfully",
        description: `${newTrade.type.toUpperCase()} trade for ${formatCurrency(newTrade.amount)} placed successfully`,
      });

      // Reset form
      setAmount('');
      setTakeProfit('');
      setStopLoss('');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades/user', userId] });
    },
    onError: (error) => {
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Failed to place trade",
        variant: "destructive",
      });
    },
  });

  // Calculate lot sizes and pip values
  const calculateLotInfo = () => {
    if (!selectedPair || !amount) return null;

    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0) return null;

    const basePrice = parseFloat(selectedPair.currentPrice);
    if (isNaN(basePrice) || basePrice <= 0) return null;

    // Simplified lot size calculations (adjustments might be needed based on specific forex rules)
    const lotSize = tradeAmount / 100000; // Example: $100000 contract size for 1 lot

    return {
      standardLot: (lotSize).toFixed(2),
      miniLot: (lotSize / 10).toFixed(2),
      microLot: (lotSize / 100).toFixed(2),
      pipValue: selectedPair.symbol.includes('JPY') ?
        (tradeAmount / basePrice * 0.01).toFixed(2) : // For JPY pairs, pip is usually 0.01
        (tradeAmount * 0.0001).toFixed(2), // For others, pip is typically 0.0001 of the quote currency
      marginRequired: (tradeAmount * 0.01).toFixed(2) // Assuming 1% margin requirement
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

    const entryPrice = type === 'BUY' ?
      parseFloat(selectedPair.askPrice || selectedPair.currentPrice) :
      parseFloat(selectedPair.bidPrice || selectedPair.currentPrice);

    if (isNaN(entryPrice)) {
      toast({ title: "Error", description: "Could not determine entry price.", variant: "destructive" });
      return;
    }

    // Convert duration from string to number for the trade
    const durationInSeconds = parseInt(duration);
    
    // Add to active trades for countdown display immediately
    const newTrade: ActiveTrade = {
      id: Math.random().toString(36).substr(2, 9), // Temporary ID for local state
      type,
      duration: durationInSeconds, // Store duration in seconds
      startTime: Date.now(),
      amount: amount,
      entryPrice,
      pair: selectedPair,
      remainingTime: durationInSeconds // Initial remaining time
    };
    setActiveTrades(prev => [...prev, newTrade]);

    tradeMutation.mutate({
      pairId: selectedPair.id,
      type,
      amount: amount,
      entryPrice,
      userId: userId,
      status: "OPEN",
      duration: duration, // Send duration in seconds
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
    });

    // The rest of the form clearing and state updates are handled within the mutation's onSuccess
    // setAmount(""); // Clear input after initiating trade
    // setTakeProfit(""); // Clear TP
    // setStopLoss(""); // Clear SL
  };

  // Effect to update active trades countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev =>
        prev.map(trade => {
          const elapsed = Math.floor((Date.now() - trade.startTime) / 1000);
          const remaining = Math.max(0, trade.duration - elapsed);
          return { ...trade, remainingTime: remaining };
        }).filter(trade => trade.remainingTime > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const openFullChart = () => {
    if (selectedPair) {
      const chartUrl = `https://www.tradingview.com/chart/?symbol=${selectedPair.symbol.replace('/', '')}`;
      window.open(chartUrl, '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no');
    }
  };

  if (!selectedPair) {
    return (
      <Card className="trading-card" id="quick-trade-section" data-testid="quick-trade">
        <CardHeader>
          <CardTitle className="text-trading-text">Quick Trade</CardTitle>
          <CardDescription className="text-trading-muted">
            Select a trading pair to start trading
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-trading-muted">
            Loading trading pairs...
          </div>
        </CardContent>
      </Card>
    );
  }

  const isAmountValid = amount && parseFloat(amount) > 0 && parseFloat(amount) <= tradingBalance;
  const canTrade = tradingBalance > 0 && isAmountValid;
  const lotInfo = calculateLotInfo();

  return (
    <div className="space-y-6" id="quick-trade-section" data-testid="quick-trade">
      {/* Quick Trade Widget */}
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-trading-text font-bold text-xl">Quick Trade</CardTitle>
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
                      {selectedPair.icon}
                    </div>
                    <div>
                      <span className="font-bold text-lg text-trading-text">{selectedPair.symbol}</span>
                      <p className="text-sm text-trading-muted">{selectedPair.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openFullChart}
                    className="text-trading-accent hover:bg-trading-accent/10"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Bid/Ask Display */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-trading-secondary rounded-lg">
                  <div className="text-center">
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
                    <span className={cn(
                      "font-medium",
                      selectedPair.priceDirection === 'up' && "text-trading-success",
                      selectedPair.priceDirection === 'down' && "text-trading-danger"
                    )}>
                      {parseFloat(selectedPair.changePercent) > 0 ? '+' : ''}{selectedPair.changePercent}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Trade Settings */}
            <div className="space-y-4">
              <Label className="text-trading-text font-medium">Trade Settings</Label>

              {/* Trade Amount */}
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

              {/* Duration */}
              <div>
                <Label className="text-sm text-trading-muted">Trade Duration</Label>
                <Select 
                  value={duration.toString()} 
                  onValueChange={(value) => setDuration(parseInt(value))}
                >
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
                  Optional profit target level
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
                  Optional loss limit level
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 250].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    className="text-xs border-trading-border hover:bg-trading-accent/10 hover:border-trading-accent"
                    onClick={() => setAmount(Math.min(quickAmount, tradingBalance).toString())}
                    disabled={quickAmount > tradingBalance}
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Lot Size Calculator */}
          {lotInfo && (
            <div className="bg-trading-secondary/50 border border-trading-border rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="h-4 w-4 text-trading-accent" />
                <Label className="text-trading-text font-medium">Position Details</Label>
              </div>
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
                  <div className="font-medium text-trading-warning">{((parseFloat(amount) / tradingBalance) * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Warning for low balance */}
          {tradingBalance <= 0 && (
            <div className="bg-trading-danger/10 border border-trading-danger rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-trading-danger" />
                <p className="text-trading-danger font-medium">
                  Insufficient trading balance. Please deposit funds to continue trading.
                </p>
              </div>
            </div>
          )}

          {/* Trade Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="trading-button-danger h-12 text-lg font-bold"
              onClick={() => handleTrade('SELL')}
              disabled={!canTrade || tradeMutation.isPending}
            >
              {tradeMutation.isPending ? (
                <div className="spinner w-5 h-5"></div>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5 mr-2" />
                  SELL {selectedPair.bidPrice && formatPrice(parseFloat(selectedPair.bidPrice), 4)}
                </>
              )}
            </Button>
            <Button
              className="trading-button-success h-12 text-lg font-bold"
              onClick={() => handleTrade('BUY')}
              disabled={!canTrade || tradeMutation.isPending}
            >
              {tradeMutation.isPending ? (
                <div className="spinner w-5 h-5"></div>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  BUY {selectedPair.askPrice && formatPrice(parseFloat(selectedPair.askPrice), 4)}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Trades Countdown */}
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
                const pnlSimulation = (priceDiff / entryPrice) * parseFloat(trade.amount) * (trade.type === 'BUY' ? 1 : -1);
                const isProfit = pnlSimulation > 0;

                return (
                  <div key={trade.id} className="bg-trading-primary border border-trading-border rounded-lg p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={cn(
                            "font-bold",
                            trade.type === 'BUY' ? "bg-trading-success" : "bg-trading-danger"
                          )}>
                            {trade.type}
                          </Badge>
                          <span className="font-medium text-trading-text">
                            {trade.pair.symbol} • ${trade.amount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="countdown-timer text-trading-accent font-semibold">
                            {Math.floor((trade.remainingTime || 0) / 60)}:{String((trade.remainingTime || 0) % 60).padStart(2, '0')}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Close trade immediately
                              setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
                              // Invalidate queries to update history
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
                            <span className="text-trading-muted">Live PnL:</span>
                            <div className={cn(
                              "font-bold",
                              isProfit ? "text-trading-success" : "text-trading-danger"
                            )}>
                              {isProfit ? '+' : ''}{formatCurrency(pnlSimulation)}
                            </div>
                          </div>
                          <div>
                            <span className="text-trading-muted">Status:</span>
                            <Badge variant="outline" className="text-xs">
                              UPDATED
                            </Badge>
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

      {/* Live Chart Preview */}
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-trading-text">Price Chart</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="border-trading-accent text-trading-accent hover:bg-trading-accent hover:text-white"
              onClick={openFullChart}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Full Chart
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-trading-primary rounded-xl border border-trading-border p-4">
            <SimpleChartPreview
              pair={selectedPair}
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}