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
  UserCheck
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


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
        adminNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }); // Also refresh users to see updated balance
      toast({
        title: "Success",
        description: "Transaction approved and balance updated",
      });
    },
    onError: (error) => {
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
        adminNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      toast({
        title: "Success",
        description: "Transaction rejected",
      });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Failed to reject transaction",
        variant: "destructive",
      });
    },
  });

  const handleApproveTransaction = (transactionId: string) => {
    approveTransactionMutation.mutate({ transactionId });
  };

  const handleRejectTransaction = (transactionId: string, reason: string) => {
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

  // Toggle Quick Trade Lock
  const toggleQuickTradeLock = async (userId: string, isLocked: boolean) => {
    try {
      const response = await apiRequest("PUT", `/api/user/${userId}`, {
        isQuickTradeLocked: isLocked,
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({
          title: "Quick Trade Updated",
          description: `Quick trade has been ${isLocked ? 'locked' : 'unlocked'} for this user`,
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update quick trade setting",
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

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({
          title: "Copy Trading Updated",
          description: `Copy trading has been ${isEnabled ? 'enabled' : 'disabled'} for this user`,
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update copy trading setting",
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
    <div className="min-h-screen bg-trading-primary text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
        <Tabs defaultValue="transactions" className="space-y-6">
                    <TabsList className="bg-trading-secondary p-1 rounded-lg">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
            <TabsTrigger value="news">News & Alerts</TabsTrigger>

          {/* Pending Transactions Tab */}
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

          {/* User Management Tab */}
          <TabsContent value="kyc">
            <KYCManagement />
          </TabsContent>

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
                            </div>
                          </div>
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
        </Tabs>
      </div>
    </div>
  );
}