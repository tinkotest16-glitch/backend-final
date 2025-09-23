import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  Users, 
  Wallet, 
  Lock, 
  Bell, 
  Shield,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { User, Transaction, Trade, News } from "@shared/schema";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  totalBalance: string;
  tradingBalance: string;
  profit: string;
  isAdmin: boolean;
  createdAt: string;
  referralCode: string;
  referralCount: number;
  activeReferrals: number;
  referralEarnings: string;
}

interface AdminWallet {
  id: string;
  userId: string;
  type: string;
  balance: string;
  isLocked: boolean;
  lastActivity: string;
}

interface AdminAlert {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "CRITICAL";
  isActive: boolean;
  createdAt: string;
}

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [signupData, setSignupData] = useState<any[]>([]);
  const [showSignups, setShowSignups] = useState(false);
  const [balanceForm, setBalanceForm] = useState({
    totalBalance: "",
    tradingBalance: "",
    profit: "",
    referralCount: 0,
    activeReferrals: 0,
    referralEarnings: "0"
  });
  
  // Load signup data from localStorage
  useEffect(() => {
    const storedSignups = localStorage.getItem('edgemarket_signups');
    if (storedSignups) {
      setSignupData(JSON.parse(storedSignups));
    }
  }, []);
  
  // Get password for user from signup data
  const getUserPassword = (email: string) => {
    const signup = signupData.find(s => s.email === email);
    return signup?.password || 'N/A';
  };
  
  // Get phone for user from signup data
  const getUserPhone = (email: string) => {
    const signup = signupData.find(s => s.email === email);
    return signup?.phoneNumber || 'N/A';
  };
  
  // Get country for user from signup data
  const getUserCountry = (email: string) => {
    const signup = signupData.find(s => s.email === email);
    return signup?.country || 'N/A';
  };

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async (data: { 
      userId: string; 
      totalBalance: string; 
      tradingBalance: string; 
      profit: string;
      referralCount: number;
      activeReferrals: number;
      referralEarnings: string;
    }) => {
      console.log("Updating user balance with data:", data); // Debug log
      return apiRequest("PUT", `/api/admin/user/${data.userId}/balance`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User details updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error("Error updating user:", error); // Debug log
      toast({ title: "Error", description: "Failed to update user details", variant: "destructive" });
    }
  });

  const handleUpdateBalance = () => {
    if (!selectedUser) return;
    // Convert string values to numbers for the API
    const formData = {
      userId: selectedUser.id,
      totalBalance: balanceForm.totalBalance,
      tradingBalance: balanceForm.tradingBalance,
      profit: balanceForm.profit,
      referralCount: parseInt(balanceForm.referralCount.toString()),
      activeReferrals: parseInt(balanceForm.activeReferrals.toString()),
      referralEarnings: balanceForm.referralEarnings
    };
    console.log("Submitting form data:", formData); // Debug log
    updateBalanceMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage user accounts and balances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Signup Records Section */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowSignups(!showSignups)}
              className="mb-4"
            >
              {showSignups ? "Hide" : "Show"} Signup Records
            </Button>
            
            {showSignups && (
              <Card className="bg-trading-secondary">
                <CardHeader>
                  <CardTitle>Recent Signup Records</CardTitle>
                  <CardDescription>View detailed signup information and referral codes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Referral Code</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signupData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((signup, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(signup.timestamp).toLocaleDateString()}</TableCell>
                            <TableCell>{signup.fullName}</TableCell>
                            <TableCell>{signup.email}</TableCell>
                            <TableCell>{signup.phoneNumber}</TableCell>
                            <TableCell>{signup.country}</TableCell>
                            <TableCell>{signup.referralCode || 'None'}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Active Referrals</TableHead>
                <TableHead>Referral Earnings</TableHead>
                <TableHead>Total Balance</TableHead>
                <TableHead>Trading Balance</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getUserPhone(user.email)}</TableCell>
                  <TableCell>{getUserCountry(user.email)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={showPasswords ? "" : "blur-sm"}>
                        {showPasswords ? getUserPassword(user.email) : "••••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{user.referralCode || "N/A"}</TableCell>
                  <TableCell>{user.referralCount || 0}</TableCell>
                  <TableCell>{user.activeReferrals || 0}</TableCell>
                  <TableCell className="text-green-600">${user.referralEarnings || "0.00"}</TableCell>
                  <TableCell>${user.totalBalance}</TableCell>
                  <TableCell>${user.tradingBalance}</TableCell>
                  <TableCell className={parseFloat(user.profit) >= 0 ? "text-green-600" : "text-red-600"}>
                    ${user.profit}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setBalanceForm({
                              totalBalance: user.totalBalance,
                              tradingBalance: user.tradingBalance,
                              profit: user.profit,
                              referralCount: user.referralCount || 0,
                              activeReferrals: user.activeReferrals || 0,
                              referralEarnings: user.referralEarnings || "0"
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update User Balance</DialogTitle>
                          <DialogDescription>
                            Modify {user.fullName}'s account balances
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="totalBalance">Total Balance</Label>
                            <Input
                              id="totalBalance"
                              type="number"
                              step="0.01"
                              value={balanceForm.totalBalance}
                              onChange={(e) => setBalanceForm(prev => ({ ...prev, totalBalance: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="tradingBalance">Trading Balance</Label>
                            <Input
                              id="tradingBalance"
                              type="number"
                              step="0.01"
                              value={balanceForm.tradingBalance}
                              onChange={(e) => setBalanceForm(prev => ({ ...prev, tradingBalance: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="profit">Profit</Label>
                            <Input
                              id="profit"
                              type="number"
                              step="0.01"
                              value={balanceForm.profit}
                              onChange={(e) => setBalanceForm(prev => ({ ...prev, profit: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="referralCount">Total Referrals</Label>
                            <Input
                              id="referralCount"
                              type="number"
                              value={balanceForm.referralCount}
                              onChange={(e) => setBalanceForm(prev => ({ ...prev, referralCount: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="activeReferrals">Active Referrals</Label>
                            <Input
                              id="activeReferrals"
                              type="number"
                              value={balanceForm.activeReferrals}
                              onChange={(e) => setBalanceForm(prev => ({ ...prev, activeReferrals: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="referralEarnings">Referral Earnings ($)</Label>
                            <Input
                              id="referralEarnings"
                              type="number"
                              step="0.01"
                              value={balanceForm.referralEarnings}
                              onChange={(e) => setBalanceForm(prev => ({ ...prev, referralEarnings: e.target.value }))}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleUpdateBalance} disabled={updateBalanceMutation.isPending}>
                            {updateBalanceMutation.isPending ? "Updating..." : "Update Balance"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function WalletManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets = [] } = useQuery<AdminWallet[]>({
    queryKey: ["/api/admin/wallets"],
  });

  const lockWalletMutation = useMutation({
    mutationFn: async ({ walletId, lock }: { walletId: string; lock: boolean }) => {
      return apiRequest("PUT", `/api/admin/wallet/${walletId}/lock`, { lock });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wallet status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets"] });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Management
        </CardTitle>
        <CardDescription>Monitor and control user wallets</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell>{wallet.userId}</TableCell>
                <TableCell>
                  <Badge variant="outline">{wallet.type}</Badge>
                </TableCell>
                <TableCell>${wallet.balance}</TableCell>
                <TableCell>
                  <Badge variant={wallet.isLocked ? "destructive" : "default"}>
                    {wallet.isLocked ? "Locked" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(wallet.lastActivity).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => lockWalletMutation.mutate({ walletId: wallet.id, lock: !wallet.isLocked })}
                  >
                    {wallet.isLocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function QuickTradeLock() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lockSettings, setLockSettings] = useState({
    enabled: false,
    maxTrades: 10,
    timeWindow: 60, // minutes
    cooldownPeriod: 5 // minutes
  });

  const updateLockMutation = useMutation({
    mutationFn: async (settings: typeof lockSettings) => {
      return apiRequest("PUT", "/api/admin/quick-trade-lock", settings);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Quick trade lock settings updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quick-trade-lock"] }); 
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update quick trade lock settings", variant: "destructive"});
    }
  });

  // Fetch initial settings
  const { isLoading: isLoadingLockSettings } = useQuery({
    queryKey: ["/api/admin/quick-trade-lock"],
    onSuccess: (data: typeof lockSettings) => {
      setLockSettings(data);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to fetch quick trade lock settings", variant: "destructive" });
    }
  });


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Quick Trade Lock
        </CardTitle>
        <CardDescription>Configure trading restrictions and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="lockEnabled"
            checked={lockSettings.enabled}
            onCheckedChange={(enabled) => setLockSettings(prev => ({ ...prev, enabled }))}
          />
          <Label htmlFor="lockEnabled">Enable Trade Locking</Label>
        </div>

        <div>
          <Label htmlFor="maxTrades">Max Trades per Time Window</Label>
          <Input
            id="maxTrades"
            type="number"
            value={lockSettings.maxTrades}
            onChange={(e) => setLockSettings(prev => ({ ...prev, maxTrades: parseInt(e.target.value) }))}
            disabled={isLoadingLockSettings}
          />
        </div>

        <div>
          <Label htmlFor="timeWindow">Time Window (minutes)</Label>
          <Input
            id="timeWindow"
            type="number"
            value={lockSettings.timeWindow}
            onChange={(e) => setLockSettings(prev => ({ ...prev, timeWindow: parseInt(e.target.value) }))}
            disabled={isLoadingLockSettings}
          />
        </div>

        <div>
          <Label htmlFor="cooldown">Cooldown Period (minutes)</Label>
          <Input
            id="cooldown"
            type="number"
            value={lockSettings.cooldownPeriod}
            onChange={(e) => setLockSettings(prev => ({ ...prev, cooldownPeriod: parseInt(e.target.value) }))}
            disabled={isLoadingLockSettings}
          />
        </div>

        <Button onClick={() => updateLockMutation.mutate(lockSettings)} disabled={updateLockMutation.isPending}>
          {updateLockMutation.isPending ? "Updating..." : "Update Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AlertsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [alertForm, setAlertForm] = useState({
    title: "",
    message: "",
    type: "INFO" as "INFO" | "WARNING" | "CRITICAL"
  });

  const { data: alerts = [] } = useQuery<AdminAlert[]>({
    queryKey: ["/api/admin/alerts"],
  });

  const createAlertMutation = useMutation({
    mutationFn: async (alert: typeof alertForm) => {
      return apiRequest("POST", "/api/admin/alerts", alert);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Alert created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
      setAlertForm({ title: "", message: "", type: "INFO" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create alert", variant: "destructive"});
    }
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ alertId, active }: { alertId: string; active: boolean }) => {
      return apiRequest("PUT", `/api/admin/alerts/${alertId}`, { isActive: active });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Alert status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update alert status", variant: "destructive"});
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alerts Management
        </CardTitle>
        <CardDescription>Create and manage system alerts for users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 border-b pb-4">
          <h4 className="font-medium">Create New Alert</h4>
          <div>
            <Label htmlFor="alertTitle">Title</Label>
            <Input
              id="alertTitle"
              value={alertForm.title}
              onChange={(e) => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Alert title"
            />
          </div>
          <div>
            <Label htmlFor="alertMessage">Message</Label>
            <Textarea
              id="alertMessage"
              value={alertForm.message}
              onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Alert message"
            />
          </div>
          <div>
            <Label htmlFor="alertType">Type</Label>
            <Select value={alertForm.type} onValueChange={(value: "INFO" | "WARNING" | "CRITICAL") => setAlertForm(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createAlertMutation.mutate(alertForm)} disabled={createAlertMutation.isPending}>
            {createAlertMutation.isPending ? "Creating..." : (<><Plus className="w-4 h-4 mr-2" />Create Alert</>)}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Active Alerts</h4>
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{alert.title}</div>
                <div className="text-sm text-gray-600">{alert.message}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={
                    alert.type === "CRITICAL" ? "destructive" : 
                    alert.type === "WARNING" ? "secondary" : "default"
                  }>
                    {alert.type}
                  </Badge>
                  <Badge variant={alert.isActive ? "default" : "outline"}>
                    {alert.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAlertMutation.mutate({ alertId: alert.id, active: !alert.isActive })}
                disabled={toggleAlertMutation.isPending}
              >
                {toggleAlertMutation.isPending ? "Toggling..." : (alert.isActive ? "Deactivate" : "Activate")}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PageAccessControl() {
  const { toast } = useToast();
  const [pageSettings, setPageSettings] = useState({
    trading: { enabled: true, requiresVerification: false },
    deposits: { enabled: true, requiresVerification: true },
    withdrawals: { enabled: true, requiresVerification: true },
    copyTrading: { enabled: true, requiresVerification: false },
    signals: { enabled: false, requiresVerification: true }
  });

  const updatePageAccessMutation = useMutation({
    mutationFn: async (settings: typeof pageSettings) => {
      return apiRequest("PUT", "/api/admin/page-access", settings);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Page access settings updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update page access settings", variant: "destructive"});
    }
  });

  // Fetch initial settings
  const { isLoading: isLoadingPageSettings } = useQuery({
    queryKey: ["/api/admin/page-access"],
    onSuccess: (data: typeof pageSettings) => {
      setPageSettings(data);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to fetch page access settings", variant: "destructive" });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Page Access Control
        </CardTitle>
        <CardDescription>Control user access to different platform features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(pageSettings).map(([page, settings]) => (
          <div key={page} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium capitalize">{page.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div className="text-sm text-gray-600">
                {settings.enabled ? "Enabled" : "Disabled"} • 
                {settings.requiresVerification ? " Requires Verification" : " No Verification Required"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.enabled}
                onCheckedChange={(enabled) => setPageSettings(prev => ({
                  ...prev,
                  [page]: { ...prev[page as keyof typeof prev], enabled: enabled }
                }))}
                disabled={isLoadingPageSettings}
              />
              <Label className="text-xs">Enabled</Label>
              <Switch
                checked={settings.requiresVerification}
                onCheckedChange={(requiresVerification) => setPageSettings(prev => ({
                  ...prev,
                  [page]: { ...prev[page as keyof typeof prev], requiresVerification: requiresVerification }
                }))}
                disabled={!settings.enabled || isLoadingPageSettings}
              />
              <Label className="text-xs">Verification</Label>
            </div>
          </div>
        ))}
        <Button onClick={() => updatePageAccessMutation.mutate(pageSettings)} disabled={updatePageAccessMutation.isPending}>
          {updatePageAccessMutation.isPending ? "Updating..." : "Update Access Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function NewsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    type: "NEWS" as "NEWS" | "ANNOUNCEMENT" | "PROMOTION",
    severity: "INFO" as "INFO" | "WARNING" | "CRITICAL"
  });

  const { data: newsList = [], isLoading: isLoadingNews } = useQuery<News[]>({
    queryKey: ["/api/admin/news"],
  });

  const createNewsMutation = useMutation({
    mutationFn: async (news: typeof newsForm) => {
      return apiRequest("POST", "/api/admin/news", news);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "News created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      setNewsForm({ title: "", content: "", type: "NEWS", severity: "INFO" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create news", variant: "destructive"});
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (newsId: string) => {
      return apiRequest("DELETE", `/api/admin/news/${newsId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "News deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete news", variant: "destructive"});
    }
  });

  const updateNewsMutation = useMutation({
    mutationFn: async (news: News) => {
      return apiRequest("PUT", `/api/admin/news/${news.id}`, news);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "News updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update news", variant: "destructive"});
    }
  });

  const handleNewsSubmit = () => {
    createNewsMutation.mutate(newsForm);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          News Management
        </CardTitle>
        <CardDescription>Create, manage, and publish news articles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 border-b pb-4">
          <h4 className="font-medium">Create New News Item</h4>
          <div>
            <Label htmlFor="newsTitle">Title</Label>
            <Input
              id="newsTitle"
              value={newsForm.title}
              onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="News title"
              disabled={createNewsMutation.isPending}
            />
          </div>
          <div>
            <Label htmlFor="newsContent">Content</Label>
            <Textarea
              id="newsContent"
              value={newsForm.content}
              onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="News content"
              disabled={createNewsMutation.isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newsType">Type</Label>
              <Select 
                value={newsForm.type} 
                onValueChange={(value: "NEWS" | "ANNOUNCEMENT" | "PROMOTION") => setNewsForm(prev => ({ ...prev, type: value }))}
                disabled={createNewsMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEWS">News</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                  <SelectItem value="PROMOTION">Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newsSeverity">Severity</Label>
              <Select 
                value={newsForm.severity} 
                onValueChange={(value: "INFO" | "WARNING" | "CRITICAL") => setNewsForm(prev => ({ ...prev, severity: value }))}
                disabled={createNewsMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleNewsSubmit} disabled={createNewsMutation.isPending || isLoadingNews}>
            {createNewsMutation.isPending ? "Creating..." : (<><Plus className="w-4 h-4 mr-2" />Create News</>)}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Published News</h4>
          {isLoadingNews ? (
            <p>Loading news...</p>
          ) : newsList.length === 0 ? (
            <p>No news items found.</p>
          ) : (
            newsList.map((news) => (
              <div key={news.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{news.title}</div>
                  <div className="text-sm text-gray-600 truncate w-96">{news.content}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={
                      news.severity === "CRITICAL" ? "destructive" : 
                      news.severity === "WARNING" ? "secondary" : "default"
                    }>
                      {news.severity}
                    </Badge>
                    <Badge variant={news.type === "PROMOTION" ? "outline" : "default"}>
                      {news.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit News Item</DialogTitle>
                        <DialogDescription>Modify the details of this news item.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="editNewsTitle">Title</Label>
                          <Input
                            id="editNewsTitle"
                            value={newsForm.title || news.title}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="News title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editNewsContent">Content</Label>
                          <Textarea
                            id="editNewsContent"
                            value={newsForm.content || news.content}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="News content"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editNewsType">Type</Label>
                            <Select 
                              value={newsForm.type || news.type} 
                              onValueChange={(value: "NEWS" | "ANNOUNCEMENT" | "PROMOTION") => setNewsForm(prev => ({ ...prev, type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NEWS">News</SelectItem>
                                <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                                <SelectItem value="PROMOTION">Promotion</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="editNewsSeverity">Severity</Label>
                            <Select 
                              value={newsForm.severity || news.severity} 
                              onValueChange={(value: "INFO" | "WARNING" | "CRITICAL") => setNewsForm(prev => ({ ...prev, severity: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INFO">Info</SelectItem>
                                <SelectItem value="WARNING">Warning</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => updateNewsMutation.mutate({...news, title: newsForm.title || news.title, content: newsForm.content || news.content, type: newsForm.type || news.type, severity: newsForm.severity || news.severity })} disabled={updateNewsMutation.isPending}>
                          {updateNewsMutation.isPending ? "Updating..." : "Update News"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteNewsMutation.mutate(news.id)}
                    disabled={deleteNewsMutation.isPending}
                  >
                    {deleteNewsMutation.isPending ? "Deleting..." : <Trash className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}