import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TradingPair, Trade, InsertTrade } from "@shared/schema";
import { useAuth } from "./use-auth";
import { executeTrade, validateTradeAmount } from "@/lib/trading";
import { useToast } from "./use-toast";

export function useTradingPairs() {
  return useQuery<TradingPair[]>({
    queryKey: ["/api/trading-pairs"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

export function useUserTrades() {
  const { user } = useAuth();

  return useQuery<Trade[]>({
    queryKey: ["/api/trades/user", user?.id],
    enabled: !!user?.id,
  });
}

export function useTradeHistory(userId: string) {
  return useQuery<Trade[]>({
    queryKey: ["/api/trades/user", userId],
    enabled: !!userId,
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tradeData: Omit<InsertTrade, 'userId'>) => {
      if (!user) throw new Error("User not authenticated");

      const tradingBalance = parseFloat(user.tradingBalance);
      const amount = parseFloat(tradeData.amount);

      // Validate trade
      if (!validateTradeAmount(amount, tradingBalance)) {
        throw new Error("Invalid trade amount or insufficient balance");
      }

      // Ensure all required fields are present
      const completeTradeData = {
        pairId: tradeData.pairId,
        type: tradeData.type,
        amount: amount.toString(),
        entryPrice: tradeData.entryPrice,
        userId: user.id,
        duration: tradeData.duration || 60,
        takeProfit: tradeData.takeProfit || null,
        stopLoss: tradeData.stopLoss || null,
      };

      console.log("Creating trade with data:", completeTradeData);

      // Create trade on server
      const response = await apiRequest("POST", "/api/trades", completeTradeData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create trade");
      }

      return response.json();
    },
    onSuccess: (trade) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["/api/trades/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id] });

      // Update local user balance
      if (user) {
        const tradingBalance = parseFloat(user.tradingBalance);
        const amount = parseFloat(trade.amount);
        updateUser({ tradingBalance: (tradingBalance - amount).toString() });
      }

      // Auto-close trade after 150 seconds with trading logic
      setTimeout(async () => {
        try {
          const entryPrice = parseFloat(trade.entryPrice);
          const result = executeTrade(parseFloat(trade.amount), trade.type, entryPrice);

          await apiRequest("PUT", `/api/trades/${trade.id}/close`, {
            exitPrice: result.exitPrice,
            pnl: result.pnl,
            isProfit: result.isProfit,
          });

          // Show result notification
          toast({
            title: result.isProfit ? "Trade Profit!" : "Trade Loss",
            description: `${trade.type} ${trade.amount} closed with ${result.isProfit ? 'profit' : 'loss'} of $${Math.abs(result.pnl).toFixed(2)}`,
            variant: result.isProfit ? "default" : "destructive",
          });

          // Refresh data
          queryClient.invalidateQueries({ queryKey: ["/api/trades/user", user?.id] });
          queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id] });

          // Update local user balance
          if (user) {
            const currentTradingBalance = parseFloat(user.tradingBalance);
            const currentProfit = parseFloat(user.profit);
            const tradeAmount = parseFloat(trade.amount);

            const newTradingBalance = currentTradingBalance + tradeAmount + result.pnl;
            const newProfit = currentProfit + result.pnl;

            updateUser({ 
              tradingBalance: newTradingBalance.toString(),
              profit: newProfit.toString()
            });
          }

        } catch (error) {
          console.error("Error closing trade:", error);
        }
      }, 150000); // 150 seconds

      toast({
        title: "Trade Opened",
        description: `${trade.type} trade for ${trade.amount} opened successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Failed to open trade",
        variant: "destructive",
      });
    },
  });
}