import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/layout";
import { Newspaper, AlertTriangle, Info, Plus, Clock, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: "NEWS" | "ALERT";
  severity: "INFO" | "WARNING" | "CRITICAL";
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export default function MarketNews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNews, setNewNews] = useState<{
    title: string;
    content: string;
    type: "NEWS" | "ALERT";
    severity: "INFO" | "WARNING" | "CRITICAL";
  }>({
    title: "",
    content: "",
    type: "NEWS",
    severity: "INFO"
  });

  const { data: newsItems = [], isLoading } = useQuery({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/news");
      return response.json();
    }
  });

  const createNewsMutation = useMutation({
    mutationFn: async (newsData: typeof newNews) => {
      const response = await apiRequest("POST", "/api/news", {
        ...newsData,
        createdBy: user?.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setIsCreateDialogOpen(false);
      setNewNews({ title: "", content: "", type: "NEWS", severity: "INFO" });
      toast({
        title: "News Created",
        description: "Market news has been published successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create news item",
        variant: "destructive",
      });
    }
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const handleCreateNews = () => {
    if (!newNews.title.trim() || !newNews.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createNewsMutation.mutate(newNews);
  };

  const defaultNews = [
    {
      id: "1",
      title: "Federal Reserve Maintains Interest Rates",
      content: "The Federal Reserve has decided to maintain current interest rates at 5.25%-5.50%, signaling a cautious approach to monetary policy amid ongoing economic uncertainty. This decision affects USD trading pairs significantly.",
      type: "NEWS" as const,
      severity: "INFO" as const,
      isActive: true,
      createdBy: "System",
      createdAt: new Date().toISOString()
    },
    {
      id: "2", 
      title: "Gold Reaches New Monthly High",
      content: "Gold prices have surged to $2,080 per ounce, marking the highest level this month. The precious metal continues to attract investors seeking safe-haven assets amid global market volatility.",
      type: "ALERT" as const,
      severity: "WARNING" as const,
      isActive: true,
      createdBy: "System",
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      title: "EUR/USD Technical Analysis Update", 
      content: "The EUR/USD pair is approaching a critical resistance level at 1.0950. Technical indicators suggest potential breakout opportunities for traders monitoring this major currency pair.",
      type: "NEWS" as const,
      severity: "INFO" as const,
      isActive: true,
      createdBy: "System", 
      createdAt: new Date().toISOString()
    }
  ];

  const displayItems = newsItems.length > 0 ? newsItems : defaultNews;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-trading-text mb-2">Notifications and Market News</h1>
            <p className="text-trading-muted">Stay updated with the latest market developments and trading news. kindly Note that all your alerts and notifications would be available here as ALERT-CRITICAL</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="border-trading-border hover:bg-trading-secondary"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {false && user?.isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="trading-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create News
              </Button>
            </DialogTrigger>
            <DialogContent className="trading-card max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-trading-text">Create Market News</DialogTitle>
                <DialogDescription className="text-trading-muted">
                  Add new market news or alerts for traders
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-trading-text">Title</Label>
                  <Input
                    className="trading-input mt-1"
                    placeholder="Enter news title"
                    value={newNews.title}
                    onChange={(e) => setNewNews(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-trading-text">Type</Label>
                    <Select 
                      value={newNews.type} 
                      onValueChange={(value: "NEWS" | "ALERT") => setNewNews(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="trading-select mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEWS">News</SelectItem>
                        <SelectItem value="ALERT">Alert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-trading-text">Severity</Label>
                    <Select 
                      value={newNews.severity} 
                      onValueChange={(value: "INFO" | "WARNING" | "CRITICAL") => setNewNews(prev => ({ ...prev, severity: value }))}
                    >
                      <SelectTrigger className="trading-select mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="WARNING">Warning</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-trading-text">Content</Label>
                  <Textarea
                    className="trading-input mt-1"
                    placeholder="Enter news content"
                    value={newNews.content}
                    onChange={(e) => setNewNews(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-trading-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateNews}
                    disabled={createNewsMutation.isPending}
                    className="trading-button-primary"
                  >
                    {createNewsMutation.isPending ? "Publishing..." : "Publish News"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-5 w-5 text-trading-accent" />
            <h2 className="text-xl font-semibold text-trading-text">Latest Updates</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="trading-card animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-trading-border rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-trading-border rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-trading-border rounded w-full mb-2"></div>
                  <div className="h-4 bg-trading-border rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {displayItems.map((item) => (
              <Card key={item.id} className="trading-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(item.severity)}
                        <Badge 
                          variant="outline" 
                          className={getSeverityColor(item.severity)}
                        >
                          {item.type}
                        </Badge>
                        <Badge variant="outline" className="border-trading-border text-trading-muted">
                          {item.severity}
                        </Badge>
                      </div>
                      <CardTitle className="text-trading-text">{item.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-trading-muted">
                      <Clock className="h-4 w-4" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-trading-text whitespace-pre-wrap">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}