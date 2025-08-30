import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { formatCurrency } from "@/lib/trading";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, RefreshCw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface BalanceCardsProps {
  user: User;
}

export function BalanceCards({ user }: BalanceCardsProps) {
  const totalBalance = parseFloat(user.totalBalance) + parseFloat(user.tradingBalance);
  const tradingPercentage = totalBalance > 0 ? (parseFloat(user.tradingBalance) / totalBalance * 100) : 0;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [, setLocation] = useLocation();

  const handleRefreshBalance = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh user data from the server
      const response = await fetch(`/api/users/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const updatedUser = await response.json();
      
      // Invalidate and refetch all user-related data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/user'] }),
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] }),
        queryClient.invalidateQueries({ queryKey: ['/api/trades/user', user.id] }),
        queryClient.invalidateQueries({ queryKey: ['tradingHistory'] }),
        queryClient.invalidateQueries({ queryKey: ['activeTrades'] })
      ]);

      // Force refetch user data to get the latest balance
      await queryClient.refetchQueries({ queryKey: ['user'] });
      await queryClient.refetchQueries({ queryKey: [`/api/users/${user.id}`] });

      toast({
        title: "Balance Refreshed",
        description: "Your account balance has been updated successfully",
      });
    } catch (error) {
      console.error('Balance refresh error:', error);
      toast({
        title: "Error",
        description: "Failed to refresh balance. Please logout and login to update balance.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user.id, toast, queryClient]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Balance */}
      <Card className="balance-card group hover:shadow-2xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-trading-muted">
            Account Balance
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 text-trading-muted hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="h-8 w-8 p-0 text-trading-muted hover:text-white"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-trading-muted">Account Balance</p>
            <p className="text-3xl font-bold text-trading-text">
              {showBalance ? formatCurrency(parseFloat(user.totalBalance)) : "****"}
            </p>
            <div className="flex items-center text-sm text-trading-success">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>Available for conversion</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-trading-border">
            <div className="flex justify-between items-center text-xs text-trading-muted">
              <span>Last updated</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Balance */}
      <Card className="balance-card group hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-trading-success/10">
              <TrendingUp className="h-6 w-6 text-trading-success" />
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium",
                parseFloat(user.tradingBalance) > 0
                  ? "bg-trading-success/10 text-trading-success"
                  : "bg-trading-warning/10 text-trading-warning"
              )}
            >
              {parseFloat(user.tradingBalance) > 0 ? "Active" : "Fund Now"}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-trading-muted">Trading Balance</p>
            <p className="text-3xl font-bold text-trading-text">
              {showBalance ? formatCurrency(parseFloat(user.tradingBalance)) : "****"}
            </p>
            <div className="flex items-center text-sm">
              {parseFloat(user.tradingBalance) > 0 ? (
                <span className="text-trading-success flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  Ready to trade
                </span>
              ) : (
                <span className="text-trading-warning flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  Needs funding
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-trading-border">
            <div className="w-full bg-trading-border rounded-full h-2">
              <div
                className="bg-trading-success h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(tradingPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-trading-muted mt-2">
              {tradingPercentage.toFixed(1)}% of total balance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Portfolio */}
      <Card className="balance-card group hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-primary/10">
              <DollarSign className="h-6 w-6 text-trading-accent" />
            </div>
            <Badge variant="secondary" className="text-xs font-medium bg-gradient-primary text-white">
              Portfolio
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-trading-muted">Total Value</p>
            <p className="text-3xl font-bold text-trading-text">
              {showBalance ? formatCurrency(totalBalance) : "****"}
            </p>
            <div className="flex items-center text-sm text-trading-accent">
              <CreditCard className="h-4 w-4 mr-1" />
              <span>Combined balance</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-trading-border">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-trading-muted">Main</p>
                <p className="font-medium text-trading-text">
                  {formatCurrency(parseFloat(user.totalBalance))}
                </p>
              </div>
              <div>
                <p className="text-trading-muted">Trading</p>
                <p className="font-medium text-trading-text">
                  {formatCurrency(parseFloat(user.tradingBalance))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}