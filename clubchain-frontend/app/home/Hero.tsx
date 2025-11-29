"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { useCanCreateEvent } from "@/hooks/useBadgeAuth";

export default function Hero() {
  const account = useCurrentAccount();
  const canCreateEvent = useCanCreateEvent();

  return (
    <div className="text-center py-20">
      <h2 className="text-5xl font-bold mb-4 text-foreground">
        42 Campus Event Management
      </h2>
      <p className="text-xl text-text-muted mb-8">
        On-chain scheduling and fundraising for campus clubs
      </p>
      
      {account ? (
        <div>
          <div className="bg-card border border-secondary p-4 rounded-lg inline-block mb-8">
            <p className="text-success font-medium">
              ✓ Wallet Connected
            </p>
            <p className="text-sm text-text-muted">
              {account.address.slice(0, 8)}...{account.address.slice(-6)}
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/events"
              className="bg-primary/20 text-primary border border-primary/30 shadow-sm hover:bg-primary/30 hover:scale-105 active:scale-95 px-8 py-3 rounded-lg font-medium transition-all group"
            >
              View Events
            </Link>
            {canCreateEvent && (
              <Link
                href="/events/create"
                className="bg-success/20 text-success border border-success/30 shadow-sm hover:bg-success/30 hover:scale-105 active:scale-95 px-8 py-3 rounded-lg font-medium transition-all group"
              >
                Create Event
              </Link>
            )}
          </div>
        </div>
      ) : (
        <p className="text-text-muted">Connect your wallet to get started</p>
      )}
    </div>
  );
}

