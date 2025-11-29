"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsRegistered } from "@/hooks/useRegistrationStatus";

interface RegistrationFlowProps {
  onSuccess?: () => void;
}

export default function RegistrationFlow({ onSuccess }: RegistrationFlowProps) {
  const { data: session } = useSession();
  const account = useCurrentAccount();
  const router = useRouter();
  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsRegistered();

  // Auto-redirect to dashboard when wallet is connected
  // If user has session and wallet, they can access the platform
  // Club owners might not have UserProfile but have ClubAdminCap, so we allow access
  useEffect(() => {
    if (account && session && !isCheckingRegistration) {
      // Give a small delay to show the success state, then redirect
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [account, session, isCheckingRegistration, router]);

  // Show loading while checking registration status
  if (account && isCheckingRegistration) {
    return (
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/30 p-8 rounded-xl text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-muted">Checking registration status...</p>
      </div>
    );
  }

  // Show success and redirect message when wallet is connected
  // This works for both regular users and club owners
  if (account && session) {
    return (
      <div className="bg-gradient-to-br from-success/20 via-success/10 to-success/20 border-2 border-success/40 p-8 rounded-xl text-center animate-scaleUp">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4 border-2 border-success/40">
          <span className="text-3xl text-success">✓</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-success mb-3">
          All Set!
        </h2>
        <p className="text-success-light text-base mb-2">
          Your 42 account is linked to your Sui wallet.
        </p>
        <p className="text-sm text-success/80 mt-4 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: 42 Account */}
      <div className="bg-gradient-to-br from-success/20 via-success/10 to-success/20 border-2 border-success/30 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-success/30 flex items-center justify-center border border-success/40">
            <span className="text-success text-lg">✓</span>
          </div>
          <h3 className="font-bold text-lg text-success-light">
            Step 1: 42 Account Connected
          </h3>
        </div>
        {session?.user && (
          <div className="space-y-2 pl-13">
            {session.user.login && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">Username:</span>
                <span className="text-foreground font-semibold text-sm">{session.user.login}</span>
              </div>
            )}
            {session.user.intraId && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">Intra ID:</span>
                <span className="text-foreground font-semibold text-sm">{session.user.intraId}</span>
              </div>
            )}
            {session.user.email && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">Email:</span>
                <span className="text-foreground font-semibold text-sm">{session.user.email}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Sui Wallet */}
      <div className={`p-6 rounded-xl border-2 transition-all ${
        account 
          ? "bg-gradient-to-br from-success/20 via-success/10 to-success/20 border-success/30" 
          : "bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 border-primary/30"
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
            account 
              ? "bg-success/30 border-success/40" 
              : "bg-primary/30 border-primary/40"
          }`}>
            {account ? (
              <span className="text-success text-lg">✓</span>
            ) : (
              <span className="text-primary text-lg font-bold">2</span>
            )}
          </div>
          <h3 className={`font-bold text-lg ${
            account ? "text-success-light" : "text-primary"
          }`}>
            {account ? "Step 2: Sui Wallet Connected" : "Step 2: Connect Sui Wallet"}
          </h3>
        </div>
        {!account ? (
          <div>
            <p className="text-sm text-text-muted mb-4 pl-13">
              Connect your Sui wallet to link it with your 42 account
            </p>
            <div className="pl-13">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="pl-13">
            <p className="text-sm text-text-muted mb-2">Wallet Address:</p>
            <div className="bg-card/60 backdrop-blur-sm border border-success/20 p-3 rounded-lg">
              <p className="text-xs text-success font-mono break-all">
                {account.address}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

