import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Transaction, News, InsertNews, User } from "@shared/schema";
import { ReferralManagement } from "@/components/admin/referral-management";
import { KYCManagement } from "@/components/admin/kyc-management";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Newspaper,
  Plus,
  Clock,
  Trash2,
  ArrowLeft,
  UserPlus,
  ShieldCheck
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";


export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    type: "NEWS" as "NEWS" | "ALERT",
    severity: "INFO" as "INFO" | "WARNING" | "CRITICAL",
  });

  const [balanceForm, setBalanceForm] = useState({
    userId: "",
    totalBalance: "",
    tradingBalance: "",
    profit: "",
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/user/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User account has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete user account",
        variant: "destructive",
      });
    },
  });

  const [walletForm, setWalletForm] = useState({
    currency: "",
    address: "",
    network: "",
  });

  const [editingWallet, setEditingWallet] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  // Fetch pending transactions
  const { data: pendingTransactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
    enabled: !!user?.isAdmin,
  });

  // Fetch news
  const { data: news, isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
    enabled: !!user?.isAdmin,
  });

  // Fetch all users
  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  // Fetch all transactions
  const { data: allTransactions, isLoading: allTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
    enabled: !!user?.isAdmin,
  });

  // Fetch all trades
  const { data: allTrades, isLoading: allTradesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/trades"],
    enabled: !!user?.isAdmin,
  });

  // Fetch wallet addresses
  const { data: walletAddresses, isLoading: walletsLoading } = useQuery<any[]>({
    queryKey: ["/api/wallet-addresses"],
    enabled: !!user?.isAdmin,
  });

  // Update transaction status mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, status, adminNotes }: { 
      transactionId: string; 
      status: string; 
      adminNotes?: string;
    }) => {
      const response = await apiRequest("PUT", `/api/transactions/${transactionId}/status`, {
        status,
        adminNotes,
        processedBy: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/pending"] });
      toast({
        title: "Transaction Updated",
        description: "Transaction status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update transaction",
        variant: "destructive",
      });
    },
  });

  // Create news mutation
  const createNewsMutation = useMutation({
    mutationFn: async (newsData: InsertNews) => {
      const response = await apiRequest("POST", "/api/news", newsData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setNewsForm({
        title: "",
        content: "",
        type: "NEWS",
        severity: "INFO",
      });
      toast({
        title: "News Created",
        description: "News item has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create news",
        variant: "destructive",
      });
    },
  });

  // Update balance handler
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, totalBalance, tradingBalance, profit }: {
      userId: string;
      totalBalance: number;
      tradingBalance: number;
      profit: number;
    }) => {
      const response = await apiRequest("PUT", `/api/admin/user/${userId}/balance`, {
        totalBalance: parseFloat(balanceForm.totalBalance),
        tradingBalance: parseFloat(balanceForm.tradingBalance),
        profit: parseFloat(balanceForm.profit),
      });
      return response.json();
    },
    onSuccess: () => {
      setBalanceForm({
        userId: "",
        totalBalance: "",
        tradingBalance: "",
        profit: "",
      });
      toast({
        title: "Balance Updated",
        description: "User balance has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update balance",
        variant: "destructive",
      });
    },
  });

  // Approve transaction
  const approveTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, adminNotes }: { transactionId: string; adminNotes?: string }) => {
      const response = await apiRequest("POST", `/api/admin/approve-transaction/${transactionId}`, {
        adminNotes: adminNotes || "Approved by admin",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: data.message || "Transaction approved and balance updated",
      });
    },
    onError: (error) => {
      console.error("Approval error:", error);
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve transaction",
        variant: "destructive",
      });
    },
  });

  // Reject transaction
  const rejectTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, adminNotes }: { transactionId: string; adminNotes?: string }) => {
      const response = await apiRequest("POST", `/api/admin/reject-transaction/${transactionId}`, {
        adminNotes: adminNotes || "Rejected by admin",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      toast({
        title: "Success",
        description: data.message || "Transaction rejected",
      });
    },
    onError: (error) => {
      console.error("Rejection error:", error);
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Failed to reject transaction",
        variant: "destructive",
      });
    },
  });

  // Update wallet address mutation
  const updateWalletMutation = useMutation({
    mutationFn: async ({ currency, address, network }: { 
      currency: string; 
      address: string; 
      network: string;
    }) => {
      const response = await apiRequest("PUT", `/api/admin/wallet-addresses/${currency}`, {
        address,
        network,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet-addresses"] });
      toast({
        title: "Success",
        description: "Wallet address updated successfully",
      });
      setWalletForm({ currency: "", address: "", network: "" });
      setEditingWallet(null);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update wallet address",
        variant: "destructive",
      });
    },
  });

  const handleApproveTransaction = (transactionId: string) => {
    approveTransactionMutation.mutate({ transactionId, adminNotes: "Approved by admin" });
  };

  const handleRejectTransaction = (transactionId: string, reason: string = "Rejected by admin") => {
    rejectTransactionMutation.mutate({ transactionId, adminNotes: reason });
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    createNewsMutation.mutate({
      ...newsForm,
      createdBy: user!.id,
    });
  };

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    updateBalanceMutation.mutate({
      userId: balanceForm.userId,
      totalBalance: parseFloat(balanceForm.totalBalance),
      tradingBalance: parseFloat(balanceForm.tradingBalance),
      profit: parseFloat(balanceForm.profit),
    });
  };

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWallet) {
      updateWalletMutation.mutate({
        currency: walletForm.currency,
        address: walletForm.address,
        network: walletForm.network,
      });
    }
  };

  const handleEditWallet = (wallet: any) => {
    setWalletForm({
      currency: wallet.currency,
      address: wallet.address,
      network: wallet.network,
    });
    setEditingWallet(wallet.currency);
  };

  // Toggle Quick Trade Lock
  const toggleQuickTradeLock = async (userId: string, isLocked: boolean) => {
    try {
      const response = await apiRequest("PUT", `/api/user/${userId}`, {
        isQuickTradeLocked: isLocked,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({
          title: "Quick Trade Updated",
          description: `Quick trade has been ${isLocked ? 'locked' : 'unlocked'} for this user`,
        });
      } else {
        throw new Error(result.message || "Failed to update quick trade setting");
      }
    } catch (error) {
      console.error("Quick trade lock error:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update quick trade setting",
        variant: "destructive",
      });
    }
  };

  // Toggle Copy Trading
  const toggleCopyTrading = async (userId: string, isEnabled: boolean) => {
    try {
      const response = await apiRequest("PUT", `/api/user/${userId}`, {
        isCopyTradingEnabled: isEnabled,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({
          title: "Copy Trading Updated",
          description: `Copy trading has been ${isEnabled ? 'enabled' : 'disabled'} for this user`,
        });
      } else {
        throw new Error(result.message || "Failed to update copy trading setting");
      }
    } catch (error) {
      console.error("Copy trading error:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update copy trading setting",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trading-primary flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-trading-primary text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">Manage transactions, news, and user accounts</p>
          </div>
          <Button 
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="border-trading-border hover:bg-trading-secondary"
          >
            Back to Trading
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="trading-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Pending Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-trading-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {pendingTransactions?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active News</CardTitle>
              <Newspaper className="h-4 w-4 text-trading-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {news?.filter(n => n.isActive).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-trading-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {allUsers?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Platform Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-trading-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">-</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="flex flex-col gap-6">
          <TabsList className="bg-trading-secondary flex flex-wrap items-center justify-start p-2 gap-2 h-auto rounded-lg">
            <TabsTrigger value="kyc" className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" />
              KYC Management
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Referral Management
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="all-transactions" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              All Transactions
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Withdrawal History
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trades
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center">
              <Newspaper className="w-4 h-4 mr-2" />
              News Management
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="signups" className="flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Signup Records
            </TabsTrigger>
            <TabsTrigger value="wallets" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Wallet Management
            </TabsTrigger>
          </TabsList>

          {/* Pending Transactions Tab */}
          {/* Referral Management Tab */}
          <TabsContent value="kyc">
            <KYCManagement />
          </TabsContent>
          <TabsContent value="referrals">
            <ReferralManagement />
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">Pending Transactions</CardTitle>
                <CardDescription className="text-gray-400">
                  Review and approve or reject deposit and withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-6 h-6"></div>
                  </div>
                ) : !pendingTransactions || pendingTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No pending transactions
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTransactions.map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="bg-trading-primary p-4 rounded-lg border border-trading-border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="border-trading-accent text-trading-accent">
                                {transaction.type}
                              </Badge>
                              <span className="text-white font-medium">
                                ${parseFloat(transaction.amount).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              Method: {transaction.method} • User ID: {transaction.userId}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested: {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="trading-button-success"
                              onClick={() => handleApproveTransaction(transaction.id)}
                              disabled={updateTransactionMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              className="trading-button-danger"
                              onClick={() => handleRejectTransaction(transaction.id, "Rejected by admin")}
                              disabled={updateTransactionMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Transactions Tab */}
          <TabsContent value="all-transactions">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">All Transactions</CardTitle>
                <CardDescription className="text-gray-400">
                  Complete transaction history including deposits and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allTransactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-6 h-6"></div>
                  </div>
                ) : !allTransactions || allTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No transactions found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Type</TableHead>
                        <TableHead className="text-white">Amount</TableHead>
                        <TableHead className="text-white">Method</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Date</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Badge variant="outline" className="border-trading-accent text-trading-accent">
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            ${parseFloat(transaction.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>{transaction.method}</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === 'APPROVED' ? 'default' :
                              transaction.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }
                            className={
                              transaction.status === 'APPROVED' ? 'bg-trading-success' :
                              transaction.status === 'REJECTED' ? 'bg-trading-danger' :
                              'bg-yellow-600'
                            }
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {transaction.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveTransaction(transaction.id)}
                                  disabled={approveTransactionMutation.isPending}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleRejectTransaction(transaction.id, "Rejected by admin")}
                                  disabled={rejectTransactionMutation.isPending}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawal History Tab */}
          <TabsContent value="withdrawals">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal History</CardTitle>
                <CardDescription className="text-gray-400">
                  All withdrawal requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allTransactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-6 h-6"></div>
                  </div>
                ) : !allTransactions ? (
                  <div className="text-center py-8 text-gray-400">
                    No withdrawal transactions found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allTransactions
                      .filter(transaction => transaction.type === 'WITHDRAWAL')
                      .map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="bg-trading-primary p-4 rounded-lg border border-trading-border"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-3">
                                <div className="text-white font-medium">
                                  ${parseFloat(transaction.amount).toFixed(2)}
                                </div>
                                <Badge
                                  variant={
                                    transaction.status === 'APPROVED' ? 'default' :
                                    transaction.status === 'REJECTED' ? 'destructive' :
                                    'secondary'
                                  }
                                  className={
                                    transaction.status === 'APPROVED' ? 'bg-trading-success' :
                                    transaction.status === 'REJECTED' ? 'bg-trading-danger' :
                                    'bg-yellow-600'
                                  }
                                >
                                  {transaction.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                  {transaction.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {transaction.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                                  {transaction.status}
                                </Badge>
                                <Badge variant="outline" className="border-trading-accent text-trading-accent">
                                  {transaction.method}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">
                                User ID: {transaction.userId} • Date: {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                              {transaction.adminNotes && (
                                <p className="text-xs text-trading-warning">
                                  Admin Notes: {transaction.adminNotes}
                                </p>
                              )}
                            </div>
                            {transaction.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveTransaction(transaction.id)}
                                  disabled={approveTransactionMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="trading-button-danger"
                                  onClick={() => handleRejectTransaction(transaction.id, "Withdrawal rejected by admin")}
                                  disabled={rejectTransactionMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trades Tab */}
          <TabsContent value="trades">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">All Trades</CardTitle>
                <CardDescription className="text-gray-400">
                  Complete trading history for all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allTradesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-6 h-6"></div>
                  </div>
                ) : !allTrades || allTrades.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No trades found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allTrades.map((trade) => (
                      <div 
                        key={trade.id}
                        className="bg-trading-primary p-4 rounded-lg border border-trading-border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="border-trading-accent text-trading-accent">
                                {trade.type}
                              </Badge>
                              <span className="text-white font-medium">
                                ${parseFloat(trade.amount).toFixed(2)}
                              </span>
                              <Badge
                                variant={
                                  trade.status === 'CLOSED' ? 
                                    (trade.isProfit ? 'default' : 'destructive') :
                                    'secondary'
                                }
                                className={
                                  trade.status === 'CLOSED' ? 
                                    (trade.isProfit ? 'bg-trading-success' : 'bg-trading-danger') :
                                    'bg-yellow-600'
                                }
                              >
                                {trade.status} {trade.status === 'CLOSED' && (trade.isProfit ? '📈' : '📉')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              Entry: ${parseFloat(trade.entryPrice).toFixed(4)} • 
                              {trade.exitPrice && ` Exit: $${parseFloat(trade.exitPrice).toFixed(4)} • `}
                              User ID: {trade.userId}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(trade.createdAt).toLocaleString()}
                              {trade.closedAt && (
                                <> • Closed: {new Date(trade.closedAt).toLocaleString()}</>
                              )}
                            </p>
                            {trade.pnl && (
                              <p className={`text-sm font-medium ${parseFloat(trade.pnl) >= 0 ? 'text-trading-success' : 'text-trading-danger'}`}>
                                P&L: ${parseFloat(trade.pnl).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Management Tab */}
          <TabsContent value="news" className="space-y-6">
            {/* Create News Form */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">Create News/Alert</CardTitle>
                <CardDescription className="text-gray-400">
                  Add market news or alerts for users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateNews} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="news-type" className="text-white">Type</Label>
                      <Select
                        value={newsForm.type}
                        onValueChange={(value: "NEWS" | "ALERT") => 
                          setNewsForm({ ...newsForm, type: value })
                        }
                      >
                        <SelectTrigger className="trading-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-trading-secondary border-trading-border">
                          <SelectItem value="NEWS">News</SelectItem>
                          <SelectItem value="ALERT">Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="news-severity" className="text-white">Severity</Label>
                      <Select
                        value={newsForm.severity}
                        onValueChange={(value: "INFO" | "WARNING" | "CRITICAL") => 
                          setNewsForm({ ...newsForm, severity: value })
                        }
                      >
                        <SelectTrigger className="trading-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-trading-secondary border-trading-border">
                          <SelectItem value="INFO">Info</SelectItem>
                          <SelectItem value="WARNING">Warning</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="news-title" className="text-white">Title</Label>
                    <Input
                      id="news-title"
                      className="trading-input"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      placeholder="Enter news title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="news-content" className="text-white">Content</Label>
                    <Textarea
                      id="news-content"
                      className="trading-input min-h-24"
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      placeholder="Enter news content"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="trading-button-primary"
                    disabled={createNewsMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create News
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing News */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">Existing News & Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {newsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-6 h-6"></div>
                  </div>
                ) : !news || news.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No news items found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {news.map((item) => (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.type === 'ALERT' ? 'news-alert' : 'news-info'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  item.type === 'ALERT' ? 'border-trading-danger text-trading-danger' :
                                  'border-trading-accent text-trading-accent'
                                }`}
                              >
                                {item.type}
                              </Badge>
                              {item.severity === 'CRITICAL' && (
                                <AlertTriangle className="w-4 h-4 text-trading-danger" />
                              )}
                            </div>
                            <h4 className="font-medium text-white">{item.title}</h4>
                            <p className="text-sm text-gray-300">{item.content}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge 
                            variant={item.isActive ? "default" : "secondary"}
                            className={item.isActive ? "bg-trading-success" : "bg-gray-600"}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Records Tab */}
          <TabsContent value="signups" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">Recent Signup Records</CardTitle>
                <CardDescription className="text-gray-400">
                  View complete signup information for all users including sensitive data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const signupRecords = JSON.parse(localStorage.getItem('edgemarket_signups') || '[]');
                  return signupRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No signup records found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {signupRecords.map((record, index) => (
                        <div 
                          key={index}
                          className="bg-trading-primary p-4 rounded-lg border border-trading-border"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{record.fullName}</span>
                              <Badge variant="outline" className="border-trading-accent text-trading-accent">
                                New User
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Username:</p>
                                <p className="text-white">{record.username}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Email:</p>
                                <p className="text-white">{record.email}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Phone Number:</p>
                                <p className="text-white">{record.phoneNumber}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Country:</p>
                                <p className="text-white">{record.country}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Password:</p>
                                <p className="text-white font-mono">{record.password}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Signup Date:</p>
                                <p className="text-white">{new Date(record.timestamp).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Referral Code:</p>
                                <p className="text-white">{record.referralCode || 'None'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Users List */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">All Users</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage user accounts and view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-6 h-6"></div>
                  </div>
                ) : !allUsers || allUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allUsers.map((userItem) => (
                      <div 
                        key={userItem.id}
                        className="bg-trading-primary p-4 rounded-lg border border-trading-border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">
                                {userItem.fullName}
                              </span>
                              {userItem.isAdmin && (
                                <Badge variant="outline" className="border-trading-accent text-trading-accent">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              Email: {userItem.email} • Username: {userItem.username}
                            </p>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Total: ${parseFloat(userItem.totalBalance).toFixed(2)}</p>
                              <p>Trading: ${parseFloat(userItem.tradingBalance).toFixed(2)}</p>
                              <p>Profit: ${parseFloat(userItem.profit).toFixed(2)}</p>
                              <p>Joined: {new Date(userItem.createdAt).toLocaleString()}</p>
                              
                              {/* Show signup details if available */}
                              {localStorage.getItem('edgemarket_signups') && (
                                <>
                                  <p>Phone: {JSON.parse(localStorage.getItem('edgemarket_signups') || '[]')
                                    .find((signup: any) => signup.email === userItem.email)?.phoneNumber || 'N/A'}</p>
                                  <p>Country: {JSON.parse(localStorage.getItem('edgemarket_signups') || '[]')
                                    .find((signup: any) => signup.email === userItem.email)?.country || 'N/A'}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              className="trading-button-secondary"
                              onClick={() => setBalanceForm({
                                userId: userItem.id,
                                totalBalance: userItem.totalBalance,
                                tradingBalance: userItem.tradingBalance,
                                profit: userItem.profit,
                              })}
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Edit Balance
                            </Button>
                            
                            {/* Delete User Button */}
                            {!userItem.isAdmin && (
                              <DeleteUserDialog
                                userName={userItem.fullName}
                                onConfirm={() => {
                                  deleteUserMutation.mutate(userItem.id);
                                  // Also remove from localStorage if exists
                                  const signups = JSON.parse(localStorage.getItem('edgemarket_signups') || '[]');
                                  const updatedSignups = signups.filter((signup: any) => signup.email !== userItem.email);
                                  localStorage.setItem('edgemarket_signups', JSON.stringify(updatedSignups));
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Balance Adjustment */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">Manual Balance Adjustment</CardTitle>
                <CardDescription className="text-gray-400">
                  Manually adjust user balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateBalance} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-id" className="text-white">User ID</Label>
                    <Input
                      id="user-id"
                      className="trading-input"
                      value={balanceForm.userId}
                      onChange={(e) => setBalanceForm({ ...balanceForm, userId: e.target.value })}
                      placeholder="Enter user ID"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-balance" className="text-white">Total Balance</Label>
                      <Input
                        id="total-balance"
                        type="number"
                        step="0.01"
                        className="trading-input"
                        value={balanceForm.totalBalance}
                        onChange={(e) => setBalanceForm({ ...balanceForm, totalBalance: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trading-balance" className="text-white">Trading Balance</Label>
                      <Input
                        id="trading-balance"
                        type="number"
                        step="0.01"
                        className="trading-input"
                        value={balanceForm.tradingBalance}
                        onChange={(e) => setBalanceForm({ ...balanceForm, tradingBalance: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profit" className="text-white">Profit</Label>
                      <Input
                        id="profit"
                        type="number"
                        step="0.01"
                        className="trading-input"
                        value={balanceForm.profit}
                        onChange={(e) => setBalanceForm({ ...balanceForm, profit: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="trading-button-primary"
                    disabled={updateBalanceMutation.isPending}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Update Balance
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* User Restrictions & Copy Trading */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">User Restrictions & Copy Trading</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage user permissions and copy trading settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="spinner w-6 h-6"></div>
                    </div>
                  ) : !allUsers || allUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No users found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allUsers.map((userItem) => (
                        <div 
                          key={userItem.id}
                          className="bg-trading-primary p-4 rounded-lg border border-trading-border"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-medium">
                                  {userItem.fullName}
                                </span>
                                {userItem.isAdmin && (
                                  <Badge variant="outline" className="border-trading-accent text-trading-accent">
                                    Admin
                                  </Badge>
                                )}
                                {userItem.isQuickTradeLocked && (
                                  <Badge variant="destructive">
                                    Quick Trade Locked
                                  </Badge>
                                )}
                                {userItem.isCopyTradingEnabled && (
                                  <Badge variant="default" className="bg-trading-success">
                                    Copy Trading Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">
                                {userItem.email} • {userItem.username}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={userItem.isQuickTradeLocked ? "destructive" : "outline"}
                                onClick={() => toggleQuickTradeLock(userItem.id, !userItem.isQuickTradeLocked)}
                                className="text-xs"
                              >
                                {userItem.isQuickTradeLocked ? "Unlock" : "Lock"} Quick Trade
                              </Button>
                              <Button
                                size="sm"
                                variant={userItem.isCopyTradingEnabled ? "destructive" : "default"}
                                onClick={() => toggleCopyTrading(userItem.id, !userItem.isCopyTradingEnabled)}
                                className="text-xs"
                              >
                                {userItem.isCopyTradingEnabled ? "Disable" : "Enable"} Copy Trading
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Management Tab */}
          <TabsContent value="wallets">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="text-white">Wallet Address Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage cryptocurrency wallet addresses for deposits and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Wallet Addresses */}
                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Current Wallet Addresses</h3>
                    {walletsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="spinner w-6 h-6"></div>
                      </div>
                    ) : !walletAddresses || walletAddresses.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No wallet addresses configured
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {walletAddresses.map((wallet) => (
                          <div 
                            key={wallet.id}
                            className="bg-trading-primary p-4 rounded-lg border border-trading-border"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-trading-accent font-bold">
                                    {wallet.currency}
                                  </span>
                                  <Badge variant="outline" className="border-trading-accent text-trading-accent">
                                    {wallet.network}
                                  </Badge>
                                </div>
                                <p className="text-sm text-white font-mono">
                                  {wallet.address}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Last updated: {new Date(wallet.updatedAt).toLocaleString()}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="trading-button-secondary"
                                onClick={() => handleEditWallet(wallet)}
                                data-testid={`edit-wallet-${wallet.currency.toLowerCase()}`}
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit Wallet Form */}
                  {editingWallet && (
                    <Card className="border-trading-accent/20">
                      <CardHeader>
                        <CardTitle className="text-white">Edit Wallet Address - {editingWallet}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleWalletSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="wallet-address" className="text-white">Wallet Address</Label>
                            <Input
                              id="wallet-address"
                              className="trading-input font-mono"
                              value={walletForm.address}
                              onChange={(e) => setWalletForm({ ...walletForm, address: e.target.value })}
                              placeholder="Enter wallet address"
                              required
                              data-testid="input-wallet-address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wallet-network" className="text-white">Network</Label>
                            <Input
                              id="wallet-network"
                              className="trading-input"
                              value={walletForm.network}
                              onChange={(e) => setWalletForm({ ...walletForm, network: e.target.value })}
                              placeholder="e.g., Bitcoin Network, ERC-20, TRON Network"
                              required
                              data-testid="input-wallet-network"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              type="submit" 
                              className="trading-button-primary"
                              disabled={updateWalletMutation.isPending}
                              data-testid="button-save-wallet"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                setEditingWallet(null);
                                setWalletForm({ currency: "", address: "", network: "" });
                              }}
                              data-testid="button-cancel-edit-wallet"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}