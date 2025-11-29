"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { useIsClubAdmin } from "@/modules/admin/useAdminCap";
import { buildUpdateClubNameTx, buildDeleteClubTx } from "@/modules/contracts/club";
import { PACKAGE_ID } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManageClubPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const clubId = resolvedParams.id;
  const account = useCurrentAccount();
  const router = useRouter();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { adminCapId } = useIsClubAdmin(clubId);
  
  const [newName, setNewName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !adminCapId) {
      setError("Admin capability not found");
      return;
    }

    if (!newName.trim()) {
      setError("Club name is required");
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      if (!PACKAGE_ID) {
        console.error("PACKAGE_ID is undefined");
        setError("Configuration error: PACKAGE_ID is not set");
        setIsUpdating(false);
        return;
      }

      console.log("Building update transaction with:", {
        PACKAGE_ID,
        adminCapId,
        clubId,
        newName,
      });

      const tx = buildUpdateClubNameTx(PACKAGE_ID, adminCapId, clubId, newName);

      console.log("Transaction block created, signing...");
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Club updated successfully:", result);
            setSuccess("Club name updated successfully!");
            setNewName("");
            setIsUpdating(false);
          },
          onError: (err) => {
            console.error("Error updating club:", err);
            setError(err.message || "Failed to update club");
            setIsUpdating(false);
          },
        }
      );
    } catch (err) {
      console.error("Transaction error:", err);
      setError(String(err));
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!account || !adminCapId) {
      setError("Admin capability not found");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      if (!PACKAGE_ID) {
        console.error("PACKAGE_ID is undefined");
        setError("Configuration error: PACKAGE_ID is not set");
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }

      console.log("Building delete transaction with:", {
        PACKAGE_ID,
        adminCapId,
        clubId,
      });

      const tx = buildDeleteClubTx(PACKAGE_ID, adminCapId, clubId);

      console.log("Transaction block created, signing...");
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Club deleted successfully:", result);
            setTimeout(() => {
              router.push("/admin");
            }, 1000);
          },
          onError: (err) => {
            console.error("Error deleting club:", err);
            setError(err.message || "Failed to delete club");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
          },
        }
      );
    } catch (err) {
      console.error("Transaction error:", err);
      setError(String(err));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <AdminGuard clubId={clubId}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Manage Club
            </h1>
            <p className="text-gray-600">
              Update club details or delete the club
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Club ID: {clubId}
            </p>
          </div>

          {/* Update Name Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Update Club Name
            </h2>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label
                  htmlFor="newName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Club Name
                </label>
                <input
                  type="text"
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new club name"
                  disabled={isUpdating}
                  required
                />
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {isUpdating ? "Updating..." : "Update Name"}
              </button>
            </form>
          </div>

          {/* Delete Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-red-200">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Danger Zone
            </h2>
            <p className="text-gray-600 mb-6">
              Deleting a club is permanent and cannot be undone. All associated data will be lost.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Delete Club
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-semibold mb-2">
                    Are you absolutely sure?
                  </p>
                  <p className="text-red-600 text-sm">
                    This action cannot be reversed. The club will be permanently deleted.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Club"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

