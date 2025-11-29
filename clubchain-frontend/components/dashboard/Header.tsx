"use client";

import UserProfile from "./UserProfile";
import WalletDisplay from "./WalletDisplay";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export default function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Left: Menu toggle + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-all hover:scale-105 active:scale-95"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all group-hover:scale-110">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary group-hover:scale-105 transition-transform">
              42 Clubs
            </h1>
          </Link>
        </div>
        
        {/* Right: Wallet + Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <WalletDisplay />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}


