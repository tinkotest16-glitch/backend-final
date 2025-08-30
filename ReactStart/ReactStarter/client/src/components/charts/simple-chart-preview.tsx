import { useEffect, useRef } from "react";
import { EnhancedTradingPair } from "@/lib/price-simulation";

interface SimpleChartPreviewProps {
  pair: EnhancedTradingPair;
  className?: string;
}

export function SimpleChartPreview({ pair, className }: SimpleChartPreviewProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Generate simple price history data for visualization
    const generatePriceHistory = () => {
      const prices = [];
      let currentPrice = parseFloat(pair.currentPrice);
      const volatility = parseFloat(pair.volatility || "0.1");

      for (let i = 0; i < 50; i++) {
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        currentPrice += change;
        prices.push(currentPrice);
      }
      return prices;
    };

    const priceHistory = generatePriceHistory();
    const canvas = document.createElement('canvas');
    canvas.width = chartRef.current.offsetWidth;
    canvas.height = chartRef.current.offsetHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous content
    chartRef.current.innerHTML = '';
    chartRef.current.appendChild(canvas);

    // Draw chart
    const maxPrice = Math.max(...priceHistory);
    const minPrice = Math.min(...priceHistory);
    const priceRange = maxPrice - minPrice;

    ctx.strokeStyle = pair.priceDirection === 'up' ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();

    priceHistory.forEach((price, index) => {
      const x = (index / (priceHistory.length - 1)) * canvas.width;
      const y = canvas.height - ((price - minPrice) / priceRange) * canvas.height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Add price labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.fillText(`${pair.symbol}`, 10, 20);
    ctx.fillText(`${parseFloat(pair.currentPrice).toFixed(4)}`, 10, canvas.height - 10);

  }, [pair]);

  return (
    <div ref={chartRef} className={`relative ${className}`} style={{ minHeight: '200px' }} />
  );
}