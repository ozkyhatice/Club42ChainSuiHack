"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { SuperAdminGuard } from "@/components/guards/SuperAdminGuard";
import { useSuperAdminCapId } from "@/hooks/useSuperAdmin";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GamifiedButton from "@/components/ui/GamifiedButton";
import Badge from "@/components/ui/Badge";
import { getClubs } from "@/src/services/blockchain/getClubs";
import {
  Shield,
  Crown,
  Building2,
  UserPlus,
  Users,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/constants";

export default function SuperAdminPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data: superAdminCapId } = useSuperAdminCapId();

  // States for creating club
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // States for transferring ownership
  const [selectedClubForTransfer, setSelectedClubForTransfer] = useState("");
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all clubs
  const { data: clubs = [], isLoading: clubsLoading, refetch: refetchClubs } = useQuery({
    queryKey: ["super-admin-clubs"],
    queryFn: getClubs,
    staleTime: 30000,
  });

  // Filter clubs
  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create club
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!superAdminCapId) {
      setCreateError("SuperAdminCap not found");
      return;
    }

    if (!clubName.trim() || !clubDescription.trim() || !ownerAddress.trim()) {
      setCreateError("All fields are required");
      return;
    }

    setIsCreating(true);

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::club_v2::create_club_as_admin`,
        arguments: [
          tx.object(superAdminCapId),
          tx.pure.string(clubName.trim()),
          tx.pure.string(clubDescription.trim()),
          tx.pure.address(ownerAddress.trim()),
        ],
      });

      signAndExecute(
        { transaction: tx  },
        {
          onSuccess: () => {
            setCreateSuccess("Club created successfully! Owner has received ClubAdminCap.");
            setClubName("");
            setClubDescription("");
            setOwnerAddress("");
            setIsCreating(false);
            setShowCreateForm(false);
            refetchClubs();
          },
          onError: (err) => {
            setCreateError(err.message || "Failed to create club");
            setIsCreating(false);
          },
        }
      );
    } catch (err) {
      setCreateError(String(err));
      setIsCreating(false);
    }
  };

  // Handle transfer ownership
  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");

    if (!superAdminCapId) {
      setTransferError("SuperAdminCap not found");
      return;
    }

    if (!selectedClubForTransfer || !newOwnerAddress.trim()) {
      setTransferError("Club and new owner address are required");
      return;
    }

    setIsTransferring(true);

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::club_v2::transfer_club_ownership`,
        arguments: [
          tx.object(superAdminCapId),
          tx.object(selectedClubForTransfer),
          tx.pure.address(newOwnerAddress.trim()),
        ],
      });

      signAndExecute(
        { transaction: tx  },
        {
          onSuccess: () => {
            setTransferSuccess("Ownership transferred successfully! New owner has received ClubAdminCap.");
            setSelectedClubForTransfer("");
            setNewOwnerAddress("");
            setIsTransferring(false);
            refetchClubs();
          },
          onError: (err) => {
            setTransferError(err.message || "Failed to transfer ownership");
            setIsTransferring(false);
          },
        }
      );
    } catch (err) {
      setTransferError(String(err));
      setIsTransferring(false);
    }
  };

  return (
    <SuperAdminGuard>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-xl p-8 text-white shadow-elevation-3 animate-slideUp relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-10 h-10 animate-icon-pulse fill-current" />
                <h1 className="text-3xl md:text-4xl font-bold">Super Admin Panel</h1>
                <Badge variant="error" size="md" className="bg-white/20 text-white border-white/30">
                  SUPER ADMIN
                </Badge>
              </div>
              <p className="text-pink-100 text-lg">
                Full system control • Create clubs • Assign owners • Manage everything
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 animate-slideUp animation-delay-200">
            <div className="bg-white rounded-xl p-6 shadow-elevation-2 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clubs</p>
                  <p className="text-3xl font-bold text-gray-900">{clubs.length}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-elevation-2 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {clubs.reduce((sum, club) => sum + club.events.length, 0)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-elevation-2 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Privilege</p>
                  <p className="text-lg font-bold text-red-600">SUPER ADMIN</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <Shield className="w-8 h-8 text-red-600 fill-current" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Club */}
            <div className="bg-white rounded-xl shadow-elevation-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Create Club</h2>
                </div>
                <GamifiedButton
                  variant={showCreateForm ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? "Cancel" : "New Club"}
                </GamifiedButton>
              </div>

              {showCreateForm && (
                <form onSubmit={handleCreateClub} className="space-y-4 animate-slideUp">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Club Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., Web3 Developers Club"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      value={clubDescription}
                      onChange={(e) => setClubDescription(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      rows={3}
                      placeholder="Describe the club..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Owner Address (Sui Wallet Address)
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerAddress}
                      onChange={(e) => setOwnerAddress(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                      placeholder="0x..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This address will receive the ClubAdminCap and become the club owner
                    </p>
                  </div>

                  <GamifiedButton
                    variant="gradient"
                    size="lg"
                    fullWidth
                    disabled={isCreating}
                    loading={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Club & Assign Owner"}
                  </GamifiedButton>

                  {createSuccess && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 animate-slideUp">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800 font-medium">{createSuccess}</p>
                      </div>
                    </div>
                  )}

                  {createError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 animate-slideUp">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 font-medium">{createError}</p>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {!showCreateForm && (
                <p className="text-gray-600 text-sm">
                  Create a new club and immediately assign ownership to a user. The specified address will receive the ClubAdminCap NFT.
                </p>
              )}
            </div>

            {/* Transfer Ownership */}
            <div className="bg-white rounded-xl shadow-elevation-2 p-6">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Transfer Ownership</h2>
              </div>

              <form onSubmit={handleTransferOwnership} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Club
                  </label>
                  <select
                    required
                    value={selectedClubForTransfer}
                    onChange={(e) => setSelectedClubForTransfer(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">-- Select a club --</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    New Owner Address
                  </label>
                  <input
                    type="text"
                    required
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono text-sm"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    New owner will receive a fresh ClubAdminCap NFT
                  </p>
                </div>

                <GamifiedButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isTransferring}
                  loading={isTransferring}
                  icon={UserPlus}
                >
                  {isTransferring ? "Transferring..." : "Transfer Ownership"}
                </GamifiedButton>

                {transferSuccess && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 animate-slideUp">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800 font-medium">{transferSuccess}</p>
                    </div>
                  </div>
                )}

                {transferError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 animate-slideUp">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 font-medium">{transferError}</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* All Clubs List */}
          <div className="bg-white rounded-xl shadow-elevation-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                All Clubs ({clubs.length})
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <GamifiedButton variant="secondary" size="sm" icon={RefreshCw} onClick={() => refetchClubs()}>
                  Refresh
                </GamifiedButton>
              </div>
            </div>

            {clubsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No clubs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClubs.map((club) => (
                  <div
                    key={club.id}
                    className="border border-gray-200 rounded-lg p-4 hover-lift transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{club.name}</h3>
                          <Badge variant="success" size="sm">
                            {club.events.length} Events
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{club.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Owner: {club.owner.slice(0, 6)}...{club.owner.slice(-4)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            ID: {club.id.slice(0, 6)}...{club.id.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </SuperAdminGuard>
  );
}

