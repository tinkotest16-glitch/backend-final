import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useEffect } from "react";

interface ReferralUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  referralCode: string;
  referralCount: number;
  activeReferrals: number;
  referralEarnings: string;
}

interface CommissionHistoryItem {
  date: string;
  amount: string;
  source: string;
}

interface ReferralDetail {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeDetails: {
    fullName: string;
    email: string;
    totalBalance: string;
    tradingBalance?: string;
  };
  commission: string;
  totalEarnings: string;
  lastEarning?: string;
  isActive: boolean;
  createdAt: string;
  lastActivityAt?: string;
  commissionHistory?: CommissionHistoryItem[];
}

export function ReferralManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<ReferralUser | null>(null);
  const [referralForm, setReferralForm] = useState({
    referralCount: 0,
    // Always fetch latest users after any update
    activeReferrals: 0,
    referralEarnings: "0"
  });

  const { data: users = [] } = useQuery<ReferralUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: referralDetails = [], isLoading: isLoadingDetails } = useQuery<ReferralDetail[]>({
    queryKey: ["/api/admin/referrals", selectedUser?.id],
    enabled: !!selectedUser?.id
  });

  const updateReferralMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      referralCount: number;
      activeReferrals: number;
      referralEarnings: string;
    }) => {
      try {
        console.log("Starting referral update for user:", data.userId);
        // Use correct endpoint for referral/balance update
        const updateResponse = await apiRequest("PUT", `/api/admin/user/${data.userId}/balance`, {
          referralCount: data.referralCount,
          activeReferrals: data.activeReferrals,
          referralEarnings: data.referralEarnings
        });
        console.log("Update response:", await updateResponse.json());
        // Force immediate data refresh
        await Promise.all([
          apiRequest("POST", `/api/admin/user/${data.userId}/refresh-data`, {}),
          apiRequest("POST", `/api/admin/user/${data.userId}/refresh-referrals`, {}),
          apiRequest("POST", `/api/admin/user/${data.userId}/update-referred-balances`, {})
        ]);
        // Invalidate and refetch all queries immediately
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
          queryClient.invalidateQueries({ queryKey: [`/api/referrals/user/${data.userId}`] }),
    // Always show latest data after update
          queryClient.invalidateQueries({ queryKey: [`/api/user/${data.userId}/referrals`] }),
          queryClient.invalidateQueries({ queryKey: ["/api/user/balance"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] })
        ]);
        // Force refetch of critical data
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ["/api/admin/users"] }),
          queryClient.refetchQueries({ queryKey: [`/api/referrals/user/${data.userId}`] }),
          queryClient.refetchQueries({ queryKey: [`/api/user/${data.userId}/referrals`] })
        ]);
        // Dispatch custom event for real-time updates
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('referral-stats-updated', { 
            detail: { 
              userId: data.userId,
              updates: data
            }
          });
          window.dispatchEvent(event);
          console.log("Dispatched referral-stats-updated event:", event);
        }
        return { success: true };
      } catch (error) {
        console.error("Error in updateReferralMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Referral details updated successfully" });
      // Dispatch custom event for real-time user dashboard sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('referral-stats-updated'));
      }
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error("Error updating referrals:", error);
      toast({ title: "Error", description: "Failed to update referral details", variant: "destructive" });
    }
  });

  const handleUpdateReferrals = () => {
    if (!selectedUser) return;
    
    // Validate referral data
    const referralCount = parseInt(referralForm.referralCount.toString());
    const activeReferrals = parseInt(referralForm.activeReferrals.toString());
    const earnings = parseFloat(referralForm.referralEarnings);
    
    if (isNaN(referralCount) || referralCount < 0) {
      toast({
        title: "Invalid Input",
        description: "Total referrals must be a positive number",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(activeReferrals) || activeReferrals < 0) {
      toast({
        title: "Invalid Input",
        description: "Active referrals must be a positive number",
        variant: "destructive"
      });
      return;
    }
    
    if (activeReferrals > referralCount) {
      toast({
        title: "Invalid Input",
        description: "Active referrals cannot exceed total referrals",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(earnings) || earnings < 0) {
      toast({
        title: "Invalid Input",
        description: "Earnings must be a positive number",
        variant: "destructive"
      });
      return;
    }
    
    const formData = {
      userId: selectedUser.id,
      referralCount,
      activeReferrals,
      referralEarnings: earnings.toFixed(2)
    };
    
    console.log("Updating referrals:", formData);
    updateReferralMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Referral Management
        </CardTitle>
        <CardDescription>Manage user referrals and commission earnings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Referral Overview</CardTitle>
              <CardDescription>View and manage user referral statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Total Referrals</TableHead>
                    <TableHead>Active Referrals</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.referralCode}</Badge>
                      </TableCell>
                      <TableCell>{user.referralCount || 0}</TableCell>
                      <TableCell>{user.activeReferrals || 0}</TableCell>
                      <TableCell className="text-green-600">${user.referralEarnings || "0.00"}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setReferralForm({
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
                              <DialogTitle>Update Referral Details</DialogTitle>
                              <DialogDescription>
                                Manage referral statistics for {user.fullName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="referralCount">Total Referrals</Label>
                                <Input
                                  id="referralCount"
                                  type="number"
                                  value={referralForm.referralCount}
                                  onChange={(e) => setReferralForm(prev => ({
                                    ...prev,
                                    referralCount: parseInt(e.target.value)
                                  }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="activeReferrals">Active Referrals</Label>
                                <Input
                                  id="activeReferrals"
                                  type="number"
                                  value={referralForm.activeReferrals}
                                  onChange={(e) => setReferralForm(prev => ({
                                    ...prev,
                                    activeReferrals: parseInt(e.target.value)
                                  }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="referralEarnings">Total Earnings ($)</Label>
                                <Input
                                  id="referralEarnings"
                                  type="number"
                                  step="0.01"
                                  value={referralForm.referralEarnings}
                                  onChange={(e) => setReferralForm(prev => ({
                                    ...prev,
                                    referralEarnings: e.target.value
                                  }))}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleUpdateReferrals}
                                disabled={updateReferralMutation.isPending}
                              >
                                {updateReferralMutation.isPending ? "Updating..." : "Update Referrals"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedUser && (
            <>
              {/* Referral Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Referral Overview - {selectedUser.fullName}</CardTitle>
                  <CardDescription>Key referral statistics for this user</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-trading-secondary">
                      <p className="text-sm font-medium text-gray-400">Total Referrals</p>
                      <h3 className="text-2xl font-bold">{selectedUser.referralCount || 0}</h3>
                    </div>
                    <div className="p-4 rounded-lg bg-trading-secondary">
                      <p className="text-sm font-medium text-gray-400">Active Referrals</p>
                      <h3 className="text-2xl font-bold">{selectedUser.activeReferrals || 0}</h3>
                    </div>
                    <div className="p-4 rounded-lg bg-trading-secondary">
                      <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                      <h3 className="text-2xl font-bold text-green-500">${selectedUser.referralEarnings || "0.00"}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Details Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Detailed Referral History</CardTitle>
                  <CardDescription>Complete referral performance tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDetails ? (
                    <div className="flex justify-center py-8">
                      <div className="spinner w-6 h-6"></div>
                    </div>
                  ) : referralDetails.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No referrals found for this user.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Detailed Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Referred User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Commission Rate</TableHead>
                            <TableHead>Total Earnings</TableHead>
                            <TableHead>Date Joined</TableHead>
                            <TableHead>Last Activity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralDetails.map((referral) => (
                            <TableRow key={referral.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{referral.refereeDetails.fullName}</div>
                                  <div className="text-sm text-gray-500">{referral.refereeDetails.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={referral.isActive ? "default" : "secondary"}
                                  className={referral.isActive ? "bg-green-500" : ""}
                                >
                                  {referral.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">${referral.refereeDetails.totalBalance}</div>
                                  <div className="text-xs text-gray-500">
                                    Trading: ${referral.refereeDetails.tradingBalance || "0.00"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {(parseFloat(referral.commission) * 100).toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-green-500">${referral.totalEarnings}</div>
                                  {referral.lastEarning && (
                                    <div className="text-xs text-gray-500">
                                      Last: ${referral.lastEarning}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div>{new Date(referral.createdAt).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(referral.createdAt).toLocaleTimeString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {referral.lastActivityAt ? (
                                  <div className="space-y-1">
                                    <div>{new Date(referral.lastActivityAt).toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(referral.lastActivityAt).toLocaleTimeString()}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No activity</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {/* Commission History */}
                      {referralDetails.some(ref => (ref.commissionHistory || []).length > 0) && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold mb-4">Commission History</h3>
                          <div className="space-y-4">
                            {referralDetails.map(referral => 
                              referral.commissionHistory?.map((hist, idx) => (
                                <div key={`${referral.id}-${idx}`} className="p-4 border border-gray-700 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{referral.refereeDetails.fullName}</p>
                                      <p className="text-sm text-gray-400">
                                        {new Date(hist.date).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-green-500 font-bold">${hist.amount}</p>
                                      <p className="text-sm text-gray-400">
                                        From: {hist.source}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}