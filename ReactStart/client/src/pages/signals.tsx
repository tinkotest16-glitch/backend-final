import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Clock, Target, Zap, Crown, Award, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/layout";

interface SignalOffer {
  id: string;
  title: string;
  provider: string;
  price: number;
  originalPrice?: number;
  duration: string;
  accuracy: number;
  signalsPerDay: number;
  pairs: string[];
  features: string[];
  rating: number;
  subscribers: number;
  badge?: 'Premium' | 'Popular' | 'New';
  description: string;
}

const signalOffers: SignalOffer[] = [
  {
    id: "signal-1",
    title: "Pro Forex Signals",
    provider: "FX Masters",
    price: 97,
    originalPrice: 197,
    duration: "30 days",
    accuracy: 89.5,
    signalsPerDay: 5,
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"],
    features: ["Entry & Exit Points", "TP/SL Levels", "Risk Management", "24/7 Support"],
    rating: 4.8,
    subscribers: 3247,
    badge: "Popular",
    description: "Professional grade signals with proven track record. Perfect for both beginners and experienced traders."
  },
  {
    id: "signal-2",
    title: "Elite Trading Signals",
    provider: "Market Wizards",
    price: 147,
    originalPrice: 297,
    duration: "30 days",
    accuracy: 92.3,
    signalsPerDay: 3,
    pairs: ["EUR/USD", "GBP/USD", "USD/CHF", "USD/CAD", "AUD/USD", "NZD/USD"],
    features: ["Premium Analysis", "Market Commentary", "Economic Calendar", "VIP Support", "Telegram Group"],
    rating: 4.9,
    subscribers: 1856,
    badge: "Premium",
    description: "Exclusive signals from professional traders with institutional experience. High accuracy with detailed analysis."
  },
  {
    id: "signal-3",
    title: "Scalping Signals Pro",
    provider: "Quick Profits",
    price: 67,
    duration: "30 days",
    accuracy: 86.7,
    signalsPerDay: 8,
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY"],
    features: ["Scalping Strategies", "Quick Entries", "Fast Execution", "Mobile Alerts"],
    rating: 4.6,
    subscribers: 2134,
    badge: "New",
    description: "Fast-paced scalping signals for traders who prefer quick profits with minimal holding time."
  },
  {
    id: "signal-4",
    title: "Swing Trading Signals",
    provider: "Trend Followers",
    price: 87,
    originalPrice: 167,
    duration: "30 days",
    accuracy: 88.2,
    signalsPerDay: 2,
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "EUR/GBP"],
    features: ["Long-term Trends", "Weekly Analysis", "Risk Management", "Educational Content"],
    rating: 4.7,
    subscribers: 1923,
    description: "Perfect for traders who prefer longer holding periods and capturing major market movements."
  },
  {
    id: "signal-5",
    title: "AI Trading Signals",
    provider: "AlgoTrade AI",
    price: 127,
    originalPrice: 227,
    duration: "30 days",
    accuracy: 91.1,
    signalsPerDay: 4,
    pairs: ["All Major Pairs", "Crypto", "Commodities"],
    features: ["AI Algorithm", "Machine Learning", "Multi-Asset", "Real-time Analytics", "API Access"],
    rating: 4.8,
    subscribers: 2876,
    badge: "Premium",
    description: "Advanced AI-powered signals covering forex, crypto, and commodities with machine learning algorithms."
  },
  {
    id: "signal-6",
    title: "News Trading Signals",
    provider: "Economic Events",
    price: 77,
    duration: "30 days",
    accuracy: 84.9,
    signalsPerDay: 6,
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF"],
    features: ["News Events", "Economic Calendar", "Instant Alerts", "Impact Analysis"],
    rating: 4.5,
    subscribers: 1678,
    description: "Capitalize on market volatility during major news events and economic announcements."
  }
];

export default function Signals() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleBuySignal = (signalId: string) => {
    // Redirect to deposits page
    setLocation("/deposits");
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Premium': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'Popular': return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case 'New': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default: return '';
    }
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case 'Premium': return <Crown className="w-3 h-3 mr-1" />;
      case 'Popular': return <Star className="w-3 h-3 mr-1" />;
      case 'New': return <Zap className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-trading-primary text-white">
        <div className="lg:ml-0 pt-16 lg:pt-0">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Trading Signals</h1>
                <p className="text-trading-muted">
                  Premium trading signals from professional traders and institutions
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

            {/* Signal Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {signalOffers.map((signal) => (
                <Card key={signal.id} className="trading-card border-trading-border relative overflow-hidden">
                  {/* Badge */}
                  {signal.badge && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className={`${getBadgeColor(signal.badge)} font-semibold`}>
                        {getBadgeIcon(signal.badge)}
                        {signal.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="space-y-2">
                      <CardTitle className="text-xl text-white">{signal.title}</CardTitle>
                      <div className="flex items-center justify-between">
                        <span className="text-trading-muted">{signal.provider}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-white">{signal.rating}</span>
                          <span className="text-xs text-trading-muted">({signal.subscribers})</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-trading-muted">{signal.description}</p>

                    {/* Price */}
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-trading-accent">${signal.price}</span>
                      {signal.originalPrice && (
                        <span className="text-lg text-trading-muted line-through">${signal.originalPrice}</span>
                      )}
                      <span className="text-sm text-trading-muted">/ {signal.duration}</span>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-trading-success">
                          {signal.accuracy}%
                        </div>
                        <div className="text-xs text-trading-muted">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-trading-accent">
                          {signal.signalsPerDay}
                        </div>
                        <div className="text-xs text-trading-muted">Signals/Day</div>
                      </div>
                    </div>

                    {/* Trading Pairs */}
                    <div>
                      <div className="text-xs text-trading-muted mb-2">Trading Pairs:</div>
                      <div className="flex flex-wrap gap-1">
                        {signal.pairs.slice(0, 3).map((pair, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {pair}
                          </Badge>
                        ))}
                        {signal.pairs.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{signal.pairs.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <div className="text-xs text-trading-muted mb-2">Features:</div>
                      <ul className="text-xs space-y-1">
                        {signal.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-trading-muted">
                            <TrendingUp className="w-3 h-3 mr-2 text-trading-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Duration and Subscribers */}
                    <div className="flex justify-between text-xs text-trading-muted border-t border-trading-border pt-3">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {signal.duration}
                      </span>
                      <span>{signal.subscribers.toLocaleString()} subscribers</span>
                    </div>

                    <Button
                      onClick={() => handleBuySignal(signal.id)}
                      className="w-full trading-button-primary"
                      data-testid={`buy-signal-${signal.id}`}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Buy Signal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <Card className="trading-card border-trading-border bg-gradient-to-r from-trading-accent/10 to-trading-success/10">
                <CardContent className="py-8">
                  <Award className="w-12 h-12 mx-auto mb-4 text-trading-accent" />
                  <h3 className="text-xl font-bold text-white mb-2">Need Help Choosing?</h3>
                  <p className="text-trading-muted mb-4">
                    Our team can help you select the best signal package for your trading style
                  </p>
                  <Button className="trading-button-primary">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}