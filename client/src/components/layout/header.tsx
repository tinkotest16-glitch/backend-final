
import logoUrl from "@/assets/logo.jpg";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-trading-border bg-trading-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-trading-secondary/60">
      <div className="container flex h-16 items-center px-4 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={logoUrl} 
              alt="PrimeEdgeMarket Logo" 
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-trading-text leading-none">
              PrimeEdgeMarket
            </span>
            <span className="text-xs text-trading-text-muted font-medium">
              Best Multi Trading Platform
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
