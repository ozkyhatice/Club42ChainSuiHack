"use client";

import { signOut } from "next-auth/react";
import { useWallets } from "@mysten/dapp-kit";
import { useCallback } from "react";

/**
 * Hook to handle synchronized sign out
 * When user signs out, both 42 OAuth session and wallet connection are terminated
 */
export function useSynchronizedSignOut() {
  const wallets = useWallets();

  const handleSignOut = useCallback(async (callbackUrl: string = "/") => {
    try {
      // Disconnect all connected wallets
      const connectedWallets = wallets.filter((wallet) => wallet.accounts.length > 0);
      
      for (const wallet of connectedWallets) {
        try {
          await wallet.disconnect();
        } catch (error) {
          console.error(`Error disconnecting wallet ${wallet.name}:`, error);
        }
      }

      // Sign out from 42 OAuth
      await signOut({ callbackUrl, redirect: true });
    } catch (error) {
      console.error("Error during synchronized sign out:", error);
      // Even if wallet disconnect fails, still sign out from OAuth
      await signOut({ callbackUrl, redirect: true });
    }
  }, [wallets]);

  return { handleSignOut };
}

