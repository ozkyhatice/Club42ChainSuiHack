"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { Building2, ArrowLeft, Sparkles } from "lucide-react";
import { buildCreateClubTx } from "@/modules/contracts/club";
import { PACKAGE_ID } from "@/lib/constants";

export default function CreateClubPage() {
  const router = useRouter();
  const account = useCurrentAccount();
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
      const tx = buildCreateClubTx(PACKAGE_ID, clubName, description);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Club created successfully:", result);
            router.push("/dashboard/my-clubs");
          },
          onError: (error) => {
            console.error("Failed to create club:", error);
            setError(error.message || "Failed to create club");
            setIsSubmitting(false);
          },
        }
      );
    } catch (err: any) {
      console.error("Error building transaction:", err);
      setError(err.message || "Failed to build transaction");
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
            className="text-blue-600 hover:underline flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-elevation-3 mb-6 animate-slideUp relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-10 h-10 animate-icon-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold">Create New Club</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Start your own community and become a club owner
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-elevation-2 p-8 animate-slideUp animation-delay-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Club Name */}
            <div>
              <label htmlFor="clubName" className="block text-sm font-semibold text-gray-700 mb-2">
                Club Name *
              </label>
              <input
                id="clubName"
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Enter club name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your club"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    What happens when you create a club?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
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
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-slideUp">
                <p className="text-sm text-red-800">{error}</p>
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
