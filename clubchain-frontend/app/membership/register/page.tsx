"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { useHasMemberBadge } from "@/hooks/useMemberBadge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody } from "@/components/ui/Card";
import { ArrowLeft, AlertCircle, Loader2, CheckCircle2, UserPlus } from "lucide-react";
import { PACKAGE_ID, MEMBER_REGISTRY_ID } from "@/lib/constants";
import toast from "react-hot-toast";

export default function MembershipRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { data: hasMemberBadge, isLoading: isCheckingBadge } = useHasMemberBadge();

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get return URL from query params or referrer
  const getReturnUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl');
      if (returnUrl) return returnUrl;
      
      // Check if referrer is a club page
      const referrer = document.referrer;
      if (referrer && referrer.includes('/club/')) {
        return referrer;
      }
    }
    return '/dashboard';
  };

  // Redirect if already registered
  useEffect(() => {
    if (hasMemberBadge && !isCheckingBadge) {
      toast.success("You are already registered as a member!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [hasMemberBadge, isCheckingBadge, router]);

  const handleRegister = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!session?.user) {
      toast.error("Please sign in with your 42 account first");
      return;
    }

    const intraId = session.user.intraId;
    const username = session.user.login;

    if (!intraId || !username) {
      toast.error("Missing user information. Please sign in again.");
      return;
    }

    await handleRegisterTransaction(String(intraId), username);
  };

  const handleRegisterTransaction = async (intraId: string, username: string) => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!PACKAGE_ID) {
      toast.error("Configuration error: PACKAGE_ID not set");
      return;
    }

    if (!MEMBER_REGISTRY_ID) {
      toast.error("Configuration error: MEMBER_REGISTRY_ID not set");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!intraId.trim() || !username.trim()) {
        toast.error("Invalid registration data");
        setIsSubmitting(false);
        return;
      }

      console.log("Building registration transaction:", {
        packageId: PACKAGE_ID,
        registryId: MEMBER_REGISTRY_ID,
        intraId: intraId.trim(),
        username: username.trim(),
        account: account.address,
      });

      // Validate all inputs before building transaction
      if (!PACKAGE_ID || PACKAGE_ID.length < 10) {
        throw new Error("Invalid PACKAGE_ID");
      }
      if (!MEMBER_REGISTRY_ID || MEMBER_REGISTRY_ID.length < 10) {
        throw new Error("Invalid MEMBER_REGISTRY_ID");
      }
      if (!intraId.trim() || !username.trim()) {
        throw new Error("Intra ID and username are required");
      }

      console.log("Building transaction with:", {
        packageId: PACKAGE_ID,
        registryId: MEMBER_REGISTRY_ID,
        intraId: intraId.trim(),
        username: username.trim(),
        account: account.address,
      });

      // Build transaction directly to ensure it's correct
      const tx = new Transaction();
      
      // Validate all IDs are valid hex strings
      if (!PACKAGE_ID.startsWith('0x') || !MEMBER_REGISTRY_ID.startsWith('0x')) {
        throw new Error("Invalid Package ID or Registry ID format");
      }
      
      const trimmedIntraId = String(intraId.trim());
      const trimmedUsername = String(username.trim());
      
      if (!trimmedIntraId || !trimmedUsername) {
        throw new Error("Intra ID and username cannot be empty");
      }
      
      tx.moveCall({
        target: `${PACKAGE_ID}::club_system::register_member`,
        arguments: [
          tx.object(MEMBER_REGISTRY_ID), // registry: &mut MemberRegistry
          tx.pure.string(trimmedIntraId), // intra_id: String
          tx.pure.string(trimmedUsername), // username: String
        ],
      });
      
      // Set gas budget
      tx.setGasBudget(50_000_000); // 50M MIST = 0.05 SUI

      console.log("Transaction created successfully");
      console.log("Transaction details:", {
        packageId: PACKAGE_ID,
        registryId: MEMBER_REGISTRY_ID,
        intraId: trimmedIntraId,
        username: trimmedUsername,
        account: account.address,
        target: `${PACKAGE_ID}::club_system::register_member`,
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            console.log("Transaction submitted:", result);
            
            // Check transaction status
            const status = result.effects?.status?.status;
            console.log("Transaction status:", status);
            
            if (status === "failure") {
              const errorMsg = result.effects?.status?.error || "Transaction failed";
              console.error("Transaction failed:", errorMsg);
              toast.error(`Registration failed: ${errorMsg}`);
              setIsSubmitting(false);
              return;
            }
            
            console.log("Transaction result details:", {
              digest: result.digest,
              status: result.effects?.status,
              created: result.effects?.created,
              events: result.events,
            });
            
            // Check if MemberBadge was created in the transaction
            const createdObjects = result.effects?.created || [];
            console.log("Created objects:", createdObjects);
            
            // Invalidate and refetch member badge queries to update the UI
            console.log("Invalidating queries...");
            await queryClient.invalidateQueries({ 
              queryKey: ["member-badge", account?.address] 
            });
            await queryClient.invalidateQueries({ 
              queryKey: ["member-badge-detail", account.address] 
            });
            // Also invalidate member clubs query since MemberBadge gives access to all clubs
            await queryClient.invalidateQueries({ 
              queryKey: ["user-member-clubs", account.address] 
            });
            
            // Wait for blockchain to sync and query to refetch
            console.log("Waiting for blockchain sync...");
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Force refetch
            console.log("Refetching member badge and clubs...");
            await queryClient.refetchQueries({ 
              queryKey: ["member-badge", account?.address] 
            });
            await queryClient.refetchQueries({ 
              queryKey: ["user-member-clubs", account?.address] 
            });
            
            toast.success("Successfully registered as a member! Refreshing...");
            setIsSubmitting(false);
            
            // Redirect to return URL or dashboard after a short delay
            const returnUrl = getReturnUrl();
            setTimeout(() => {
              if (returnUrl.startsWith('/')) {
                router.push(returnUrl);
              } else {
                router.push("/dashboard");
              }
            }, 2000);
          },
          onError: (error) => {
            console.error("Error registering member:", error);
            
            // Log full error object for debugging
            const errorDetails = {
              error,
              type: typeof error,
              constructor: error?.constructor?.name,
              message: error?.message,
              name: error?.name,
              stack: error?.stack,
              cause: error?.cause,
              stringified: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
            };
            console.error("Full error object:", errorDetails);
            
            let errorMessage = "Failed to register. Please try again.";
            
            // Check for signTransactionBlock errors specifically
            const errorString = JSON.stringify(errorDetails).toLowerCase();
            if (errorString.includes("signtransactionblock") || errorString.includes("sign transaction")) {
              errorMessage = "Wallet signing failed. Please ensure:\n1. Your wallet is connected\n2. You're on the testnet network\n3. You have enough SUI for gas\n4. Try refreshing the page";
              toast.error(errorMessage, { duration: 8000 });
              setIsSubmitting(false);
              return;
            }
            
            if (error instanceof Error) {
              const errorStr = error.message.toLowerCase();
              
              // Check for "already registered" errors
              if (
                errorStr.includes("already registered") ||
                errorStr.includes("code 5") ||
                (errorStr.includes("moveabort") && errorStr.includes("5")) ||
                errorStr.includes("ealreadyregistered")
              ) {
                errorMessage = "You are already registered as a member.";
                toast.error(errorMessage);
                setTimeout(() => {
                  router.push("/dashboard");
                }, 2000);
                setIsSubmitting(false);
                return;
              }
              
              // Check for transaction/user rejection
              if (
                errorStr.includes("user rejected") ||
                errorStr.includes("user denied") ||
                errorStr.includes("rejected") ||
                errorStr.includes("cancelled")
              ) {
                errorMessage = "Transaction was cancelled. Please try again.";
              } else if (
                errorStr.includes("sign") ||
                errorStr.includes("transaction") ||
                errorStr.includes("block")
              ) {
                errorMessage = "Transaction signing failed. Please check your wallet connection, ensure you're on testnet, and try again.";
              } else {
                errorMessage = error.message || "Failed to register. Please try again.";
              }
            } else if (error && typeof error === 'object') {
              // Handle non-Error objects
              const errorObj = error as any;
              if (errorObj.message) {
                errorMessage = errorObj.message;
              } else if (errorObj.error) {
                errorMessage = String(errorObj.error);
              } else if (errorObj.cause) {
                errorMessage = String(errorObj.cause);
              }
            }
            
            // Show detailed error in console and toast
            console.error("Registration error details:", {
              error,
              errorMessage,
              account: account?.address,
              packageId: PACKAGE_ID,
              registryId: MEMBER_REGISTRY_ID,
            });
            
            toast.error(errorMessage, {
              duration: 5000,
            });
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.error("Transaction build error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to build transaction. Please try again.";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (isCheckingBadge) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-text-muted">Checking registration status...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (hasMemberBadge) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardBody className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Already Registered
              </h2>
              <p className="text-text-muted mb-6">
                You are already registered as a member. Redirecting to dashboard...
              </p>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading/processing state during registration
  if (isSubmitting) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardBody className="text-center py-12">
              <div className="inline-flex p-4 bg-primary/10 rounded-lg mb-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Registering as Member
              </h2>
              <p className="text-text-muted mb-4">
                Processing your registration on the blockchain...
              </p>
              {session?.user && (
                <div className="mt-6 p-4 bg-secondary rounded-lg text-left max-w-md mx-auto">
                  <p className="text-sm text-text-muted mb-2">Registration Details:</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground">
                      <span className="text-text-muted">Username:</span> {session.user.login}
                    </p>
                    <p className="text-foreground">
                      <span className="text-text-muted">Intra ID:</span> {session.user.intraId}
                    </p>
                  </div>
                </div>
              )}
              <p className="text-xs text-text-secondary mt-4">
                Please approve the transaction in your wallet
              </p>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show registration form
  if (!account || !session?.user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardBody className="text-center py-12">
              <div className="inline-flex p-4 bg-warning/10 rounded-lg mb-4">
                <AlertCircle className="w-12 h-12 text-warning" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {!account ? "Wallet Not Connected" : "42 Account Not Connected"}
              </h2>
              <p className="text-text-muted mb-6">
                {!account 
                  ? "Please connect your Sui wallet to register as a member."
                  : "Please sign in with your 42 account to register as a member."}
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show registration form when wallet and session are ready
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <Card>
          <CardBody className="text-center py-12">
            <div className="inline-flex p-4 bg-primary/10 rounded-lg mb-4">
              <UserPlus className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Register as Member
            </h2>
            <p className="text-text-muted mb-6">
              Register your 42 account with your Sui wallet to join clubs and participate in events.
            </p>
            
            {session?.user && (
              <div className="mb-6 p-4 bg-secondary rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm text-text-muted mb-2">Registration Details:</p>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">
                    <span className="text-text-muted">Username:</span> {session.user.login}
                  </p>
                  <p className="text-foreground">
                    <span className="text-text-muted">Intra ID:</span> {session.user.intraId}
                  </p>
                  <p className="text-foreground">
                    <span className="text-text-muted">Wallet:</span> {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Register as Member</span>
                </>
              )}
            </button>

            <p className="text-xs text-text-secondary mt-4">
              This will create a MemberBadge linked to your 42 account and Sui wallet.
            </p>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}

