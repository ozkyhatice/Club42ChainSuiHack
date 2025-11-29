"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { useIsClubAdmin } from "@/modules/admin/useAdminCap";
import { buildUpdateClubNameTx, buildDeleteClubTx } from "@/modules/contracts/club";
import { PACKAGE_ID } from "@/lib/constants";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GamifiedButton from "@/components/ui/GamifiedButton";
import OwnerBadge from "@/components/ui/OwnerBadge";
import Badge from "@/components/ui/Badge";
import { 
  Settings, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Crown,
  Shield
} from "lucide-react";

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
        setError("Configuration error: PACKAGE_ID is not set");
        setIsUpdating(false);
        return;
      }

      const tx = buildUpdateClubNameTx(PACKAGE_ID, adminCapId, clubId, newName);

      signAndExecute(
        { transaction: tx  },
        {
          onSuccess: () => {
            setSuccess("Club name updated successfully!");
            setNewName("");
            setIsUpdating(false);
          },
          onError: (err) => {
            setError(err.message || "Failed to update club");
            setIsUpdating(false);
          },
        }
      );
    } catch (err) {
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
        setError("Configuration error: PACKAGE_ID is not set");
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }

      const tx = buildDeleteClubTx(PACKAGE_ID, adminCapId, clubId);

      signAndExecute(
        { transaction: tx  },
        {
          onSuccess: () => {
            setTimeout(() => {
              router.push("/admin");
            }, 1000);
          },
          onError: (err) => {
            setError(err.message || "Failed to delete club");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
          },
        }
      );
    } catch (err) {
      setError(String(err));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <AdminGuard clubId={clubId}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:underline flex items-center gap-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-elevation-3 mb-6 animate-slideUp relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-8 h-8 animate-icon-pulse" />
                    <h1 className="text-3xl md:text-4xl font-bold">
                      Club Management
                    </h1>
                    <OwnerBadge size="md" />
                  </div>
                  <p className="text-indigo-100 text-lg mb-2">
                    Update club details or manage settings
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm" icon={<Shield className="w-3 h-3" />}>
                      Club ID: {clubId.slice(0, 8)}...{clubId.slice(-6)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Update Name Section */}
          <div className="bg-white rounded-xl shadow-elevation-2 p-8 mb-6 animate-slideUp animation-delay-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Edit3 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Update Club Name
              </h2>
            </div>
            
            <form onSubmit={handleUpdateName} className="space-y-5">
              <div>
                <label
                  htmlFor="newName"
                  className="block text-sm font-semibold text-gray-900 mb-3"
                >
                  New Club Name
                </label>
                <input
                  type="text"
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter new club name"
                  disabled={isUpdating}
                  required
                />
              </div>

              {success && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 animate-slideUp">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-800 text-sm font-medium">{success}</p>
                  </div>
                </div>
              )}

              <GamifiedButton
                variant="primary"
                size="lg"
                fullWidth
                disabled={isUpdating}
                loading={isUpdating}
                icon={Edit3}
              >
                {isUpdating ? "Updating..." : "Update Name"}
              </GamifiedButton>
            </form>
          </div>

          {/* Delete Section - Danger Zone */}
          <div className="bg-white rounded-xl shadow-elevation-2 p-8 border-2 border-red-300 animate-slideUp animation-delay-400">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600">
                Danger Zone
              </h2>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium mb-2">
                ⚠️ Warning: This action is irreversible
              </p>
              <p className="text-red-700 text-sm">
                Deleting a club is permanent and cannot be undone. All associated events and data will be lost forever.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <GamifiedButton
                variant="danger"
                size="lg"
                fullWidth
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Club
              </GamifiedButton>
            ) : (
              <div className="space-y-4 animate-slideUp">
                <div className="bg-red-100 border-2 border-red-300 rounded-lg p-5">
                  <p className="text-red-700 font-bold text-lg mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Are you absolutely sure?
                  </p>
                  <p className="text-red-600 text-sm">
                    This action cannot be reversed. The club and all its data will be permanently deleted from the blockchain.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <GamifiedButton
                    variant="danger"
                    size="lg"
                    fullWidth
                    disabled={isDeleting}
                    loading={isDeleting}
                    icon={Trash2}
                    onClick={handleDelete}
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Club"}
                  </GamifiedButton>
                  <GamifiedButton
                    variant="secondary"
                    size="lg"
                    fullWidth
                    disabled={isDeleting}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </GamifiedButton>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 animate-slideUp">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}

