import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { TradingHistory } from "@/components/trading/trading-history";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, TrendingDown, Calendar, DollarSign, Filter } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/trading";

export default function History() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"all" | "profit" | "loss">("all");

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

  const { data: trades } = useQuery({
    queryKey: ["tradingHistory", user.id, filter],
    queryFn: async () => {
      const response = await fetch(`/api/trades?userId=${user.id}&filter=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch trades');
      return response.json();
    },
    enabled: !!user,
  });

  const totalTrades = trades?.length || 0;
  const profitableTrades = trades?.filter(trade => parseFloat(trade.pnl || "0") > 0).length || 0;
  const totalPnL = trades?.reduce((sum, trade) => sum + parseFloat(trade.pnl || "0"), 0) || 0;

  return (
    <Layout>
      <div className="min-h-screen bg-trading-primary text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Trading History</h1>
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="outline"
              className="border-trading-border hover:bg-trading-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="mb-8">
            <div className="flex space-x-4">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                className="border-trading-border"
                onClick={() => setFilter("all")}
              >
                All Trades
              </Button>
              <Button
                variant={filter === "profit" ? "default" : "outline"}
                className="border-trading-border"
                onClick={() => setFilter("profit")}
              >
                Profitable Trades
              </Button>
              <Button
                variant={filter === "loss" ? "default" : "outline"}
                className="border-trading-border"
                onClick={() => setFilter("loss")}
              >
                Loss Making Trades
              </Button>
            </div>
          </div>
          <TradingHistory userId={user.id} filter={filter} />
        </div>
      </div>
    </Layout>
  );
}