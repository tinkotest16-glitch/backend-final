import { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function Layout({ children, showHeader = true, showFooter = true, className = "" }: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-trading-primary ${className}`}>
      {showHeader && <Header />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}