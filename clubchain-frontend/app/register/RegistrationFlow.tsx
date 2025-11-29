"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useSession } from "next-auth/react";
import { useUserRegistration } from "./useUserRegistration";
import { useBadgeAuth } from "@/hooks/useBadgeAuth";

interface RegistrationFlowProps {
  onSuccess?: () => void;
}

export default function RegistrationFlow({ onSuccess }: RegistrationFlowProps) {
  const { data: session } = useSession();
  const account = useCurrentAccount();
  const { isRegistering, error, success, register, isConfigured } = useUserRegistration();
  const { isSuperAdmin, isClubOwner, isLoading: isCheckingBadges } = useBadgeAuth();

  const handleRegister = () => {
    if (!session?.user) {
      console.error("No session found. Please sign in first.");
      return;
    }

    if (!session.user.intraId || !session.user.login || !session.user.email) {
      console.error("Missing required user data in session");
      return;
    }
    
    register({
      intraId: session.user.intraId,
      username: session.user.login,
      email: session.user.email,
    });
  };

  if (success) {
    return (
      <div className="bg-gradient-to-br from-success/20 via-success/10 to-success/20 border-2 border-success/40 p-8 rounded-xl text-center animate-scaleUp">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4 border-2 border-success/40">
          <span className="text-3xl text-success">✓</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-success mb-3">
          Registration Complete!
        </h2>
        <p className="text-success-light text-base mb-2">
          Your 42 account is now linked to your Sui wallet.
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

      {/* Step 3: On-Chain Registration */}
      {account && (
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/30 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center border border-primary/40">
              <span className="text-primary text-lg font-bold">3</span>
            </div>
            <h3 className="font-bold text-lg text-primary">Step 3: Register On-Chain</h3>
          </div>
          
          <div className="pl-13 space-y-4">
            <p className="text-sm text-text-muted">
              This will create a permanent link between your 42 account and your Sui
              wallet on the blockchain.
            </p>

            {!isConfigured && (
              <div className="bg-warning/20 border border-warning/40 p-4 rounded-lg">
                <p className="text-xs text-warning-light">
                  ⚠️ <strong>Note:</strong> The registry contract needs to be deployed
                  first. Update REGISTRY_OBJECT_ID in the code.
                </p>
              </div>
            )}

            {(isSuperAdmin || isClubOwner) && (
              <div className="bg-warning/20 border border-warning/40 p-4 rounded-lg mb-4">
                <p className="text-sm text-warning-light">
                  ⚠️ You already have badges (SuperAdmin or ClubOwner). Registration is not required. You will be redirected to the dashboard.
                </p>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={isRegistering || !isConfigured || isCheckingBadges || isSuperAdmin || isClubOwner}
              className="w-full bg-gradient-to-r from-primary/30 to-primary/20 hover:from-primary/40 hover:to-primary/30 text-primary border-2 border-primary/40 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] py-4 rounded-xl font-semibold transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg"
            >
              {isRegistering ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                  Registering on blockchain...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Complete Registration
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-error/20 border-2 border-error/40 p-4 rounded-lg">
              <p className="text-error-light text-sm font-semibold mb-2 flex items-center gap-2">
                <span>⚠️</span>
                Registration Error
              </p>
              <p className="text-error/90 text-sm mb-2">{error}</p>
              {error.includes("code 1") && (
                <p className="text-xs text-error/80 mt-2 pl-6">
                  This 42 intra ID is already registered with another wallet.
                </p>
              )}
              {error.includes("code 2") && (
                <p className="text-xs text-error/80 mt-2 pl-6">
                  This wallet is already registered with another 42 account.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

