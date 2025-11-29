"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useSession } from "next-auth/react";
import { useUserRegistration } from "./useUserRegistration";

interface RegistrationFlowProps {
  onSuccess?: () => void;
}

export default function RegistrationFlow({ onSuccess }: RegistrationFlowProps) {
  const { data: session } = useSession();
  const account = useCurrentAccount();
  const { isRegistering, error, success, register, isConfigured } = useUserRegistration();

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
      <div className="bg-success/10 border border-success p-6 rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-success-light mb-2">
          ✓ Registration Complete!
        </h2>
        <p className="text-success-light">
          Your 42 account is now linked to your Sui wallet.
        </p>
        <p className="text-sm text-success mt-2">Redirecting to homepage...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: 42 Account */}
      <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
        <h3 className="font-semibold text-success-light mb-2">
          ✓ Step 1: 42 Account Connected
        </h3>
        {session?.user && (
          <>
            {session.user.login && (
              <p className="text-sm text-success-light">
                Logged in as: <strong>{session.user.login}</strong>
              </p>
            )}
            {session.user.intraId && (
              <p className="text-sm text-success-light">
                Intra ID: <strong>{session.user.intraId}</strong>
              </p>
            )}
            {session.user.email && (
              <p className="text-sm text-success-light">
                Email: <strong>{session.user.email}</strong>
              </p>
            )}
          </>
        )}
      </div>

      {/* Step 2: Sui Wallet */}
      <div className={`p-4 rounded-lg border ${account ? "bg-success/10 border-success/20" : "bg-primary/10 border-primary/20"}`}>
        <h3
          className={`font-semibold mb-2 ${
            account ? "text-success-light" : "text-primary"
          }`}
        >
          {account ? "✓ Step 2: Sui Wallet Connected" : "Step 2: Connect Sui Wallet"}
        </h3>
        {!account ? (
          <>
            <p className="text-sm text-primary mb-3">
              Connect your Sui wallet to link it with your 42 account
            </p>
            <ConnectButton />
          </>
        ) : (
          <div>
            <p className="text-sm text-success-light mb-2">Wallet Address:</p>
            <p className="text-xs text-success font-mono bg-success/10 p-2 rounded break-all">
              {account.address}
            </p>
          </div>
        )}
      </div>

      {/* Step 3: On-Chain Registration */}
      {account && (
        <>
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Step 3: Register On-Chain</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will create a permanent link between your 42 account and your Sui
              wallet on the blockchain.
            </p>

            {!isConfigured && (
              <div className="bg-yellow-50 p-3 rounded-lg mb-4 border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Note:</strong> The registry contract needs to be deployed
                  first. Update REGISTRY_OBJECT_ID in the code.
                </p>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={isRegistering || !isConfigured}
              className="w-full bg-primary/20 text-primary border border-primary/30 shadow-sm hover:bg-primary/30 hover:scale-105 active:scale-95 py-3 rounded-lg font-medium transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {isRegistering ? "Registering on blockchain..." : "Complete Registration"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 text-sm font-semibold mb-1">
                Registration Error
              </p>
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes("code 1") && (
                <p className="text-xs text-red-600 mt-2">
                  This 42 intra ID is already registered with another wallet.
                </p>
              )}
              {error.includes("code 2") && (
                <p className="text-xs text-red-600 mt-2">
                  This wallet is already registered with another 42 account.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

