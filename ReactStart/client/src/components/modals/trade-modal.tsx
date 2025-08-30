import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTradingPairs, useCreateTrade } from "@/hooks/use-trading";
import { usePriceSimulation } from "@/hooks/use-prices";
import { formatPrice, formatCurrency, validateTradeAmount } from "@/lib/trading";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPairId?: string;
}

export function TradeModal({ isOpen, onClose, preselectedPairId }: TradeModalProps) {
  const { user } = useAuth();
  const { data: tradingPairs } = useTradingPairs();
  const simulatedPairs = usePriceSimulation(tradingPairs);
  const createTradeMutation = useCreateTrade();
  
  const [selectedPairId, setSelectedPairId] = useState(preselectedPairId || "");
  const [amount, setAmount] = useState("");
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");

  const selectedPair = simulatedPairs.find(pair => pair.id === selectedPairId);
  const tradingBalance = user ? parseFloat(user.tradingBalance) : 0;
  const isAmountValid = amount && parseFloat(amount) > 0 && parseFloat(amount) <= tradingBalance;
  const canTrade = tradingBalance > 0 && isAmountValid && selectedPair;

  const handleTrade = () => {
    if (!selectedPair || !amount || !user) return;

    const tradeAmount = parseFloat(amount);
    if (!validateTradeAmount(tradeAmount, tradingBalance)) {
      return;
    }

    createTradeMutation.mutate({
      pairId: selectedPair.id,
      type: tradeType,
      amount: amount,
      entryPrice: selectedPair.currentPrice,
      status: "OPEN",
      duration: 60, // 60 seconds
    });

    // Reset form and close modal
    setAmount("");
    setSelectedPairId("");
    setTradeType("BUY");
    onClose();
  };

  const handleClose = () => {
    if (!createTradeMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-trading-secondary border-trading-border text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>New Trade</span>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
              disabled={createTradeMutation.isPending}
            >
              <X className="h-5 w-5" />
            </button>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Execute a new trade with real-time pricing
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Trading Pair Selection */}
          <div className="space-y-2">
            <Label className="text-white">Trading Pair</Label>
            <Select value={selectedPairId} onValueChange={setSelectedPairId}>
              <SelectTrigger className="trading-select">
                <SelectValue placeholder="Select a trading pair" />
              </SelectTrigger>
              <SelectContent className="bg-trading-secondary border-trading-border max-h-60">
                {simulatedPairs.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pair.color }}
                      />
                      <span>{pair.symbol}</span>
                      <span className="text-xs text-gray-400">
                        {formatPrice(pair.currentPrice, pair.symbol.includes('JPY') ? 2 : 4)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Pair Info */}
          {selectedPair && (
            <div className="bg-trading-primary rounded-lg p-4 border border-trading-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: selectedPair.color }}
                  >
                    {selectedPair.icon}
                  </div>
                  <div>
                    <span className="font-medium text-white">{selectedPair.symbol}</span>
                    <p className="text-xs text-gray-400">{selectedPair.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "font-bold text-lg",
                    selectedPair.priceDirection === 'up' && "text-trading-success",
                    selectedPair.priceDirection === 'down' && "text-trading-danger",
                    selectedPair.priceDirection === 'neutral' && "text-white"
                  )}>
                    {formatPrice(selectedPair.currentPrice, selectedPair.symbol.includes('JPY') ? 2 : 4)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Spread: {parseFloat(selectedPair.spread) * 10000} pips</span>
                {selectedPair.change !== undefined && (
                  <span className={cn(
                    selectedPair.priceDirection === 'up' && "text-trading-success",
                    selectedPair.priceDirection === 'down' && "text-trading-danger"
                  )}>
                    {selectedPair.change > 0 ? '+' : ''}{selectedPair.changePercent}%
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Trade Type */}
          <div className="space-y-2">
            <Label className="text-white">Trade Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={tradeType === "BUY" ? "default" : "outline"}
                className={tradeType === "BUY" ? "trading-button-success" : "border-trading-border"}
                onClick={() => setTradeType("BUY")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                BUY
              </Button>
              <Button
                type="button"
                variant={tradeType === "SELL" ? "default" : "outline"}
                className={tradeType === "SELL" ? "trading-button-danger" : "border-trading-border"}
                onClick={() => setTradeType("SELL")}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                SELL
              </Button>
            </div>
          </div>

          {/* Trade Amount */}
          <div className="space-y-2">
            <Label className="text-white">Trade Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="1"
              max={tradingBalance}
              placeholder="100.00"
              className="trading-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Min: $1.00</span>
              <span>Available: {formatCurrency(tradingBalance)}</span>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs border-trading-border hover:bg-trading-accent"
                  onClick={() => setAmount(Math.min(quickAmount, tradingBalance).toString())}
                  disabled={quickAmount > tradingBalance}
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Warning for low balance */}
          {tradingBalance <= 0 && (
            <div className="bg-trading-danger/20 border border-trading-danger rounded-lg p-3">
              <p className="text-trading-danger text-sm">
                ⚠️ Insufficient trading balance. Please convert funds or deposit to continue trading.
              </p>
            </div>
          )}

          {/* Trade Summary */}
          {selectedPair && amount && (
            <div className="bg-trading-primary rounded-lg p-3 border border-trading-border">
              <h4 className="text-sm font-medium text-white mb-2">Trade Summary</h4>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Pair:</span>
                  <span className="text-white">{selectedPair.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className={tradeType === 'BUY' ? 'text-trading-success' : 'text-trading-danger'}>
                    {tradeType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="text-white">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry Price:</span>
                  <span className="text-white">
                    {formatPrice(selectedPair.currentPrice, selectedPair.symbol.includes('JPY') ? 2 : 4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-white">60 seconds</span>
                </div>
              </div>
            </div>
          )}

          {/* Execute Trade Button */}
          <Button
            className="w-full trading-button-primary text-lg py-3"
            onClick={handleTrade}
            disabled={!canTrade || createTradeMutation.isPending}
          >
            {createTradeMutation.isPending ? (
              <div className="spinner w-5 h-5"></div>
            ) : (
              `Execute ${tradeType} Trade`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
