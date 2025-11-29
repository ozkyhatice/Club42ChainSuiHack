"use client";

import { useEffect, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSession, signOut } from "next-auth/react";

/**
 * Component that listens for wallet disconnection
 * When wallet disconnects, it automatically signs out from 42 OAuth
 */
export default function WalletDisconnectListener() {
  const account = useCurrentAccount();
  const { data: session } = useSession();
  const previousAccountRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize previous account on mount
    if (previousAccountRef.current === null && account?.address) {
      previousAccountRef.current = account.address;
      return;
    }

    const hadWallet = previousAccountRef.current !== null;
    const hasWallet = account?.address !== undefined;

    // If user had a session and wallet was connected, but now wallet is disconnected
    if (session && hadWallet && !hasWallet) {
      console.log("Wallet disconnected, signing out from 42 OAuth...");
      // Sign out from 42 OAuth
      signOut({ callbackUrl: "/", redirect: true });
    }

    // Update previous account reference
    previousAccountRef.current = account?.address || null;
  }, [account?.address, session]);

  return null; // This component doesn't render anything
}

