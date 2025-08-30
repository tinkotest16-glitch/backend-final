import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Transaction, InsertTransaction } from "@shared/schema";
import { formatCurrency } from "@/lib/trading";
import { PlusCircle, MinusCircle, Clock, CheckCircle, XCircle } from "lucide-react";

interface WalletManagementProps {
  userId: string;
}

export function WalletManagement({ userId }: WalletManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [depositForm, setDepositForm] = useState({
    amount: "",
    method: "BANK_TRANSFER",
  });
  
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    method: "BANK_TRANSFER",
  });

  // Fetch user transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/user", userId],
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (transactionData: Omit<InsertTransaction, 'userId'>) => {
      const response = await apiRequest("POST", "/api/transactions", {
        userId,
        type: "DEPOSIT",
        ...transactionData,
      });
      return response.json();
    },
    onSuccess: () => {
      setDepositForm({ amount: "", method: "BANK_TRANSFER" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/user", userId] });
      toast({
        title: "Deposit Request Submitted",
        description: "Your deposit request has been submitted for admin approval",
      });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to submit deposit request",
        variant: "destructive",
      });
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (transactionData: Omit<InsertTransaction, 'userId'>) => {
      const response = await apiRequest("POST", "/api/transactions", {
        userId,
        type: "WITHDRAWAL",
        ...transactionData,
      });
      return response.json();
    },
    onSuccess: () => {
      setWithdrawForm({ amount: "", method: "BANK_TRANSFER" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/user", userId] });
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted for admin approval",
      });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Failed to submit withdrawal request",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      type: "DEPOSIT",
      amount: depositForm.amount,
      method: depositForm.method,
    });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      type: "WITHDRAWAL",
      amount: withdrawForm.amount,
      method: withdrawForm.method,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-trading-warning" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-trading-success" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-trading-danger" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'status-badge-pending';
      case 'APPROVED': return 'status-badge-approved';
      case 'REJECTED': return 'status-badge-rejected';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="trading-card" id="wallet">
      <CardHeader>
        <CardTitle className="text-white">Wallet Management</CardTitle>
        <CardDescription className="text-gray-400">
          Manage your deposits and withdrawals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deposit and Withdraw Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deposit */}
          <div className="bg-trading-primary rounded-lg p-4 border border-trading-border">
            <h4 className="font-medium mb-4 flex items-center text-white">
              <PlusCircle className="h-5 w-5 text-trading-success mr-2" />
              Deposit Funds
            </h4>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  className="trading-input"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Payment Method</Label>
                <Select
                  value={depositForm.method}
                  onValueChange={(value) => setDepositForm({ ...depositForm, method: value })}
                >
                  <SelectTrigger className="trading-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-trading-secondary border-trading-border">
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit"
                className="w-full trading-button-success"
                disabled={depositMutation.isPending}
              >
                {depositMutation.isPending ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  "Request Deposit"
                )}
              </Button>
            </form>
          </div>

          {/* Withdraw */}
          <div className="bg-trading-primary rounded-lg p-4 border border-trading-border">
            <h4 className="font-medium mb-4 flex items-center text-white">
              <MinusCircle className="h-5 w-5 text-trading-danger mr-2" />
              Withdraw Funds
            </h4>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  className="trading-input"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Withdrawal Method</Label>
                <Select
                  value={withdrawForm.method}
                  onValueChange={(value) => setWithdrawForm({ ...withdrawForm, method: value })}
                >
                  <SelectTrigger className="trading-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-trading-secondary border-trading-border">
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="PAYPAL">PayPal</SelectItem>
                    <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit"
                className="w-full trading-button-danger"
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  "Request Withdrawal"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h4 className="font-medium mb-4 text-white">Recent Transactions</h4>
          {transactionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="spinner w-6 h-6"></div>
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>No transactions found</p>
              <p className="text-sm mt-2">Your deposit and withdrawal requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="bg-trading-primary rounded-lg p-4 border border-trading-border flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {transaction.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}
                        </span>
                        <Badge variant="outline" className="border-trading-accent text-trading-accent">
                          {transaction.method.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {formatCurrency(transaction.amount)} • {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                      {transaction.adminNotes && transaction.status === 'REJECTED' && (
                        <p className="text-xs text-trading-danger mt-1">
                          {transaction.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
