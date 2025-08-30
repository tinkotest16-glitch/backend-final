import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { News } from "@shared/schema";
import { AlertTriangle, Newspaper, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketNews() {
  const { data: news, isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const getNewsIcon = (type: string, severity: string) => {
    if (type === 'ALERT') {
      return <AlertTriangle className={cn(
        "h-4 w-4",
        severity === 'CRITICAL' ? "text-trading-danger" : "text-trading-warning"
      )} />;
    }
    return <Newspaper className="h-4 w-4 text-trading-accent" />;
  };

  const getNewsStyle = (type: string, severity: string) => {
    if (type === 'ALERT') {
      if (severity === 'CRITICAL') return 'news-alert';
      if (severity === 'WARNING') return 'news-warning';
    }
    return 'news-info';
  };

  const getBadgeStyle = (type: string, severity: string) => {
    if (type === 'ALERT') {
      if (severity === 'CRITICAL') return 'bg-trading-danger text-white';
      if (severity === 'WARNING') return 'bg-trading-warning text-black';
    }
    return 'bg-trading-accent text-white';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <Card className="trading-card" id="news">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Newspaper className="h-5 w-5 mr-2" />
          Market News & Alerts
        </CardTitle>
        <CardDescription className="text-gray-400">
          Stay updated with the latest market developments and trading alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="spinner w-6 h-6"></div>
          </div>
        ) : !news || news.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No news or alerts available</p>
            <p className="text-sm mt-2">Market updates will appear here when available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news
              .filter(item => item.isActive)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10) // Show latest 10 items
              .map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    getNewsStyle(item.type, item.severity || "INFO")
                  )}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNewsIcon(item.type, item.severity || "INFO")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getBadgeStyle(item.type, item.severity || "INFO")}>
                          {item.type}
                          {item.type === 'ALERT' && item.severity !== 'INFO' && (
                            <span className="ml-1">• {item.severity}</span>
                          )}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                      <h4 className="font-medium text-white mb-1 break-words">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-300 break-words">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
