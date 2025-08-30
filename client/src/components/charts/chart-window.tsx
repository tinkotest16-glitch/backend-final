import { useEffect, useRef } from "react";
import { TradingPair } from "@shared/schema";

interface ChartWindowProps {
  pair: TradingPair;
  onClose: () => void;
}

export default function ChartWindow({ pair, onClose }: ChartWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real implementation, this would integrate with TradingView's widget
    // For now, we'll create a placeholder that opens the actual TradingView chart

    const symbol = pair.symbol.replace('/', '');
    const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=${symbol}`;

    // Open in a new window
    const chartWindow = window.open(
      tradingViewUrl,
      `chart_${symbol}`,
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );

    if (chartWindow) {
      chartWindow.focus();

      // Monitor if the window is closed
      const checkClosed = setInterval(() => {
        if (chartWindow.closed) {
          clearInterval(checkClosed);
          onClose();
        }
      }, 1000);

      return () => {
        clearInterval(checkClosed);
        if (!chartWindow.closed) {
          chartWindow.close();
        }
      };
    } else {
      // Fallback if popup is blocked
      window.location.href = tradingViewUrl;
      onClose();
    }
  }, [pair, onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-trading-secondary rounded-lg p-6 max-w-md text-center">
        <h3 className="text-lg font-semibold text-white mb-4">
          Opening Chart for {pair.symbol}
        </h3>
        <p className="text-gray-400 mb-4">
          The TradingView chart is opening in a new window. If it doesn't open automatically,
          please check your popup blocker settings.
        </p>
        <button
          onClick={onClose}
          className="trading-button-primary px-6 py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}