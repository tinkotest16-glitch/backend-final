import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Timer, ArrowLeft, CreditCard, Wallet, Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CryptoWallet {
  id: string;
  name: string;
  symbol: string;
  address: string;
  qrCode: string;
  network: string;
}

const cryptoWallets: CryptoWallet[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz4KPHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0iIzAwMCI+CiAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz4KICAgIDxyZWN0IHg9IjQwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz4KICAgIDxyZWN0IHg9IjYwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz4KICA8L2c+Cjwvc3ZnPgo=",
    network: "Bitcoin Network"
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    address: "0x742d35Cc6464C4532d61B8fF5eA5D8a4E2e3A5b9",
    qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz4KPHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0iIzAwMCI+CiAgICA8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPgogICAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz4KICA8L2c+Cjwvc3ZnPgo=",
    network: "Ethereum Network"
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    address: "0x8E2B2F5F3B8C9A4E7D6C5A3F2E1B0D9C8F7A6E5D",
    qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz4KPHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0iIzAwMCI+CiAgICA8cmVjdCB4PSI2MCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPgogICAgPHJlY3QgeD0iODAiIHk9IjQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz4KICA8L2c+Cjwvc3ZnPgo=",
    network: "ERC-20"
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    address: "0x9F1E2A5C8D7B4F3E6A9C8E7D6F5A4B3C2E1D0F9E",
    qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz4KPHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0iIzAwMCI+CiAgICA8cmVjdCB4PSIxMDAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz4KICAgIDxyZWN0IHg9IjEyMCIgeT0iNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPgogIDwvZz4KPC9zdmc+Cg==",
    network: "ERC-20"
  },
  {
    id: "trx",
    name: "TRON",
    symbol: "TRX",
    address: "TQrZ8tKfjeLQjZQQBc7rY1x5Y7VqA2kJ3n",
    qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz4KPHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0iIzAwMCI+CiAgICA8cmVjdCB4PSIxMDAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz4KICAgIDxyZWN0IHg9IjE2MCIgeT0iNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPgogIDwvZz4KPC9zdmc+Cg==",
    network: "TRON Network"
  }
];

export default function Deposits() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoWallet | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setShowPaymentScreen(false);
            setSelectedCrypto(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handleCryptoSelect = (crypto: CryptoWallet) => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive"
      });
      return;
    }

    setSelectedCrypto(crypto);
    setTimeRemaining(15 * 60); // 15 minutes
    setShowPaymentScreen(true);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard"
    });
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user!.id,
          type: "DEPOSIT",
          amount: depositAmount,
          currency: selectedCrypto!.symbol,
          method: selectedCrypto!.name,
          walletAddress: selectedCrypto!.address,
          status: "PENDING"
        }),
      });

      if (response.ok) {
        toast({
          title: "Deposit Submitted",
          description: "Your deposit request has been submitted for review. You will be notified once it's processed."
        });
      } else {
        throw new Error("Failed to submit deposit");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit deposit request. Please try again.",
        variant: "destructive"
      });
    }
    
    setShowPaymentScreen(false);
    setSelectedCrypto(null);
    setDepositAmount("");
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  if (showPaymentScreen && selectedCrypto) {
    return (
      <Layout>
        <div className="min-h-screen bg-trading-primary text-white p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="trading-card border-trading-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white mb-2">
                  Deposit {selectedCrypto.symbol}
                </CardTitle>
                <div className="flex items-center justify-center space-x-2">
                  <Timer className="w-5 h-5 text-trading-accent" />
                  <span className="text-trading-accent font-bold text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-trading-muted">remaining</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <img 
                      src={selectedCrypto.qrCode} 
                      alt={`${selectedCrypto.name} QR Code`}
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-trading-muted text-sm">
                    Scan QR code or copy address below
                  </p>
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label className="text-trading-muted">Wallet Address</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={selectedCrypto.address}
                      readOnly
                      className="trading-input flex-1 font-mono text-sm"
                    />
                    <Button
                      onClick={() => handleCopyAddress(selectedCrypto.address)}
                      variant="outline"
                      size="sm"
                      data-testid="copy-address-button"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-trading-muted">
                    Network: {selectedCrypto.network}
                  </p>
                </div>

                {/* Deposit Details */}
                <div className="bg-trading-primary p-4 rounded border border-trading-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-trading-muted">Amount:</span>
                    <span className="text-white font-medium">${depositAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-trading-muted">Network:</span>
                    <span className="text-white">{selectedCrypto.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-trading-muted">Status:</span>
                    <Badge className="bg-yellow-500 text-white">Pending</Badge>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-trading-accent/10 p-4 rounded border border-trading-accent/20">
                  <h4 className="text-trading-accent font-medium mb-2">Instructions:</h4>
                  <ol className="text-sm text-trading-muted space-y-1 list-decimal list-inside">
                    <li>Send exactly ${depositAmount} worth of {selectedCrypto.symbol} to the address above</li>
                    <li>Ensure you're using the correct network ({selectedCrypto.network})</li>
                    <li>Wait for network confirmations (usually 3-6 confirmations)</li>
                    <li>Your balance will be updated automatically</li>
                  </ol>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPaymentScreen(false);
                      setSelectedCrypto(null);
                      setTimeRemaining(0);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmPayment}
                    className="flex-1 trading-button-primary"
                    data-testid="confirm-payment-button"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-trading-primary text-white">
        <div className="lg:ml-64 pt-16 lg:pt-0">
          <div className="p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">Deposits</h1>
                  <p className="text-trading-muted">
                    Deposit cryptocurrency to your trading account
                  </p>
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

              {/* Deposit Form */}
              <Card className="trading-card border-trading-border mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Cryptocurrency Deposit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount" className="text-trading-muted">
                      Deposit Amount (USD)
                    </Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      step="0.01"
                      min="1"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="trading-input"
                      placeholder="Enter amount to deposit"
                    />
                    <p className="text-xs text-trading-muted">
                      Minimum deposit: $10.00
                    </p>
                  </div>

                  {/* Cryptocurrency Options */}
                  <div className="space-y-4">
                    <Label className="text-trading-muted">Select Cryptocurrency</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cryptoWallets.map((crypto) => (
                        <Card 
                          key={crypto.id} 
                          className="trading-card border-trading-border cursor-pointer hover:border-trading-accent transition-colors"
                          onClick={() => handleCryptoSelect(crypto)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-trading-accent rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {crypto.symbol.substring(0, 2)}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-white font-medium">{crypto.name}</h3>
                                <p className="text-trading-muted text-sm">{crypto.symbol}</p>
                              </div>
                            </div>
                            <div className="text-xs text-trading-muted">
                              Network: {crypto.network}
                            </div>
                            <Button 
                              className="w-full mt-3 trading-button-primary"
                              data-testid={`select-crypto-${crypto.id}`}
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Select {crypto.symbol}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Deposit Info */}
                  <div className="bg-trading-primary p-4 rounded border border-trading-border">
                    <h4 className="text-white font-medium mb-3">Deposit Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-trading-muted">Processing Time:</span>
                        <p className="text-white">3-30 minutes</p>
                      </div>
                      <div>
                        <span className="text-trading-muted">Minimum Deposit:</span>
                        <p className="text-white">$10.00</p>
                      </div>
                      <div>
                        <span className="text-trading-muted">Network Fee:</span>
                        <p className="text-white">Paid by user</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Deposits */}
              <Card className="trading-card border-trading-border">
                <CardHeader>
                  <CardTitle className="text-white">Recent Deposits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-trading-muted">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>No recent deposits</p>
                    <p className="text-sm mt-2">Your deposit history will appear here</p>
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