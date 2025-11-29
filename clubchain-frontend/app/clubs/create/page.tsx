"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { Building2, ArrowLeft, Sparkles } from "lucide-react";
import { buildCreateClubTx, verifyPackageFunctions } from "@/modules/contracts/club";
import { PACKAGE_ID } from "@/lib/constants";

export default function CreateClubPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!clubName.trim()) {
      setError("Club name is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!PACKAGE_ID) {
      setError("Package ID not configured. Please check your environment variables.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Building transaction with PACKAGE_ID:", PACKAGE_ID);
      console.log("Club creation parameters:", {
        clubName: clubName.trim(),
        description: description.trim(),
      });

      // Verify package functions on first attempt (for debugging)
      if (PACKAGE_ID) {
        try {
          await verifyPackageFunctions(PACKAGE_ID, suiClient);
        } catch (verifyError) {
          console.warn("Could not verify package functions:", verifyError);
        }
      }

      const tx = buildCreateClubTx(PACKAGE_ID, clubName, description);

      // Validate transaction before signing
      if (!tx) {
        throw new Error("Transaction object is null or undefined");
      }

      // Try to inspect transaction structure to ensure it's valid
      try {
        // Check if transaction has any commands
        const txData = (tx as any).blockData;
        if (txData) {
          const commandCount = txData.transactions?.length || 0;
          console.log("Transaction block data:", {
            kind: txData.kind,
            sender: txData.sender,
            gasData: txData.gasData,
            transactions: commandCount,
          });
          
          if (commandCount === 0) {
            const errorMsg = "Transaction has no commands - transaction block is empty. This will cause 'dApp.signTransactionBlock {}' error.";
            console.error("❌", errorMsg);
            throw new Error(errorMsg);
          }
          
          // Log first command details
          const firstCmd = txData.transactions[0];
          if (firstCmd?.MoveCall) {
            console.log("✅ First command (MoveCall):", {
              package: firstCmd.MoveCall.package,
              module: firstCmd.MoveCall.module,
              function: firstCmd.MoveCall.function,
              arguments: firstCmd.MoveCall.arguments?.length || 0,
            });
          } else {
            console.warn("⚠️ First command is not a MoveCall:", firstCmd);
          }
        } else {
          console.warn("⚠️ Could not access transaction blockData - transaction might still be valid");
        }
      } catch (inspectError) {
        // If inspection fails, it might be a serialization issue
        console.error("❌ Transaction inspection failed:", inspectError);
        // Don't throw here - let the wallet try to sign it and see what error we get
      }

      // Log transaction details before signing
      console.log("Transaction object created successfully");
      console.log("Ready to sign transaction with:", {
        packageId: PACKAGE_ID,
        function: `${PACKAGE_ID}::club::create_club`,
        arguments: {
          name: clubName.trim(),
          description: description.trim(),
        },
      });

      // Ensure transaction is properly formatted
      const transactionToSign = tx;

      signAndExecute(
        {
          transaction: transactionToSign,
        },
        {
          onSuccess: (result) => {
            console.log("✅ Club created successfully:", result);
            router.push("/dashboard/my-clubs");
          },
          onError: (error) => {
            console.error("❌ Failed to create club:", error);
            
            // Extract detailed error information
            let errorMessage = "Failed to create club";
            
            if (error) {
              // Handle different error formats
              if (typeof error === "string") {
                errorMessage = error;
              } else if (error.message) {
                errorMessage = error.message;
              } else if (error.cause) {
                errorMessage = String(error.cause);
              } else if ((error as any).error) {
                errorMessage = String((error as any).error);
              }
              
              // Check for ArityMismatch specifically
              if (errorMessage.includes("ArityMismatch") || errorMessage.includes("arity") || errorMessage.includes("Dry run failed")) {
                errorMessage = `Transaction failed: ${errorMessage}\n\nThis usually means the function signature doesn't match the deployed contract.\n\nExpected signature: create_club(name: String, description: String)\n\nPlease check:\n1. The package ID is correct (current: ${PACKAGE_ID})\n2. The deployed contract has the create_club function in the club module\n3. The function signature matches (should accept 2 String parameters)\n4. Check the browser console for detailed package verification logs`;
                
                // Try to provide more diagnostic info
                console.error("🔍 ArityMismatch Diagnostic Info:", {
                  packageId: PACKAGE_ID,
                  functionTarget: `${PACKAGE_ID}::club::create_club`,
                  argumentsPassed: 2,
                  argumentTypes: ["String", "String"],
                  expectedSignature: "create_club(name: String, description: String, ctx: &mut TxContext)",
                  note: "ctx is automatically provided by Sui runtime",
                  suggestion: "Check the browser console for package verification logs above to see the actual deployed signature",
                  troubleshooting: "If the package ID is incorrect, update NEXT_PUBLIC_PACKAGE_ID in your .env file or constants.ts",
                });
              }
              
              // Log full error object for debugging
              console.error("Full error object:", JSON.stringify(error, null, 2));
            }
            
            setError(errorMessage);
            setIsSubmitting(false);
          },
        }
      );
    } catch (err: any) {
      console.error("❌ Error building transaction:", err);
      let errorMessage = "Failed to build transaction";
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary hover:text-primary-hover hover:underline flex items-center gap-2 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-accent to-primary-light rounded-xl p-8 text-white shadow-elevation-3 mb-6 animate-slideUp relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-10 h-10 animate-icon-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold">Create New Club</h1>
            </div>
            <p className="text-white/80 text-lg">
              Start your own community and become a club owner
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-8 animate-slideUp animation-delay-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Club Name */}
            <div>
              <label htmlFor="clubName" className="block text-sm font-semibold text-foreground mb-2">
                Club Name *
              </label>
              <input
                id="clubName"
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Enter club name"
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your club"
                rows={4}
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all resize-none"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    What happens when you create a club?
                  </h3>
                  <ul className="text-sm text-text-muted space-y-1">
                    <li>• You'll receive a ClubAdminCap NFT proving your ownership</li>
                    <li>• You can create events for your club</li>
                    <li>• You can update club information</li>
                    <li>• Members can join your club and participate in events</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border-l-4 border-error rounded-lg p-4 animate-slideUp">
                <p className="text-sm text-error-light">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <GamifiedButton
                type="submit"
                variant="primary"
                size="lg"
                icon={Building2}
                disabled={isSubmitting}
                fullWidth
              >
                {isSubmitting ? "Creating Club..." : "Create Club"}
              </GamifiedButton>
              <GamifiedButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </GamifiedButton>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
