import { Link } from "wouter";
import logoUrl from "@/assets/logo.jpg";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Github, Shield, Lock } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-trading-secondary border-t border-trading-border text-trading-text mt-auto">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4 col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img 
                  src={logoUrl} 
                  alt="EdgeMarket Logo" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
              </div>
              <span className="text-xl font-bold text-trading-accent">EdgeMarket</span>
            </div>
            <p className="text-sm text-trading-muted max-w-xs">
              The premier multi-asset trading platform for modern investors.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Github, href: "#" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-8 h-8 bg-trading-primary rounded-lg flex items-center justify-center hover:bg-trading-accent transition-colors"
                >
                  <social.icon className="h-4 w-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              {["Trading", "Portfolio", "Market News", "Help Center"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-trading-muted hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2">
              {["Contact Us", "FAQ", "Live Chat", "Documentation"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-trading-muted hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg font-semibold text-white">Legal</h3>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Risk Disclosure", "Compliance"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-trading-muted hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-trading-border flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-trading-muted text-center sm:text-left">
            © 2024 EdgeMarket. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-trading-success" />
              <span className="text-sm text-trading-muted">Secure Trading</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-trading-success" />
              <span className="text-sm text-trading-muted">SSL Protected</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}