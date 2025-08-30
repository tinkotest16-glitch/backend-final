import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/auth-context";
import { ThemeProvider } from "./context/theme-context";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin";
import Trading from "@/pages/trading";
import History from "@/pages/history";
import Deposits from "@/pages/deposits";
import Withdrawals from "@/pages/withdrawals";
import MarketNews from "@/pages/market-news";
import Referrals from "@/pages/referrals";
import CopyTrading from "@/pages/copy-trading";
import Signals from "@/pages/signals";
import NotFound from "@/pages/not-found";

// Homepage component that redirects to show the static landing page
function Homepage() {
  // Since the static HTML is served by the server, we don't need a React component
  // The server will handle serving the index.html at root
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/trading" component={Trading} />
      <Route path="/history" component={History} />
      <Route path="/deposits" component={Deposits} />
      <Route path="/withdrawals" component={Withdrawals} />
      <Route path="/market-news" component={MarketNews} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/copy-trading" component={CopyTrading} />
      <Route path="/signals" component={Signals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;