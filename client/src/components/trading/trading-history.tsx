import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserTrades } from "@/hooks/use-trading";
import { useTradingPairs } from "@/hooks/use-trading";
import { formatCurrency, formatPrice } from "@/lib/trading";
import { Printer, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface TradingHistoryProps {
  userId: string;
}

export function TradingHistory({ userId }: TradingHistoryProps) {
  const { data: trades, isLoading: tradesLoading } = useUserTrades();
  const { data: tradingPairs } = useTradingPairs();
  const { toast } = useToast();

  const generatePrintReport = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('ProTrader - Trading History Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
      doc.text(`User ID: ${userId}`, 20, 45);
      
      // Table headers
      let yPosition = 65;
      doc.setFontSize(10);
      doc.text('Date', 20, yPosition);
      doc.text('Pair', 50, yPosition);
      doc.text('Type', 80, yPosition);
      doc.text('Amount', 100, yPosition);
      doc.text('Entry Price', 130, yPosition);
      doc.text('Exit Price', 160, yPosition);
      doc.text('P&L', 185, yPosition);
      
      // Add line
      doc.line(20, yPosition + 5, 190, yPosition + 5);
      yPosition += 15;
      
      // Table data
      if (trades && trades.length > 0) {
        trades.forEach((trade) => {
          const pair = tradingPairs?.find(p => p.id === trade.pairId);
          
          doc.text(new Date(trade.createdAt).toLocaleDateString(), 20, yPosition);
          doc.text(pair?.symbol || 'Unknown', 50, yPosition);
          doc.text(trade.type, 80, yPosition);
          doc.text(`$${parseFloat(trade.amount).toFixed(2)}`, 100, yPosition);
          doc.text(formatPrice(trade.entryPrice, 4), 130, yPosition);
          doc.text(trade.exitPrice ? formatPrice(trade.exitPrice, 4) : '-', 160, yPosition);
          
          if (trade.pnl) {
            const pnl = parseFloat(trade.pnl);
            doc.setTextColor(pnl >= 0 ? 0 : 255, pnl >= 0 ? 128 : 0, 0);
            doc.text(`${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`, 185, yPosition);
            doc.setTextColor(0, 0, 0);
          } else {
            doc.text('-', 185, yPosition);
          }
          
          // Add TP/SL info if available
          if (trade.takeProfit || trade.stopLoss) {
            yPosition += 8;
            doc.setFontSize(8);
            if (trade.takeProfit) {
              doc.text(`TP: ${formatPrice(trade.takeProfit, 4)}`, 130, yPosition);
            }
            if (trade.stopLoss) {
              doc.text(`SL: ${formatPrice(trade.stopLoss, 4)}`, 160, yPosition);
            }
            doc.setFontSize(10);
          }
          
          yPosition += 10;
          
          // Add new page if needed
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Summary
      const totalTrades = trades?.length || 0;
      const profitableTrades = trades?.filter(t => t.isProfit).length || 0;
      const totalPnL = trades?.reduce((sum, t) => sum + (parseFloat(t.pnl || '0')), 0) || 0;
      
      yPosition += 20;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.text('Summary:', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.text(`Total Trades: ${totalTrades}`, 20, yPosition);
      doc.text(`Profitable Trades: ${profitableTrades}`, 20, yPosition + 10);
      doc.text(`Win Rate: ${totalTrades > 0 ? ((profitableTrades / totalTrades) * 100).toFixed(2) : 0}%`, 20, yPosition + 20);
      doc.text(`Total P&L: ${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, 20, yPosition + 30);
      
      doc.save('protrader-history.pdf');
      
      toast({
        title: "Report Generated",
        description: "Trading history report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate trading history report",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (tradesLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-white">Trading History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="spinner w-6 h-6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card" id="history">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Trading History</CardTitle>
            <CardDescription className="text-gray-400">
              View your complete trading activity and performance
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-trading-border hover:bg-trading-secondary"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              className="trading-button-primary"
              size="sm"
              onClick={generatePrintReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!trades || trades.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No trading history found</p>
            <p className="text-sm mt-2">Your completed trades will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-trading-primary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Pair
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Entry Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Exit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    TP/SL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trading-border">
                {trades.map((trade) => {
                  const pair = tradingPairs?.find(p => p.id === trade.pairId);
                  const pnl = trade.pnl ? parseFloat(trade.pnl) : 0;
                  
                  return (
                    <tr key={trade.id} className="hover:bg-trading-primary/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(trade.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {pair?.symbol || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div className="flex items-center">
                          {trade.type === 'BUY' ? (
                            <TrendingUp className="h-4 w-4 mr-1 text-trading-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1 text-trading-danger" />
                          )}
                          {trade.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(trade.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatPrice(trade.entryPrice, 4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {trade.exitPrice ? formatPrice(trade.exitPrice, 4) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-trading-muted">
                        <div className="space-y-1">
                          {trade.takeProfit && (
                            <div className="text-trading-success">TP: {formatPrice(trade.takeProfit, 4)}</div>
                          )}
                          {trade.stopLoss && (
                            <div className="text-trading-danger">SL: {formatPrice(trade.stopLoss, 4)}</div>
                          )}
                          {!trade.takeProfit && !trade.stopLoss && (
                            <span className="text-trading-muted">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {trade.pnl ? (
                          <span className={pnl >= 0 ? 'text-trading-success' : 'text-trading-danger'}>
                            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={`${
                            trade.status === 'CLOSED' 
                              ? trade.isProfit 
                                ? 'status-badge-closed' 
                                : 'status-badge-closed'
                              : 'status-badge-open'
                          }`}
                        >
                          {trade.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
