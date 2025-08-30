
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { EnhancedTradingPair } from "@/lib/price-simulation";
import { formatPrice, formatCurrency } from "@/lib/trading";
import { cn } from "@/lib/utils";

interface TradingPairsProps {
  pairs: EnhancedTradingPair[];
  selectedPairId?: string;
  onSelectPair: (pairId: string) => void;
  isLoading?: boolean;
}

export default function TradingPairs({ pairs = [], selectedPairId, onSelectPair, isLoading }: TradingPairsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Categorize pairs
  const categories = useMemo(() => {
    if (!pairs || pairs.length === 0) return [];
    const cats = new Set<string>();
    pairs.forEach(pair => {
      if (pair.symbol && pair.symbol.includes('/')) {
        const [base, quote] = pair.symbol.split('/');
        if (['BTC', 'ETH', 'LTC', 'ADA', 'DOT', 'BNB', 'SOL', 'AVAX'].includes(base)) {
          cats.add('CRYPTO');
        } else if (['XAU', 'XAG', 'XPD', 'XPT', 'WTI', 'BRENT', 'NATGAS'].includes(base)) {
          cats.add('COMMODITIES');
        } else {
          cats.add('FOREX');
        }
      }
    });
    return Array.from(cats);
  }, [pairs]);

  // Filter pairs based on search and category
  const filteredPairs = useMemo(() => {
    if (!pairs || pairs.length === 0) return [];
    return pairs.filter(pair => {
      const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pair.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (categoryFilter === "ALL") return matchesSearch;
      
      const [base] = pair.symbol.split('/');
      let pairCategory = 'FOREX';
      if (['BTC', 'ETH', 'LTC', 'ADA', 'DOT', 'BNB', 'SOL', 'AVAX'].includes(base)) {
        pairCategory = 'CRYPTO';
      } else if (['XAU', 'XAG', 'XPD', 'XPT', 'WTI', 'BRENT', 'NATGAS'].includes(base)) {
        pairCategory = 'COMMODITIES';
      }
      
      return matchesSearch && pairCategory === categoryFilter;
    });
  }, [pairs, searchTerm, categoryFilter]);

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-trading-text">Trading Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="spinner w-6 h-6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-trading-text font-bold text-xl">Trading Pairs</CardTitle>
            <CardDescription className="text-trading-muted">
              Select a trading pair to start trading • {pairs?.length || 0} pairs available
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-trading-success/10 text-trading-success border-trading-success/30">
            <Activity className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-trading-muted" />
            <Input
              placeholder="Search pairs..."
              className="trading-input pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoryFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("ALL")}
              className={cn(
                "text-xs",
                categoryFilter === "ALL" ? "trading-button-primary" : "border-trading-border hover:bg-trading-accent/10"
              )}
            >
              All ({pairs?.length || 0})
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className={cn(
                  "text-xs",
                  categoryFilter === category ? "trading-button-primary" : "border-trading-border hover:bg-trading-accent/10"
                )}
              >
                {category} ({pairs?.filter(p => {
                  if (!p.symbol) return false;
                  const [base] = p.symbol.split('/');
                  if (category === 'CRYPTO') return ['BTC', 'ETH', 'LTC', 'ADA', 'DOT', 'BNB', 'SOL', 'AVAX'].includes(base);
                  if (category === 'COMMODITIES') return ['XAU', 'XAG', 'XPD', 'XPT', 'WTI', 'BRENT', 'NATGAS'].includes(base);
                  return !['BTC', 'ETH', 'LTC', 'ADA', 'DOT', 'BNB', 'SOL', 'AVAX', 'XAU', 'XAG', 'XPD', 'XPT', 'WTI', 'BRENT', 'NATGAS'].includes(base);
                }).length || 0})
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96 custom-scrollbar">
          <div className="space-y-1 p-4">
            {filteredPairs.length === 0 ? (
              <div className="text-center py-8 text-trading-muted">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No trading pairs found</p>
                <p className="text-sm">Try adjusting your search or filter</p>
              </div>
            ) : (
              filteredPairs.map((pair) => {
                const isSelected = selectedPairId === pair.id;
                const isPositive = pair.priceDirection === 'up';
                const isNegative = pair.priceDirection === 'down';

                return (
                  <div
                    key={pair.id}
                    className={cn(
                      "trading-pair-item group cursor-pointer rounded-lg p-3 transition-all duration-200",
                      "hover:bg-trading-secondary/50 hover:shadow-md",
                      isSelected && "bg-trading-accent/10 border-l-4 border-trading-accent shadow-md"
                    )}
                    onClick={() => onSelectPair(pair.id)}
                  >
                    <div className="flex items-center justify-between">
                      {/* Pair Info */}
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                          style={{ backgroundColor: pair.color }}
                        >
                          {pair.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-trading-text group-hover:text-trading-accent transition-colors">
                            {pair.symbol}
                          </div>
                          <div className="text-xs text-trading-muted truncate max-w-32">
                            {pair.name}
                          </div>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="text-right">
                        <div className={cn(
                          "font-bold text-lg transition-colors",
                          isPositive && "text-trading-success",
                          isNegative && "text-trading-danger",
                          !isPositive && !isNegative && "text-trading-text"
                        )}>
                          {formatPrice(pair.currentPrice, pair.symbol.includes('JPY') ? 2 : 4)}
                        </div>
                        
                        {pair.changePercent !== undefined && (
                          <div className={cn(
                            "text-xs font-medium flex items-center justify-end space-x-1",
                            isPositive && "text-trading-success",
                            isNegative && "text-trading-danger"
                          )}>
                            {isPositive && <TrendingUp className="w-3 h-3" />}
                            {isNegative && <TrendingDown className="w-3 h-3" />}
                            <span>
                              {parseFloat(pair.changePercent) > 0 ? '+' : ''}{pair.changePercent}%
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-trading-muted">
                          Spread: {pair.spread && (parseFloat(pair.spread) * 10000).toFixed(1)} pips
                        </div>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="mt-2 flex items-center justify-center">
                        <Badge variant="secondary" className="bg-trading-accent/20 text-trading-accent border-trading-accent/30 text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Selected for Trading
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
