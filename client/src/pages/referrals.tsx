import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/layout";
import { Users, Gift, Copy, DollarSign, TrendingUp, UserPlus, Calendar, Share, ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/trading";
import { useLocation } from "wouter";

interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  commission: string;
  totalEarnings: string;
  createdAt: string;
}

export default function Referrals() {

  const { user } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Refetch referral stats every 5 seconds for real-time updates
  // Track the last update time to avoid duplicate updates
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const updateThrottleMs = 1000; // Minimum time between updates

  const { data: referrals = [], isLoading, refetch } = useQuery({
    queryKey: [`/api/referrals/user/${user?.id}`],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log("Fetching referrals for user:", user.id);
      const response = await apiRequest("GET", `/api/referrals/user/${user.id}`);
      const data = await response.json();
      console.log("Fetched referrals:", data);
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
    staleTime: 0,
    retry: 2
  });

  // Handle real-time updates from admin panel
  useEffect(() => {
    const handler = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const now = Date.now();
      
      // Throttle updates
      if (now - lastUpdateTime < updateThrottleMs) {
        console.log("Update throttled");
        return;
      }

      console.log("Received referral-stats-updated event:", customEvent.detail);
      
      if (customEvent.detail?.userId === user?.id && user?.id) {
        console.log("Updating data for current user");
        // Invalidate all relevant queries and refetch
        setLastUpdateTime(now);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [`/api/referrals/user/${user.id}`] }),
          refetch()
        ]);
      }
    };

    window.addEventListener("referral-stats-updated", handler);
    return () => window.removeEventListener("referral-stats-updated", handler);
  }, [refetch, queryClient, user?.id, lastUpdateTime, updateThrottleMs]);

            const copyReferralLink = async () => {
              if (!user?.referralCode) return;
              const referralLink = `${window.location.origin}/login?ref=${user.referralCode}`;
              try {
                await navigator.clipboard.writeText(referralLink);
                setCopySuccess(true);
                toast({ title: "Copied!", description: "Referral link copied to clipboard" });
                setTimeout(() => setCopySuccess(false), 2000);
              } catch (err) {
                toast({ title: "Error", description: "Failed to copy referral link", variant: "destructive" });
              }
            };

            const shareReferralLink = () => {
              if (!user?.referralCode) return;
              const referralLink = `${window.location.origin}/login?ref=${user.referralCode}`;
              const shareText = `Join ProTrader and start trading with a professional platform! Use my referral link: ${referralLink}`;
              if (navigator.share) {
                navigator.share({ title: "Join ProTrader", text: shareText, url: referralLink });
              } else {
                copyReferralLink();
              }
            };

            // Always use latest user stats
            const totalEarnings = parseFloat(user?.referralEarnings || "0");
            const totalReferrals = referrals.length;
            const activeReferrals = referrals.filter((ref: Referral) => parseFloat(ref.totalEarnings) > 0).length;

            return (
              <Layout>
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl lg:text-3xl font-bold">Referral Program</h1>
                      <Button
                        onClick={() => setLocation("/dashboard")}
                        variant="outline"
                        className="border-trading-border hover:bg-trading-secondary"
                        data-testid="button-back-dashboard"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </div>
                    <p className="text-trading-muted">Earn commissions by referring friends to PrimeEdgeMarket</p>
                  </div>

                  {/* Referral Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="trading-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-trading-muted">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-trading-success" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-trading-success">
                          {formatCurrency(totalEarnings)}
                        </div>
                        <p className="text-xs text-trading-muted">Lifetime referral earnings</p>
                      </CardContent>
                    </Card>
                    <Card className="trading-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-trading-muted">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-trading-accent" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-trading-text">{totalReferrals}</div>
                        <p className="text-xs text-trading-muted">People you've referred</p>
                      </CardContent>
                    </Card>
                    <Card className="trading-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-trading-muted">Active Referrals</CardTitle>
                        <TrendingUp className="h-4 w-4 text-trading-warning" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-trading-text">{activeReferrals}</div>
                        <p className="text-xs text-trading-muted">Earning commissions</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Referral Link Section */}
                  <Card className="trading-card mb-8">
                    <CardHeader>
                      <CardTitle className="text-trading-text flex items-center gap-2">
                        <Share className="h-5 w-5" />
                        Your Referral Link
                      </CardTitle>
                      <CardDescription className="text-trading-muted">Share this link with friends to earn 10% commission on their profitable trades</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={user?.referralCode ? `${window.location.origin}/login?ref=${user.referralCode}` : ""}
                          className="trading-input"
                        />
                        <Button
                          onClick={copyReferralLink}
                          variant="outline"
                          className="border-trading-border text-trading-text hover:bg-trading-secondary"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {copySuccess ? "Copied!" : "Copy"}
                        </Button>
                        <Button onClick={shareReferralLink} className="trading-button-primary">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                      <div className="bg-trading-secondary/50 rounded-lg p-4">
                        <h4 className="font-semibold text-trading-text mb-2">How it works:</h4>
                        <ul className="text-sm text-trading-muted space-y-1">
                          <li>• Share your referral link with friends</li>
                          <li>• They sign up and start trading</li>
                          <li>• You earn 10% commission on their profitable trades</li>
                          <li>• Commissions are added to your referral earnings</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Referral History */}
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle className="text-trading-text flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Referral History
                      </CardTitle>
                      <CardDescription className="text-trading-muted">Track your referrals and their performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-trading-border rounded-lg">
                              <div className="space-y-2">
                                <div className="h-4 w-32 bg-trading-secondary rounded animate-pulse" />
                                <div className="h-3 w-24 bg-trading-secondary rounded animate-pulse" />
                              </div>
                              <div className="h-6 w-16 bg-trading-secondary rounded animate-pulse" />
                            </div>
                          ))}
                        </div>
                      ) : referrals.length === 0 ? (
                        <div className="text-center py-12">
                          <UserPlus className="h-16 w-16 text-trading-muted/50 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-trading-text mb-2">No Referrals Yet</h3>
                          <p className="text-trading-muted mb-6">Start sharing your referral link to earn commissions from your friends' trading activities.</p>
                          <Button onClick={copyReferralLink} className="trading-button-primary">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Referral Link
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {referrals.map((referral: Referral) => (
                            <div key={referral.id} className="flex items-center justify-between p-4 border border-trading-border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-trading-accent/20 rounded-full flex items-center justify-center">
                                  <UserPlus className="h-5 w-5 text-trading-accent" />
                                </div>
                                <div>
                                  <div className="font-medium text-trading-text">Referral #{referral.id.slice(0, 8)}</div>
                                  <div className="text-sm text-trading-muted flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(referral.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-trading-success">{formatCurrency(parseFloat(referral.totalEarnings))}</div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${parseFloat(referral.totalEarnings) > 0 ? "border-trading-success text-trading-success" : "border-trading-muted text-trading-muted"}`}
                                >
                                  {parseFloat(referral.commission) * 100}% commission
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Layout>
            );
          }