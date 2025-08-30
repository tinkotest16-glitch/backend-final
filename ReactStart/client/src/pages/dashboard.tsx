import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTradingPairs } from "@/hooks/use-trading";
import { usePriceSimulation, useLivePrices } from "@/hooks/use-prices";
import { Layout } from "@/components/layout/layout";
import { Sidebar } from "@/components/ui/sidebar";
import { BalanceCards } from "@/components/trading/balance-cards";
import { ConvertBalance } from "@/components/trading/convert-balance";
import TradingPairs from "@/components/trading/trading-pairs";
import { QuickTrade } from "@/components/trading/quick-trade";
import { TradingHistory } from "@/components/trading/trading-history";
import { ActiveTrades } from "@/components/trading/active-trades";
import { WalletManagement } from "@/components/trading/wallet-management";
// Removed Market News and Referral Section - now separate pages
import { SettingsModal } from "@/components/modals/settings-modal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus, Activity, TrendingUp, History, DollarSign, ArrowUpDown, Newspaper, Users, Settings, LogOut, Bell, Search, X, Calendar, Target, Award, ChevronUp, ChevronDown, Eye, EyeOff, Copy, Zap } from "lucide-react";
import { EnhancedTradingPair } from "@/lib/price-simulation";
// Dashboard imports

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPairId, setSelectedPairId] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: tradingPairs, isLoading: pairsLoading } = useTradingPairs();
  const simulatedPairs = usePriceSimulation(tradingPairs || []);
  const { lastUpdate, isLive } = useLivePrices();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    if (simulatedPairs.length > 0 && !selectedPairId) {
      setSelectedPairId(simulatedPairs[0].id);
    }
  }, [simulatedPairs, selectedPairId]);

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

  const selectedPair = simulatedPairs.find(pair => pair.id === selectedPairId) || simulatedPairs[0];

  return (
    <Layout showHeader={true} showFooter={true}>
      <div className="min-h-screen bg-trading-primary text-white">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar - Now closable */}
          <div className="hidden lg:flex">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="fixed top-4 left-4 z-50 bg-trading-secondary border border-trading-border"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-trading-secondary border-trading-border w-64 max-h-screen overflow-y-auto">
                <Sidebar 
                  onSettingsClick={() => {
                    setShowSettings(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full h-full"
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="bg-trading-secondary border border-trading-border">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-trading-secondary border-trading-border w-64 max-h-screen overflow-y-auto">
                <Sidebar 
                  onSettingsClick={() => {
                    setShowSettings(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full h-full"
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <main className="flex-1 w-full max-w-full overflow-x-hidden pb-20">
            {/* Top Header Bar - Mobile Responsive */}
            <header className="bg-trading-secondary border-b border-trading-border p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-xl lg:text-2xl font-semibold">Trading Dashboard</h2>
                  <span className="text-sm text-gray-400">
                    Last updated: <span className="text-trading-accent">{lastUpdate}</span>
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 bg-trading-success rounded-full ${isLive ? 'pulse-live' : ''}`}></div>
                    <span className="text-sm text-gray-400">Live</span>
                  </div>
                  <Button 
                    className="trading-button-primary"
                    onClick={() => {
                      const tradingSection = document.getElementById('trading');
                      tradingSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Trade
                  </Button>
                </div>
              </div>
            </header>

            <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 min-h-screen w-full max-w-full">
              {/* Balance Overview */}
              <section id="balances" className="space-y-3 sm:space-y-4">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Account Overview</h3>
                <BalanceCards user={user} />
              </section>

              {/* Convert Balance */}
              <section id="convert" className="space-y-3 sm:space-y-4">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Convert Balance</h3>
                <ConvertBalance userId={user.id} />
              </section>

              {/* Trading Section - Fully responsive */}
              <section id="trading" className="space-y-4 lg:space-y-6">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Trading Pairs</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {/* Trading Pairs */}
                  <div className="w-full min-w-0 order-1">
                    <TradingPairs 
                      pairs={simulatedPairs}
                      selectedPairId={selectedPairId}
                      onSelectPair={setSelectedPairId}
                      isLoading={pairsLoading}
                    />
                  </div>

                  {/* Quick Trade */}
                  <div id="quick-trade" className="w-full min-w-0 order-2">
                    <QuickTrade 
                      selectedPair={selectedPair}
                      userId={user.id}
                      tradingBalance={parseFloat(user.tradingBalance)}
                    />
                  </div>
                </div>
              </section>

              {/* Active Trades */}
              <section id="active-trades" className="space-y-3 sm:space-y-4">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Active Trades</h3>
                <ActiveTrades userId={user.id} />
              </section>

              {/* Trading History */}
              <section id="history" className="space-y-3 sm:space-y-4 mb-8 pb-20">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Recent Trades</h3>
                <TradingHistory userId={user.id} />
              </section>
            </div>

            {/* Settings Modal */}
            {showSettings && (
              <SettingsModal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
                user={user}
              />
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}