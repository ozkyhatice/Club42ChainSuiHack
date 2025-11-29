"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { Shield, Building2, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PACKAGE_ID, CLOCK_OBJECT_ID, USER_REGISTRY_ID } from "@/lib/constants";
import { useIsSuperAdmin, useSuperAdminCapId } from "@/hooks/useSuperAdmin";
import { getClubs } from "@/src/services/blockchain/getClubs";
import { useQuery } from "@tanstack/react-query";

/**
 * Manual Badge Assignment Page
 * Super Admin can manually assign badges to specific wallet addresses
 */
export default function ManualBadgesPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data: isSuperAdmin, isLoading: isCheckingAdmin } = useIsSuperAdmin();
  const { data: superAdminCapId, isLoading: isLoadingCapId } = useSuperAdminCapId();

  // Fetch all clubs for ClubOwnerBadge assignment
  const { data: clubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["all-clubs-for-badges"],
    queryFn: getClubs,
    staleTime: 60000,
  });

  // State for operations
  const [operationStatus, setOperationStatus] = useState<{
    type: string | null;
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: null, status: "idle", message: "" });

  // Predefined addresses
  const predefinedAddresses = {
    superAdmin: "0xaea47050b39c3fa5705da86e7afccd1129b63ea514e7bbd5472c50087148d079",
    clubOwner: "0xe74c730a48b19d558d62c2a99d1fc1e7c885616efbabe423994089f8178929cd",
    clubOwner2: "0x850b5df765ee4672c59ad62fc007df7f0f1263a0744a14ab219daaba87815b65", // New club owner
    normalMember: "0x958654efa5cbdfecd7e93a1882742cefebfb0234f4fd5d62bda69e6b4b86543e",
  };

  // State for manual inputs
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [selectedClubId2, setSelectedClubId2] = useState<string>(""); // For second club owner
  const [badgeDuration, setBadgeDuration] = useState<number>(7776000000); // 90 days default
  const [badgeDuration2, setBadgeDuration2] = useState<number>(7776000000); // 90 days default for second club owner

  const handleAssignSuperAdmin = async () => {
    if (!superAdminCapId) {
      setOperationStatus({
        type: "superAdmin",
        status: "error",
        message: "SuperAdminCap not found. You must be a Super Admin to perform this operation.",
      });
      return;
    }

    setOperationStatus({ type: "superAdmin", status: "loading", message: "Transferring SuperAdminCap..." });

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::super_admin::transfer_super_admin_cap`,
        arguments: [tx.object(superAdminCapId), tx.pure.address(predefinedAddresses.superAdmin)],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setOperationStatus({
              type: "superAdmin",
              status: "success",
              message: `SuperAdminCap successfully transferred to ${predefinedAddresses.superAdmin.slice(0, 10)}...`,
            });
          },
          onError: (error) => {
            setOperationStatus({
              type: "superAdmin",
              status: "error",
              message: error.message || "Failed to transfer SuperAdminCap",
            });
          },
        }
      );
    } catch (error: any) {
      setOperationStatus({
        type: "superAdmin",
        status: "error",
        message: error.message || "Failed to build transaction",
      });
    }
  };

  const handleAssignClubOwnerBadge = async () => {
    if (!superAdminCapId) {
      setOperationStatus({
        type: "clubOwner",
        status: "error",
        message: "SuperAdminCap not found.",
      });
      return;
    }

    if (!selectedClubId) {
      setOperationStatus({
        type: "clubOwner",
        status: "error",
        message: "Please select a club first.",
      });
      return;
    }

    if (!CLOCK_OBJECT_ID) {
      setOperationStatus({
        type: "clubOwner",
        status: "error",
        message: "Clock object ID not configured.",
      });
      return;
    }

    setOperationStatus({ type: "clubOwner", status: "loading", message: "Issuing ClubOwnerBadge..." });

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::club::issue_owner_badge`,
        arguments: [
          tx.object(superAdminCapId),
          tx.object(selectedClubId),
          tx.pure.address(predefinedAddresses.clubOwner),
          tx.pure.u64(badgeDuration),
          tx.object(CLOCK_OBJECT_ID),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setOperationStatus({
              type: "clubOwner",
              status: "success",
              message: `ClubOwnerBadge successfully issued to ${predefinedAddresses.clubOwner.slice(0, 10)}...`,
            });
          },
          onError: (error) => {
            setOperationStatus({
              type: "clubOwner",
              status: "error",
              message: error.message || "Failed to issue ClubOwnerBadge",
            });
          },
        }
      );
    } catch (error: any) {
      setOperationStatus({
        type: "clubOwner",
        status: "error",
        message: error.message || "Failed to build transaction",
      });
    }
  };

  const handleRegisterNormalMember = async () => {
    if (!superAdminCapId) {
      setOperationStatus({
        type: "normalMember",
        status: "error",
        message: "SuperAdminCap not found.",
      });
      return;
    }

    if (!USER_REGISTRY_ID) {
      setOperationStatus({
        type: "normalMember",
        status: "error",
        message: "User Registry ID not configured.",
      });
      return;
    }

    if (!CLOCK_OBJECT_ID) {
      setOperationStatus({
        type: "normalMember",
        status: "error",
        message: "Clock object ID not configured.",
      });
      return;
    }

    setOperationStatus({ type: "normalMember", status: "loading", message: "Registering user..." });

    try {
      // Generate a unique intra_id (using timestamp as a simple unique ID)
      const intraId = Date.now();
      const username = `member_${intraId}`;
      const email = `${intraId}@42.fr`;

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::member::register_user_manual`,
        arguments: [
          tx.object(superAdminCapId),
          tx.object(USER_REGISTRY_ID),
          tx.pure.address(predefinedAddresses.normalMember),
          tx.pure.u64(intraId),
          tx.pure.string(username),
          tx.pure.string(email),
          tx.object(CLOCK_OBJECT_ID),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setOperationStatus({
              type: "normalMember",
              status: "success",
              message: `User successfully registered: ${predefinedAddresses.normalMember.slice(0, 10)}...`,
            });
          },
          onError: (error) => {
            setOperationStatus({
              type: "normalMember",
              status: "error",
              message: error.message || "Failed to register user",
            });
          },
        }
      );
    } catch (error: any) {
      setOperationStatus({
        type: "normalMember",
        status: "error",
        message: error.message || "Failed to build transaction",
      });
    }
  };

  // Loading state
  if (isCheckingAdmin || isLoadingCapId) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Checking admin privileges...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Not super admin
  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-8 text-center">
            <div className="inline-flex p-6 bg-error/20 rounded-2xl mb-6 border border-error/30">
              <Shield className="w-16 h-16 text-error" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Super Admin Access Required</h1>
            <p className="text-gray-400 mb-6">Only Super Admins can manually assign badges.</p>
            <GamifiedButton variant="secondary" onClick={() => router.push("/dashboard")} icon={Shield}>
              Back to Dashboard
            </GamifiedButton>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-primary rounded-xl p-8 text-white shadow-elevation-3 animate-slideUp">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 animate-icon-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold">Manual Badge Assignment</h1>
          </div>
          <p className="text-white/90 text-lg">Assign badges to predefined wallet addresses</p>
        </div>

        {/* Super Admin Assignment */}
        <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-6 animate-slideUp animation-delay-200">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">1. Super Admin (Level 1)</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Address: <code className="bg-secondary px-2 py-1 rounded text-sm">{predefinedAddresses.superAdmin}</code>
          </p>
          <p className="text-sm text-gray-400 mb-4">
            This will transfer your SuperAdminCap to the specified address. Make sure you want to do this!
          </p>
          <GamifiedButton
            variant="primary"
            icon={Shield}
            onClick={handleAssignSuperAdmin}
            disabled={operationStatus.type === "superAdmin" && operationStatus.status === "loading"}
          >
            {operationStatus.type === "superAdmin" && operationStatus.status === "loading"
              ? "Transferring..."
              : "Transfer SuperAdminCap"}
          </GamifiedButton>
          {operationStatus.type === "superAdmin" && (
            <div className={`mt-4 p-4 rounded-lg ${
              operationStatus.status === "success"
                ? "bg-success/10 border border-success/20 text-success"
                : "bg-error/10 border border-error/20 text-error"
            }`}>
              {operationStatus.status === "success" ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <p>{operationStatus.message}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p>{operationStatus.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Club Owner Badge Assignment */}
        <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-6 animate-slideUp animation-delay-300">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-warning" />
            <h2 className="text-2xl font-bold text-foreground">2. Club Owner (Level 2)</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Address: <code className="bg-secondary px-2 py-1 rounded text-sm">{predefinedAddresses.clubOwner}</code>
          </p>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Select Club</label>
              {clubsLoading ? (
                <p className="text-gray-400">Loading clubs...</p>
              ) : clubs.length === 0 ? (
                <p className="text-gray-400">No clubs available. Create a club first.</p>
              ) : (
                <select
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Select a club...</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Badge Duration (milliseconds)
              </label>
              <input
                type="number"
                value={badgeDuration}
                onChange={(e) => setBadgeDuration(Number(e.target.value))}
                placeholder="7776000000 (90 days)"
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Default: 7,776,000,000 ms (90 days). Max: 31,536,000,000 ms (1 year)
              </p>
            </div>
          </div>

          <GamifiedButton
            variant="primary"
            icon={Building2}
            onClick={handleAssignClubOwnerBadge}
            disabled={
              !selectedClubId ||
              clubsLoading ||
              (operationStatus.type === "clubOwner" && operationStatus.status === "loading")
            }
          >
            {operationStatus.type === "clubOwner" && operationStatus.status === "loading"
              ? "Issuing Badge..."
              : "Issue ClubOwnerBadge"}
          </GamifiedButton>
          {operationStatus.type === "clubOwner" && (
            <div className={`mt-4 p-4 rounded-lg ${
              operationStatus.status === "success"
                ? "bg-success/10 border border-success/20 text-success"
                : "bg-error/10 border border-error/20 text-error"
            }`}>
              {operationStatus.status === "success" ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <p>{operationStatus.message}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p>{operationStatus.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Club Owner Badge Assignment - Second Address */}
        <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-6 animate-slideUp animation-delay-350">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-warning" />
            <h2 className="text-2xl font-bold text-foreground">2b. Club Owner (Level 2) - Second Address</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Address: <code className="bg-secondary px-2 py-1 rounded text-sm">{predefinedAddresses.clubOwner2}</code>
          </p>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Select Club</label>
              {clubsLoading ? (
                <p className="text-gray-400">Loading clubs...</p>
              ) : clubs.length === 0 ? (
                <p className="text-gray-400">No clubs available. Create a club first.</p>
              ) : (
                <select
                  value={selectedClubId2}
                  onChange={(e) => setSelectedClubId2(e.target.value)}
                  className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Select a club...</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Badge Duration (milliseconds)
              </label>
              <input
                type="number"
                value={badgeDuration2}
                onChange={(e) => setBadgeDuration2(Number(e.target.value))}
                placeholder="7776000000 (90 days)"
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Default: 7,776,000,000 ms (90 days). Max: 31,536,000,000 ms (1 year)
              </p>
            </div>
          </div>

          <GamifiedButton
            variant="primary"
            icon={Building2}
            onClick={async () => {
              if (!superAdminCapId) {
                setOperationStatus({
                  type: "clubOwner2",
                  status: "error",
                  message: "SuperAdminCap not found.",
                });
                return;
              }

              if (!selectedClubId2) {
                setOperationStatus({
                  type: "clubOwner2",
                  status: "error",
                  message: "Please select a club first.",
                });
                return;
              }

              if (!CLOCK_OBJECT_ID) {
                setOperationStatus({
                  type: "clubOwner2",
                  status: "error",
                  message: "Clock object ID not configured.",
                });
                return;
              }

              setOperationStatus({ type: "clubOwner2", status: "loading", message: "Issuing ClubOwnerBadge..." });

              try {
                const tx = new Transaction();
                tx.moveCall({
                  target: `${PACKAGE_ID}::club::issue_owner_badge`,
                  arguments: [
                    tx.object(superAdminCapId),
                    tx.object(selectedClubId2),
                    tx.pure.address(predefinedAddresses.clubOwner2),
                    tx.pure.u64(badgeDuration2),
                    tx.object(CLOCK_OBJECT_ID),
                  ],
                });

                signAndExecute(
                  { transaction: tx },
                  {
                    onSuccess: () => {
                      setOperationStatus({
                        type: "clubOwner2",
                        status: "success",
                        message: `ClubOwnerBadge successfully issued to ${predefinedAddresses.clubOwner2.slice(0, 10)}...`,
                      });
                    },
                    onError: (error) => {
                      setOperationStatus({
                        type: "clubOwner2",
                        status: "error",
                        message: error.message || "Failed to issue ClubOwnerBadge",
                      });
                    },
                  }
                );
              } catch (error: any) {
                setOperationStatus({
                  type: "clubOwner2",
                  status: "error",
                  message: error.message || "Failed to build transaction",
                });
              }
            }}
            disabled={
              !selectedClubId2 ||
              clubsLoading ||
              (operationStatus.type === "clubOwner2" && operationStatus.status === "loading")
            }
          >
            {operationStatus.type === "clubOwner2" && operationStatus.status === "loading"
              ? "Issuing Badge..."
              : "Issue ClubOwnerBadge"}
          </GamifiedButton>
          {operationStatus.type === "clubOwner2" && (
            <div className={`mt-4 p-4 rounded-lg ${
              operationStatus.status === "success"
                ? "bg-success/10 border border-success/20 text-success"
                : "bg-error/10 border border-error/20 text-error"
            }`}>
              {operationStatus.status === "success" ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <p>{operationStatus.message}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p>{operationStatus.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Normal Member Registration */}
        <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-6 animate-slideUp animation-delay-400">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-success" />
            <h2 className="text-2xl font-bold text-foreground">3. Normal Member (Level 3)</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Address: <code className="bg-secondary px-2 py-1 rounded text-sm">{predefinedAddresses.normalMember}</code>
          </p>
          <p className="text-sm text-gray-400 mb-4">
            This will register the user and create a UserProfile with a ClubMemberSBT.
          </p>
          <GamifiedButton
            variant="primary"
            icon={User}
            onClick={handleRegisterNormalMember}
            disabled={operationStatus.type === "normalMember" && operationStatus.status === "loading"}
          >
            {operationStatus.type === "normalMember" && operationStatus.status === "loading"
              ? "Registering..."
              : "Register User"}
          </GamifiedButton>
          {operationStatus.type === "normalMember" && (
            <div className={`mt-4 p-4 rounded-lg ${
              operationStatus.status === "success"
                ? "bg-success/10 border border-success/20 text-success"
                : "bg-error/10 border border-error/20 text-error"
            }`}>
              {operationStatus.status === "success" ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <p>{operationStatus.message}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p>{operationStatus.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-end">
          <GamifiedButton variant="secondary" onClick={() => router.push("/admin")}>
            Back to Admin Panel
          </GamifiedButton>
        </div>
      </div>
    </DashboardLayout>
  );
}

