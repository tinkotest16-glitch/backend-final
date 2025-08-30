import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  History,
  Wallet,
  Newspaper,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Copy,
  Zap,
  Sun,
  Moon
} from "lucide-react";
import logoUrl from "@/assets/logo.jpg";
import { Link } from "wouter";

interface SidebarProps {
  onSettingsClick: () => void;
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
    active: true
  },
  {
    name: "Trading",
    icon: TrendingUp,
    href: "/trading",
    active: false
  },
  {
    name: "Copy Trading",
    icon: Copy,
    href: "/copy-trading",
    active: false
  },
  {
    name: "Signals",
    icon: Zap,
    href: "/signals",
    active: false
  },
  {
    name: "Trade History",
    icon: History,
    href: "/history",
    active: false
  },
  {
    name: "Deposits",
    icon: Wallet,
    href: "/deposits",
    active: false
  },
  {
    name: "Withdrawals",
    icon: Wallet,
    href: "/withdrawals",
    active: false
  },
  {
    name: "Market News",
    icon: Newspaper,
    href: "/market-news",
    active: false
  },
  {
    name: "Referrals",
    icon: Users,
    href: "/referrals",
    active: false
  },
];

export function Sidebar({ onSettingsClick, className }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleNavigation = (href: string, name: string) => {
    if (href.startsWith("/")) {
      setLocation(href);
      setActiveSection(name.toLowerCase().replace(" ", ""));
    } else if (href.startsWith("#")) {
      setActiveSection(name.toLowerCase().replace(" ", "-"));
      // Scroll to section on dashboard
      setLocation("/dashboard");
      setTimeout(() => {
        const element = document.getElementById(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      setLocation(href);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <aside className={cn("flex flex-col bg-trading-secondary border-r border-trading-border h-full overflow-hidden", className)}>
      {/* Logo */}
      <div className="p-6 border-b border-trading-border flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={logoUrl}
              alt="EdgeMarket Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-trading-accent">EdgeMarket</h1>
            <p className="text-sm text-gray-400">Best Multi Trading Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.name.toLowerCase().replace(" ", "-") === activeSection;

            return (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.href, item.name)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors",
                    isActive
                      ? "bg-trading-accent text-white"
                      : "text-gray-300 hover:bg-trading-primary hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-trading-border flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-trading-accent rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-sm text-gray-400">Active Trader</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-trading-primary"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 mr-3" />
            ) : (
              <Moon className="h-4 w-4 mr-3" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-trading-primary"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>

          {user?.isAdmin && (
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-trading-primary"
              onClick={() => setLocation("/admin")}
            >
              <Settings className="h-4 w-4 mr-3" />
              Admin Panel
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-trading-primary"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}