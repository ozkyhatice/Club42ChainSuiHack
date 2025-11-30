"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildCreateClubTx } from "@/modules/contracts/club";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { Building2, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { PACKAGE_ID, CLOCK_OBJECT_ID } from "@/lib/constants";
import toast from "react-hot-toast";

export default function CreateClubPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = buildCreateClubTx(
        PACKAGE_ID,
        formData.name.trim(),
        formData.description.trim(),
        CLOCK_OBJECT_ID
      );

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Club created successfully:", result);
            toast.success("Club created successfully!");
            setIsSubmitting(false);
            // Redirect to clubs list after a short delay
            setTimeout(() => {
              router.push("/clubs");
            }, 1500);
          },
          onError: (error) => {
            console.error("Error creating club:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to create club. Please try again.";
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/clubs")}
          className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Clubs</span>
        </button>

        {/* Header */}
        <div className="bg-primary rounded-xl p-8 text-white shadow-elevation-3 animate-slideUp">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-10 h-10 animate-icon-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold">Create New Club</h1>
          </div>
          <p className="text-white/90 text-lg">
            Create a new club on the blockchain
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
                  Please connect your wallet to create a club
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Club Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Club Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter club name"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Description <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter club description"
                    required
                    rows={5}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
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
                        Creating Club...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5" />
                        Create Club
                      </>
                    )}
                  </GamifiedButton>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/clubs")}
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

