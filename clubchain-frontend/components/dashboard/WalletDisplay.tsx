"use client";

import { useCurrentAccount, useWallets } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";
import { Wallet, CheckCircle2, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSynchronizedSignOut } from "@/hooks/useSynchronizedSignOut";

export default function WalletDisplay() {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { handleSignOut } = useSynchronizedSignOut();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const connectButtonRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trigger ConnectButton click when our button is clicked
  const handleConnectClick = () => {
    const connectButton = connectButtonRef.current?.querySelector('button');
    if (connectButton) {
      connectButton.click();
    }
  };

  const handleDisconnect = async () => {
    setIsDropdownOpen(false);
    try {
      // Get all connected wallets
      const connectedWallets = wallets.filter((wallet) => wallet.accounts.length > 0);
      
      if (connectedWallets.length === 0) {
        console.log('No connected wallets to disconnect');
        return;
      }
      
      // Try to disconnect each wallet
      // Note: The disconnect method might be on the wallet adapter, not the wallet object itself
      for (const wallet of connectedWallets) {
        try {
          const walletAny = wallet as any;
          
          // Method 1: Try wallet.disconnect() directly (as in useSynchronizedSignOut)
          if (typeof walletAny.disconnect === 'function') {
            await walletAny.disconnect();
            continue;
          }
          
          // Method 2: Try wallet.adapter?.disconnect()
          if (walletAny.adapter && typeof walletAny.adapter.disconnect === 'function') {
            await walletAny.adapter.disconnect();
            continue;
          }
          
          // Method 3: Try wallet.wallet?.disconnect()
          if (walletAny.wallet && typeof walletAny.wallet.disconnect === 'function') {
            await walletAny.wallet.disconnect();
            continue;
          }
          
          // Method 4: Try features['standard:disconnect']
          if (wallet.features) {
            const features = wallet.features as any;
            if (features['standard:disconnect'] && typeof features['standard:disconnect'].disconnect === 'function') {
              await features['standard:disconnect'].disconnect();
              continue;
            }
          }
          
          console.warn(`Could not find disconnect method for wallet ${wallet.name}. Wallet structure:`, {
            keys: Object.keys(wallet),
            hasAdapter: 'adapter' in walletAny,
            hasWallet: 'wallet' in walletAny,
            features: Object.keys(wallet.features || {}),
          });
        } catch (error) {
          console.error(`Error disconnecting wallet ${wallet.name}:`, error);
        }
      }
    } catch (error) {
      console.error("Error during wallet disconnect:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden ConnectButton for functionality */}
      <div ref={connectButtonRef} className="hidden">
        <ConnectButton />
      </div>

      {!account ? (
        // Not connected - Show connect button
        <button
          onClick={handleConnectClick}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group"
        >
          {/* Wallet Icon */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center border border-primary/30 shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          
          {/* Connect text (hidden on mobile) */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-foreground">Connect Wallet</p>
            <p className="text-xs text-text-muted mt-0.5">Sui Network</p>
          </div>
        </button>
      ) : (
        // Connected - Show wallet info with dropdown
        <>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group"
          >
            {/* Wallet Icon with status indicator */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center border border-primary/40 shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              {/* Connected indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              </div>
            </div>
            
            {/* Address info (hidden on mobile) */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-foreground font-mono">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-success" />
                <p className="text-xs text-success font-medium">Connected</p>
              </div>
            </div>
            
            {/* Dropdown arrow */}
            <ChevronUp
              className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "rotate-180"}`}
            />
          </button>

          {/* Custom Dropdown Menu - styled to match UserProfile */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-elevation-3 border border-border-light py-2 animate-scaleUp z-50 overflow-hidden">
              {/* Wallet info */}
              <div className="px-4 py-3 border-b border-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center border border-primary/40">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-text-muted mb-1">Wallet Address</p>
                    <p className="text-sm font-mono font-semibold text-foreground break-all">
                      {account.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <p className="text-xs text-success font-medium">Sui Network Connected</p>
                </div>
              </div>
              
              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={handleDisconnect}
                  className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 transition-all duration-200 flex items-center gap-3 group"
                >
                  <div className="p-1.5 rounded-lg bg-error/10 group-hover:bg-error/20 transition-colors">
                    <Wallet className="w-4 h-4 text-error" />
                  </div>
                  <span className="font-medium">Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

