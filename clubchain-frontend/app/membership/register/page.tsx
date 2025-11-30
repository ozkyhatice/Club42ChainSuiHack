"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildRegisterMemberTx } from "@/modules/contracts/member";
import { useHasMemberBadge } from "@/hooks/useMemberBadge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { UserPlus, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { PACKAGE_ID, MEMBER_REGISTRY_ID } from "@/lib/constants";
import toast from "react-hot-toast";

export default function MembershipRegisterPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data: hasMemberBadge, isLoading: isCheckingBadge } = useHasMemberBadge();

  const [formData, setFormData] = useState({
    intraId: "",
    username: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already registered
  useEffect(() => {
    if (hasMemberBadge && !isCheckingBadge) {
      toast.success("You are already registered as a member!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [hasMemberBadge, isCheckingBadge, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (!formData.intraId.trim() || !formData.username.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = buildRegisterMemberTx(
        PACKAGE_ID,
        MEMBER_REGISTRY_ID,
        {
          intraId: formData.intraId.trim(),
          username: formData.username.trim(),
        }
      );

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Member registered successfully:", result);
            toast.success("Successfully registered as a member!");
            setIsSubmitting(false);
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          },
          onError: (error) => {
            console.error("Error registering member:", error);
            let errorMessage = "Failed to register. Please try again.";
            
            if (error instanceof Error) {
              const errorStr = error.message.toLowerCase();
              // Check for "already registered" errors
              if (
                errorStr.includes("already registered") ||
                errorStr.includes("code 5") ||
                errorStr.includes("moveabort") && errorStr.includes("5")
              ) {
                errorMessage = "You are already registered as a member.";
                toast.error(errorMessage);
                setTimeout(() => {
                  router.push("/dashboard");
                }, 2000);
                setIsSubmitting(false);
                return;
              }
              errorMessage = error.message;
            }
            
            toast.error(errorMessage);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="bg-primary rounded-xl p-8 text-white shadow-elevation-3 animate-slideUp">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-10 h-10 animate-icon-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold">Register as Member</h1>
          </div>
          <p className="text-white/90 text-lg">
            Register to get your MemberBadge and join clubs
          </p>
        </div>

        {/* Form Card */}
        <Card className="animate-slideUp animation-delay-200">
          <CardBody className="p-8">
            {!account ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Wallet Not Connected
                </h3>
                <p className="text-text-muted mb-6">
                  Please connect your wallet to register as a member
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Intra ID */}
                <div>
                  <label
                    htmlFor="intraId"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Intra ID <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="intraId"
                    value={formData.intraId}
                    onChange={(e) =>
                      setFormData({ ...formData, intraId: e.target.value })
                    }
                    placeholder="Enter your intra ID (e.g., school number)"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-text-muted">
                    Your unique identifier (e.g., school number)
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Username <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter your username"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <strong>Note:</strong> Once registered, you will receive a MemberBadge that allows you to join clubs and participate in events. This badge is soulbound and cannot be transferred.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <GamifiedButton
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Register as Member
                      </>
                    )}
                  </GamifiedButton>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}

