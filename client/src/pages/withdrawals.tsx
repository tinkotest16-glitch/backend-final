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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  const [feePercentage, setFeePercentage] = useState(10); // Default 10%
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  // Fetch user transactions (including withdrawals)
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions', user?.id],
    enabled: !!user?.id,
  });

  // Filter withdrawals from transactions
  const withdrawals = transactions?.filter(t => t.type === 'WITHDRAWAL') || [];

  const calculateFee = (amount: number): number => {
    return (amount * feePercentage) / 100;
  };

  // Create withdrawal mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const response = await apiRequest('POST', '/api/transactions', withdrawalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setAmount("");
      setWalletAddress("");
      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request has been submitted for approval.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    }
  });

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

    // Create withdrawal transaction
    createWithdrawalMutation.mutate({
      userId: user.id,
      type: 'WITHDRAWAL',
      amount: withdrawalAmount.toString(),
      currency,
      method: 'CRYPTO',
      walletAddress,
      fee: fee.toString(),
      status: 'PENDING'
    });
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
                        disabled={createWithdrawalMutation.isPending || !amount || !walletAddress}
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
                    {transactionsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="spinner w-6 h-6"></div>
                      </div>
                    ) : withdrawals.length === 0 ? (
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
                                ${parseFloat(withdrawal.amount).toFixed(2)} {withdrawal.currency || 'USD'}
                              </div>
                              <div className="text-sm text-trading-muted">
                                Method: {withdrawal.method}
                              </div>
                            </div>
                            <Badge
                              variant={
                                withdrawal.status === 'APPROVED' ? 'default' :
                                withdrawal.status === 'REJECTED' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {withdrawal.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                              {withdrawal.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {withdrawal.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                              {withdrawal.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-trading-muted">
                            <div>Address: {withdrawal.walletAddress?.substring(0, 20) || 'N/A'}...</div>
                            <div>Date: {new Date(withdrawal.createdAt).toLocaleDateString()}</div>
                            {withdrawal.adminNotes && (
                              <div className="text-trading-danger">Admin Notes: {withdrawal.adminNotes}</div>
                            )}
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