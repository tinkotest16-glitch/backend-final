import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown } from "lucide-react";

interface ConvertBalanceProps {
  userId: string;
}

export function ConvertBalance({ userId }: ConvertBalanceProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fromType, setFromType] = useState<string>("TOTAL");
  const [toType, setToType] = useState<string>("TRADING");
  const [amount, setAmount] = useState<string>("");

  const convertMutation = useMutation({
    mutationFn: async (conversionData: {
      fromType: string;
      toType: string;
      amount: string;
    }) => {
      const response = await apiRequest("POST", "/api/conversions", {
        userId,
        fromType: conversionData.fromType,
        toType: conversionData.toType,
        amount: conversionData.amount,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Update local user data
      if (user) {
        const amountValue = parseFloat(amount);
        let newTotalBalance = parseFloat(user.totalBalance);
        let newTradingBalance = parseFloat(user.tradingBalance);
        let newProfit = parseFloat(user.profit);

        // Deduct from source
        if (fromType === "TOTAL") newTotalBalance -= amountValue;
        else if (fromType === "TRADING") newTradingBalance -= amountValue;
        else if (fromType === "PROFIT") newProfit -= amountValue;

        // Add to destination
        if (toType === "TOTAL") newTotalBalance += amountValue;
        else if (toType === "TRADING") newTradingBalance += amountValue;
        else if (toType === "PROFIT") newProfit += amountValue;

        updateUser({
          totalBalance: newTotalBalance.toString(),
          tradingBalance: newTradingBalance.toString(),
          profit: newProfit.toString(),
        });
      }

      setAmount("");
      toast({
        title: "Conversion Successful",
        description: `Converted $${amount} from ${fromType.toLowerCase()} to ${toType.toLowerCase()} balance`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to convert balance",
        variant: "destructive",
      });
    },
  });

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to convert",
        variant: "destructive",
      });
      return;
    }

    if (fromType === toType) {
      toast({
        title: "Invalid Conversion",
        description: "Source and destination cannot be the same",
        variant: "destructive",
      });
      return;
    }

    convertMutation.mutate({ fromType, toType, amount });
  };

  const getBalanceTypeLabel = (type: string) => {
    switch (type) {
      case "TOTAL": return "Total Balance";
      case "TRADING": return "Trading Balance";
      case "PROFIT": return "Profit";
      default: return type;
    }
  };

  const getAvailableBalance = (type: string) => {
    if (!user) return 0;
    switch (type) {
      case "TOTAL": return parseFloat(user.totalBalance);
      case "TRADING": return parseFloat(user.tradingBalance);
      case "PROFIT": return parseFloat(user.profit);
      default: return 0;
    }
  };

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <ArrowUpDown className="h-5 w-5 mr-2" />
          Convert Balance
        </CardTitle>
        <CardDescription className="text-gray-400">
          Transfer funds between your different balance types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConvert} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">From</Label>
              <Select value={fromType} onValueChange={setFromType}>
                <SelectTrigger className="trading-select">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent className="bg-trading-secondary border-trading-border">
                  <SelectItem value="TOTAL">Account Balance</SelectItem>
                  <SelectItem value="TRADING">Trading Balance</SelectItem>
                  <SelectItem value="PROFIT">Profit</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Available: ${getAvailableBalance(fromType).toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">To</Label>
              <Select value={toType} onValueChange={setToType}>
                <SelectTrigger className="trading-select">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent className="bg-trading-secondary border-trading-border">
                  <SelectItem value="TOTAL">Account Balance</SelectItem>
                  <SelectItem value="TRADING">Trading Balance</SelectItem>
                  <SelectItem value="PROFIT">Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Amount</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="trading-input flex-1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="trading-button-primary px-6"
                  disabled={convertMutation.isPending}
                >
                  {convertMutation.isPending ? (
                    <div className="spinner w-4 h-4"></div>
                  ) : (
                    "Convert"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}