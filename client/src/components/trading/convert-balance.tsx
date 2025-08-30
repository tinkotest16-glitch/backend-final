import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowUpDown, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";


interface ConvertBalanceProps {
  userId: string;
}

export function ConvertBalance({ userId }: ConvertBalanceProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [fromBalance, setFromBalance] = useState<"total" | "trading">("total");
  const [toBalance, setToBalance] = useState<"total" | "trading">("trading");
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to convert",
        variant: "destructive",
      });
      return;
    }

    const convertAmount = parseFloat(amount);
    const fromBalanceValue = fromBalance === "total" ? parseFloat(user?.totalBalance || "0") : parseFloat(user?.tradingBalance || "0");

    if (convertAmount > fromBalanceValue) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromBalance === "total" ? "total" : "trading"} balance`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/convert-balance", {
        userId,
        fromBalance,
        toBalance,
        amount: convertAmount,
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          // Update user data in context
          updateUser({
            totalBalance: result.newBalances.totalBalance,
            tradingBalance: result.newBalances.tradingBalance,
          });

          toast({
            title: "Conversion Successful",
            description: result.message || `Converted $${convertAmount} from ${fromBalance} to ${toBalance} balance`,
          });

          setAmount("");
          setFromBalance("total");
          setToBalance("trading");
        } else {
          throw new Error(result.message || "Conversion failed");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Conversion failed");
      }
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to convert balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const swapBalances = () => {
    const temp = fromBalance;
    setFromBalance(toBalance);
    setToBalance(temp);
  };

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ArrowUpDown className="w-5 h-5" />
          Convert Balance
        </CardTitle>
        <CardDescription className="text-gray-400">
          Convert between your total and trading balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConvert} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="from-balance" className="text-white">From</Label>
              <Select value={fromBalance} onValueChange={(value: "total" | "trading") => setFromBalance(value)}>
                <SelectTrigger className="trading-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-trading-secondary border-trading-border">
                  <SelectItem value="total" className="text-white hover:bg-trading-primary">
                    Total Balance (${user?.totalBalance || "0.00"})
                  </SelectItem>
                  <SelectItem value="trading" className="text-white hover:bg-trading-primary">
                    Trading Balance (${user?.tradingBalance || "0.00"})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={swapBalances}
                className="text-trading-accent hover:text-white hover:bg-trading-primary"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-balance" className="text-white">To</Label>
              <Select value={toBalance} onValueChange={(value: "total" | "trading") => setToBalance(value)}>
                <SelectTrigger className="trading-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-trading-secondary border-trading-border">
                  <SelectItem value="total" className="text-white hover:bg-trading-primary">
                    Total Balance (${user?.totalBalance || "0.00"})
                  </SelectItem>
                  <SelectItem value="trading" className="text-white hover:bg-trading-primary">
                    Trading Balance (${user?.tradingBalance || "0.00"})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount to convert"
                className="trading-input pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full trading-button-primary"
            disabled={isLoading || fromBalance === toBalance}
          >
            {isLoading ? (
              <div className="spinner w-4 h-4"></div>
            ) : (
              "Convert Balance"
            )}
          </Button>

          {fromBalance === toBalance && (
            <p className="text-sm text-gray-400 text-center">
              Please select different source and destination balances
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}