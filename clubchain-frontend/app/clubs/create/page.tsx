"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildCreateClubTx } from "@/modules/contracts/club";
import { PACKAGE_ID } from "@/lib/constants";

export default function CreateClubPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [clubName, setClubName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!clubName.trim()) {
      setError("Club name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (!PACKAGE_ID) {
        console.error("PACKAGE_ID is undefined");
        setError("Configuration error: PACKAGE_ID is not set");
        setIsSubmitting(false);
        return;
      }

      console.log("Building transaction with PACKAGE_ID:", PACKAGE_ID);
      const tx = buildCreateClubTx(PACKAGE_ID, clubName);

      console.log("Transaction block created, signing...");
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Club created successfully:", result);
            setSuccess(true);
            setTimeout(() => {
              router.push("/admin");
            }, 2000);
          },
          onError: (err) => {
            console.error("Error creating club:", err);
            setError(err.message || "Failed to create club");
            setIsSubmitting(false);
          },
        }
      );
    } catch (err) {
      console.error("Transaction error:", err);
      setError(String(err));
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to create a club.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Club
          </h1>
          <p className="text-gray-600">
            Create a new club and become its president. You will receive an admin capability.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="clubName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Club Name
              </label>
              <input
                type="text"
                id="clubName"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter club name"
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm">
                  Club created successfully! Redirecting...
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {isSubmitting ? "Creating..." : "Create Club"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Your club will be created on the Sui blockchain</li>
            <li>• You will receive a ClubAdminCap proving your admin status</li>
            <li>• You can create and manage events for this club</li>
            <li>• Only you can update or delete this club</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

