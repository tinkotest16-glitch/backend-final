import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { EnhancedTradingPair } from "@/lib/price-simulation";
import { formatCurrency, formatPercentage } from "@/lib/trading";

interface ChartPreviewProps {
  pair: EnhancedTradingPair;
  className?: string;
}

export function ChartPreview({ pair, className }: ChartPreviewProps) {
  const isPositive = (pair.change || 0) >= 0;
  
  // Generate simple chart preview data
  const generateChartPoints = () => {
    const points = [];
    const basePrice = parseFloat(pair.currentPrice || pair.basePrice);
    const volatility = parseFloat(pair.volatility);
    
    for (let i = 0; i < 20; i++) {
      const variation = (Math.random() - 0.5) * volatility * basePrice * 10;
      points.push(basePrice + variation);
    }
    return points;
  };

  const chartPoints = generateChartPoints();
  const maxPrice = Math.max(...chartPoints);
  const minPrice = Math.min(...chartPoints);

  const openFullChart = () => {
    const symbol = pair.symbol.replace('/', '');
    window.open(`https://www.tradingview.com/chart/?symbol=${symbol}`, '_blank', 'width=1200,height=800');
  };

  return (
    <Card className={`trading-card h-48 ${className} cursor-pointer hover:border-trading-accent/50 transition-all`} onClick={openFullChart}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-trading-text">
            {pair.symbol}
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-trading-muted" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <div className="text-lg font-bold text-trading-text">
              ${parseFloat(pair.currentPrice || pair.basePrice).toFixed(4)}
            </div>
            <div className={`flex items-center text-sm ${
              isPositive ? 'text-trading-success' : 'text-trading-danger'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {`${(pair.change || 0) >= 0 ? '+' : ''}${Math.abs(pair.change || 0).toFixed(2)}%`}
            </div>
          </div>
          
          {/* Simple Line Chart */}
          <div className="relative h-16 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <defs>
                <linearGradient id={`gradient-${pair.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              {/* Chart line */}
              <polyline
                fill="none"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth="1.5"
                points={chartPoints.map((price, index) => {
                  const x = (index / (chartPoints.length - 1)) * 100;
                  const y = 35 - ((price - minPrice) / (maxPrice - minPrice)) * 30;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Fill area */}
              <polygon
                fill={`url(#gradient-${pair.id})`}
                points={`0,35 ${chartPoints.map((price, index) => {
                  const x = (index / (chartPoints.length - 1)) * 100;
                  const y = 35 - ((price - minPrice) / (maxPrice - minPrice)) * 30;
                  return `${x},${y}`;
                }).join(' ')} 100,35`}
              />
            </svg>
          </div>
          
          <div className="text-xs text-trading-muted">
            H: ${maxPrice.toFixed(4)} L: ${minPrice.toFixed(4)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChartPreview;