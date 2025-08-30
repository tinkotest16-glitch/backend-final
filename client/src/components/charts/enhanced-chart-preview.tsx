import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, ExternalLink, Maximize2 } from "lucide-react";
import { EnhancedTradingPair } from "@/lib/price-simulation";
import { formatCurrency, formatPercentage } from "@/lib/trading";
import { cn } from "@/lib/utils";

interface EnhancedChartPreviewProps {
  pair: EnhancedTradingPair;
  className?: string;
  onChartClick?: () => void;
}

export function EnhancedChartPreview({ pair, className, onChartClick }: EnhancedChartPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPositive = (pair.change || 0) >= 0;
  
  // Generate realistic price data for the chart
  const generatePriceData = () => {
    const points = [];
    const basePrice = parseFloat(pair.currentPrice || pair.basePrice);
    const volatility = parseFloat(pair.volatility);
    let currentPrice = basePrice;
    
    // Generate 50 data points for more realistic chart
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * volatility * basePrice * 2;
      currentPrice += change;
      points.push(currentPrice);
    }
    
    // Ensure last point reflects current price change
    if (pair.change) {
      const targetPrice = basePrice * (1 + parseFloat(pair.change) / 100);
      const lastPoint = points[points.length - 1];
      const adjustment = targetPrice - lastPoint;
      for (let i = Math.floor(points.length * 0.8); i < points.length; i++) {
        points[i] += adjustment * ((i - Math.floor(points.length * 0.8)) / (points.length - Math.floor(points.length * 0.8)));
      }
    }
    
    return points;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const data = generatePriceData();
    const width = rect.width;
    const height = rect.height;
    const padding = 10;

    const minPrice = Math.min(...data);
    const maxPrice = Math.max(...data);
    const priceRange = maxPrice - minPrice || 1;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const color = isPositive ? '#10b981' : '#ef4444';
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '10');

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    
    data.forEach((price, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
      
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((price, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw price points (optional - for better visual)
    const lastIndex = data.length - 1;
    const lastX = padding + (lastIndex / (data.length - 1)) * (width - 2 * padding);
    const lastY = padding + (1 - (data[lastIndex] - minPrice) / priceRange) * (height - 2 * padding);
    
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

  }, [pair, isPositive]);

  const openFullChart = () => {
    if (onChartClick) {
      onChartClick();
    } else {
      const symbol = pair.symbol.replace('/', '');
      window.open(`https://www.tradingview.com/chart/?symbol=${symbol}`, '_blank', 'width=1200,height=800');
    }
  };

  return (
    <Card className={cn("trading-card group hover:border-trading-accent/50 transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: pair.color }}
            >
              {pair.icon}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-trading-text">
                {pair.symbol}
              </CardTitle>
              <p className="text-xs text-trading-muted">{pair.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={openFullChart}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-trading-accent hover:bg-trading-accent/10"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Price and Change */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-trading-text">
                {formatCurrency(parseFloat(pair.currentPrice || pair.basePrice), 4).replace('$', '')}
              </div>
              <div className={cn(
                "flex items-center text-sm font-medium",
                isPositive ? 'text-trading-success' : 'text-trading-danger'
              )}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {formatPercentage(pair.change || 0)}
              </div>
            </div>
            <div className="text-right text-xs text-trading-muted">
              <div>Vol: {pair.volatility}</div>
              <div>Spread: {parseFloat(pair.spread || '0') * 10000}p</div>
            </div>
          </div>
          
          {/* Chart Canvas */}
          <div className="relative h-20 w-full bg-trading-secondary/20 rounded-lg overflow-hidden cursor-pointer" onClick={openFullChart}>
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 rounded-lg">
              <div className="bg-trading-secondary/90 rounded-lg px-3 py-1 flex items-center gap-2 text-xs text-trading-text">
                <ExternalLink className="h-3 w-3" />
                View Full Chart
              </div>
            </div>
          </div>

          {/* Bid/Ask Prices */}
          {pair.bidPrice && pair.askPrice && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-trading-danger/10 rounded px-2 py-1">
                <div className="text-trading-muted">BID</div>
                <div className="font-medium text-trading-danger">
                  {parseFloat(pair.bidPrice).toFixed(4)}
                </div>
              </div>
              <div className="bg-trading-success/10 rounded px-2 py-1">
                <div className="text-trading-muted">ASK</div>
                <div className="font-medium text-trading-success">
                  {parseFloat(pair.askPrice).toFixed(4)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}