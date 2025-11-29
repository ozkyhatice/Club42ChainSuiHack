"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import UserProfile from "./UserProfile";
import Link from "next/link";
import { Building2 } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export default function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  return (
    <header className="bg-card border-b border-secondary sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left: Menu toggle + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Building2 className="w-6 h-6 text-[#8b7ba8] group-hover:scale-110 transition-transform" />
            <h1 className="text-xl font-bold text-[#8b7ba8] group-hover:scale-105 transition-transform">
              42 Clubs
            </h1>
          </Link>
        </div>
        
        {/* Right: Wallet + Profile */}
        <div className="flex items-center gap-3">
          <ConnectButton />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}


