import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WithdrawalRequest {
  id: string;
  amount: number;
  currency: string;
  wallet_address: string;
  fee: number;
  net_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function Withdrawals() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BTC");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [feePercentage, setFeePercentage] = useState(10); // Default 10%

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    if (user) {
      loadWithdrawals();
    }
  }, [user]);

  const loadWithdrawals = () => {
    const mockWithdrawals: WithdrawalRequest[] = [
      {
        id: '1',
        amount: 1000,
        currency: 'BTC',
        wallet_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        fee: 100,
        net_amount: 900,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];
    setWithdrawals(mockWithdrawals);
  };

  const calculateFee = (amount: number): number => {
    return (amount * feePercentage) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !amount || !walletAddress) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const accountBalance = parseFloat(user.totalBalance);

    if (withdrawalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Withdrawal amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount > accountBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds your account balance",
        variant: "destructive",
      });
      return;
    }

    const fee = calculateFee(withdrawalAmount);
    const netAmount = withdrawalAmount - fee;

    setIsSubmitting(true);

    try {
      const newWithdrawal: WithdrawalRequest = {
        id: Date.now().toString(),
        amount: withdrawalAmount,
        currency,
        wallet_address: walletAddress,
        fee,
        net_amount: netAmount,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      setWithdrawals([newWithdrawal, ...withdrawals]);
      setAmount("");
      setWalletAddress("");

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for $${withdrawalAmount} has been submitted for approval.`,
      });

    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <Layout>
      <div className="min-h-screen bg-trading-primary text-white">
        <div className="lg:ml-64 pt-16 lg:pt-0">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold">Withdrawals</h1>
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="border-trading-border hover:bg-trading-secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Request Withdrawal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label className="text-trading-text">Available Balance</Label>
                      <div className="text-2xl font-bold text-trading-accent">
                        ${parseFloat(user.totalBalance).toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="amount" className="text-trading-text">Withdrawal Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="trading-input"
                        step="0.01"
                        min="0"
                      />
                      {amount && (
                        <div className="mt-3 p-4 border border-yellow-500 bg-yellow-500/10 rounded-lg">
                          <div className="text-sm font-medium text-yellow-500 mb-2">Fee Breakdown</div>
                          <div className="space-y-1 text-sm text-trading-muted">
                            <div className="flex justify-between">
                              <span>Withdrawal Amount:</span>
                              <span>${parseFloat(amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Processing Fee ({feePercentage}%):</span>
                              <span>${calculateFee(parseFloat(amount)).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-yellow-500/30 pt-1 mt-2">
                              <div className="flex justify-between font-medium text-yellow-500">
                                <span>You'll receive:</span>
                                <span>${(parseFloat(amount) - calculateFee(parseFloat(amount))).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-yellow-400">
                            You will have to deposit 10% of the amount to process withdrawal.
                          </div>
                          <div className="mt-3 flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                              onClick={() => setLocation("/deposits")}
                            >
                              Clear Withdrawal Fee
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="currency" className="text-trading-text">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="trading-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="trading-card border-trading-border">
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                          <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="wallet" className="text-trading-text">Wallet Address</Label>
                      <Input
                        id="wallet"
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="Enter your wallet address"
                        className="trading-input"
                      />
                    </div>

                    <div className="flex justify-center">
                      <Button
                        type="submit"
                        className="w-full max-w-sm trading-button-primary bg-yellow-600 hover:bg-yellow-700 border-yellow-500"
                        disabled={isSubmitting || !amount || !walletAddress}
                      >
                        {isSubmitting ? "Processing..." : "Withdraw anyway"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Withdrawal History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {withdrawals.length === 0 ? (
                      <div className="text-center py-8 text-trading-muted">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                        <p>No withdrawal requests yet</p>
                      </div>
                    ) : (
                      withdrawals.map((withdrawal) => (
                        <div key={withdrawal.id} className="bg-trading-primary border border-trading-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium text-white">
                                ${withdrawal.amount.toFixed(2)} {withdrawal.currency}
                              </div>
                              <div className="text-sm text-trading-muted">
                                Net: ${withdrawal.net_amount.toFixed(2)}
                              </div>
                            </div>
                            <Badge
                              variant={
                                withdrawal.status === 'approved' ? 'default' :
                                withdrawal.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {withdrawal.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {withdrawal.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {withdrawal.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-xs text-trading-muted">
                            <div>Address: {withdrawal.wallet_address.substring(0, 20)}...</div>
                            <div>Date: {new Date(withdrawal.created_at).toLocaleDateString()}</div>
                            <div>Fee: ${withdrawal.fee.toFixed(2)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}