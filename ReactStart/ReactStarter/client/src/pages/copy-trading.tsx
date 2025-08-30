import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Star, Users, Copy, Target, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Trader {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  winRate: number;
  totalReturn: number;
  followers: number;
  minInvestment: number;
  description: string;
  strategies: string[];
  recentTrades: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const topTraders: Trader[] = [
  {
    id: "trader-1",
    name: "Alex Rodriguez",
    avatar: "/api/placeholder/64/64",
    verified: true,
    winRate: 87.5,
    totalReturn: 245.8,
    followers: 2847,
    minInvestment: 800,
    description: "Expert forex trader specializing in EUR/USD and GBP/USD pairs with 8+ years experience.",
    strategies: ["Scalping", "Day Trading", "Technical Analysis"],
    recentTrades: 156,
    riskLevel: "Medium"
  },
  {
    id: "trader-2",
    name: "Sarah Chen",
    avatar: "/api/placeholder/64/64",
    verified: true,
    winRate: 92.3,
    totalReturn: 189.4,
    followers: 1923,
    minInvestment: 800,
    description: "Conservative trader focused on major currency pairs with excellent risk management.",
    strategies: ["Swing Trading", "Risk Management", "Fundamental Analysis"],
    recentTrades: 89,
    riskLevel: "Low"
  },
  {
    id: "trader-3",
    name: "Marcus Thompson",
    avatar: "/api/placeholder/64/64",
    verified: true,
    winRate: 78.9,
    totalReturn: 312.7,
    followers: 3456,
    minInvestment: 800,
    description: "Aggressive trader with high returns focusing on exotic pairs and commodity currencies.",
    strategies: ["High Frequency", "Momentum Trading", "News Trading"],
    recentTrades: 234,
    riskLevel: "High"
  }
];

interface CopyTrade {
  id: string;
  traderId: string;
  traderName: string;
  amount: number;
  period: number;
  startDate: string;
  lockStatus: 'locked' | 'active' | 'completed';
  remainingDays: number;
  currentReturn: number;
}

export default function CopyTrading() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Check if copy trading is disabled for this user
  if (user && !user.isCopyTradingEnabled) {
    return (
      <Layout>
        <div className="min-h-screen bg-trading-primary text-white">
          <div className="lg:ml-64 pt-16 lg:pt-0">
            <div className="p-4 lg:p-6">
              <div className="max-w-4xl mx-auto text-center py-16">
                <div className="text-trading-danger mb-4">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h1 className="text-3xl font-bold text-trading-danger mb-4">Copy Trading Disabled</h1>
                <p className="text-trading-muted mb-8">
                  Copy trading access has been disabled for your account. Please contact support for assistance.
                </p>
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="trading-button-primary"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const [selectedTrader, setSelectedTrader] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<string>("800");
  const [copyPeriod, setCopyPeriod] = useState<string>("30");
  const [activeCopyTrades, setActiveCopyTrades] = useState<CopyTrade[]>([
    {
      id: "ct-1",
      traderId: "trader-1",
      traderName: "Alex Rodriguez",
      amount: 1000,
      period: 30,
      startDate: new Date().toISOString(),
      lockStatus: 'locked',
      remainingDays: 28,
      currentReturn: 12.5
    },
    {
      id: "ct-2",
      traderId: "trader-2",
      traderName: "Sarah Chen",
      amount: 1500,
      period: 60,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      lockStatus: 'active',
      remainingDays: 45,
      currentReturn: 8.7
    }
  ]);

  const handleCopyTrader = (traderId: string) => {
    const trader = topTraders.find(t => t.id === traderId);
    const amount = parseFloat(investmentAmount);

    if (!trader) return;

    if (amount < trader.minInvestment || amount > 10000) {
      toast({
        title: "Invalid Investment Amount",
        description: `Investment must be between $${trader.minInvestment} - $10,000`,
        variant: "destructive"
      });
      return;
    }

    if (!user || parseFloat(user.totalBalance) < amount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this investment",
        variant: "destructive"
      });
      return;
    }

    // Add new copy trade to active list
    const newCopyTrade: CopyTrade = {
      id: `ct-${Date.now()}`,
      traderId,
      traderName: trader.name,
      amount,
      period: parseInt(copyPeriod),
      startDate: new Date().toISOString(),
      lockStatus: 'locked',
      remainingDays: parseInt(copyPeriod),
      currentReturn: 0
    };

    setActiveCopyTrades(prev => [...prev, newCopyTrade]);

    toast({
      title: "Copy Trading Started",
      description: `Now copying ${trader.name} with $${amount} for ${copyPeriod} days`,
    });

    setSelectedTrader("");
    setInvestmentAmount("800");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-trading-primary text-white">
        <div className="lg:ml-0 pt-16 lg:pt-0">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Copy Trading</h1>
                <p className="text-trading-muted">Follow and copy trades from professional traders</p>
              </div>
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="border-trading-border hover:bg-trading-secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            {/* Active Copy Trades */}
            {activeCopyTrades.length > 0 && (
              <Card className="trading-card mb-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Copy className="h-5 w-5" />
                    <span>Active Copy Trades</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCopyTrades.map((copyTrade) => (
                      <div key={copyTrade.id} className="bg-trading-secondary border border-trading-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium text-white">{copyTrade.traderName}</div>
                            <div className="text-sm text-trading-muted">${copyTrade.amount.toLocaleString()}</div>
                          </div>
                          <Badge className={`${
                            copyTrade.lockStatus === 'locked' ? 'bg-red-500/20 text-red-400 border-red-500' :
                            copyTrade.lockStatus === 'active' ? 'bg-green-500/20 text-green-400 border-green-500' :
                            'bg-blue-500/20 text-blue-400 border-blue-500'
                          }`}>
                            {copyTrade.lockStatus === 'locked' ? '🔒 Locked' :
                             copyTrade.lockStatus === 'active' ? '✅ Active' : '🎯 Completed'}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-trading-muted">Days Remaining:</span>
                            <span className="text-trading-accent font-medium">{copyTrade.remainingDays} days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-trading-muted">Current Return:</span>
                            <span className={`font-medium ${copyTrade.currentReturn >= 0 ? 'text-trading-success' : 'text-trading-danger'}`}>
                              {copyTrade.currentReturn >= 0 ? '+' : ''}{copyTrade.currentReturn}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-trading-muted">Lock Status:</span>
                            <span className="text-white">
                              {copyTrade.lockStatus === 'locked' ? 'Trade Locked - Auto Trading' : 'Active Trading'}
                            </span>
                          </div>
                        </div>

                        {/* Countdown Timer */}
                        <div className="mt-3 pt-3 border-t border-trading-border">
                          <div className="text-xs text-trading-muted mb-1">Time Lock Countdown:</div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-mono text-trading-accent">
                              {Math.floor(copyTrade.remainingDays)}d {Math.floor((copyTrade.remainingDays % 1) * 24)}h remaining
                            </div>
                            <div className="w-16 h-2 bg-trading-primary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-trading-accent transition-all duration-1000"
                                style={{
                                  width: `${Math.max(0, 100 - (copyTrade.remainingDays / copyTrade.period) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Traders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {topTraders.map((trader) => (
                <Card key={trader.id} className="trading-card border-trading-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={trader.avatar} alt={trader.name} />
                        <AvatarFallback className="bg-trading-accent text-trading-primary font-bold">
                          {trader.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-white">{trader.name}</h3>
                          {trader.verified && (
                            <Badge className="bg-trading-success text-trading-primary">
                              <Star className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-trading-muted mt-1">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {trader.followers.toLocaleString()}
                          </span>
                          <Badge variant="outline" className={`text-xs ${
                            trader.riskLevel === 'Low' ? 'border-green-500 text-green-400' :
                            trader.riskLevel === 'Medium' ? 'border-yellow-500 text-yellow-400' :
                            'border-red-500 text-red-400'
                          }`}>
                            {trader.riskLevel} Risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-trading-muted">{trader.description}</p>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-trading-success">
                          {trader.winRate}%
                        </div>
                        <div className="text-xs text-trading-muted">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-trading-accent">
                          +{trader.totalReturn}%
                        </div>
                        <div className="text-xs text-trading-muted">Total Return</div>
                      </div>
                    </div>

                    {/* Strategies */}
                    <div>
                      <div className="text-xs text-trading-muted mb-2">Strategies:</div>
                      <div className="flex flex-wrap gap-1">
                        {trader.strategies.map((strategy, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-xs text-trading-muted">
                      <span>Recent Trades: {trader.recentTrades}</span>
                      <span>Min: ${trader.minInvestment.toLocaleString()}</span>
                    </div>

                    <Button
                      onClick={() => setSelectedTrader(trader.id)}
                      className="w-full trading-button-primary"
                      data-testid={`copy-trader-${trader.id}`}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Trader
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Copy Trading Form Modal */}
            {selectedTrader && (
              <Card className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-trading-secondary border border-trading-border rounded-lg p-6 w-full max-w-md">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Copy Trader</h3>
                    <p className="text-trading-muted">
                      Set up your copy trading parameters
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-trading-muted">Selected Trader</Label>
                      <div className="mt-1 p-3 bg-trading-primary rounded border border-trading-border">
                        <div className="text-white font-medium">
                          {topTraders.find(t => t.id === selectedTrader)?.name}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="investment-amount" className="text-sm text-trading-muted">
                        Investment Amount (USD)
                      </Label>
                      <Input
                        id="investment-amount"
                        type="number"
                        min="800"
                        max="10000"
                        step="100"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="trading-input mt-1"
                        placeholder="Minimum $800, Maximum $10,000"
                      />
                      <p className="text-xs text-trading-muted mt-1">
                        Minimum investment: $800, Maximum allowed: $10,000
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="copy-period" className="text-sm text-trading-muted">
                        Copy Period
                      </Label>
                      <Select value={copyPeriod} onValueChange={setCopyPeriod}>
                        <SelectTrigger className="trading-input mt-1">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 Days</SelectItem>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="60">60 Days</SelectItem>
                          <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-trading-primary p-3 rounded border border-trading-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-trading-muted">Expected Earnings:</span>
                        <span className="text-trading-success font-medium">
                          {((parseFloat(investmentAmount) || 0) * 0.15).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-trading-muted">Lock Period:</span>
                        <span className="text-white">{copyPeriod} Days</span>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTrader("")}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleCopyTrader(selectedTrader)}
                        className="flex-1 trading-button-primary"
                        data-testid="confirm-copy-trading"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Start Copying
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}