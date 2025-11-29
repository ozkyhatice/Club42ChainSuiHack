"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getClubs } from "@/src/services/blockchain/getClubs";
import { getUserAdminCaps } from "@/modules/contracts/admin-cap";
import GamifiedButton from "@/components/ui/GamifiedButton";
import Badge from "@/components/ui/Badge";
import OwnerBadge from "@/components/ui/OwnerBadge";
import StatCard from "@/components/ui/StatCard";
import {
  Shield,
  Users,
  Building2,
  Crown,
  Search,
  UserPlus,
  UserMinus,
  AlertTriangle,
  ChevronRight,
  Plus,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  // Fetch all clubs
  const { data: clubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["admin-clubs"],
    queryFn: getClubs,
    staleTime: 60000,
  });

  // Fetch user's admin caps (to see which clubs they own)
  const { data: adminCaps = [], isLoading: capsLoading } = useQuery({
    queryKey: ["admin-user-caps", account?.address],
    queryFn: async () => {
      if (!account?.address) return [];
      return await getUserAdminCaps(suiClient, account.address);
    },
    enabled: !!account?.address,
    staleTime: 30000,
  });

  const ownedClubIds = new Set(adminCaps.map((cap) => cap.club_id));
  const ownedClubs = clubs.filter((club) => ownedClubIds.has(club.id));

  // Filter clubs by search
  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (clubsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-elevation-3 animate-slideUp relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-10 h-10 animate-icon-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-indigo-100 text-lg">
              Manage club ownership and administrative privileges
            </p>
          </div>
        </div>

        {/* Create Club Button */}
        <div className="flex justify-end animate-slideUp animation-delay-200">
          <GamifiedButton
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={() => router.push("/clubs/create")}
          >
            Create New Club
          </GamifiedButton>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 animate-slideUp animation-delay-300">
          <StatCard
            label="Total Clubs"
            value={clubs.length}
            icon={Building2}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <StatCard
            label="Clubs You Own"
            value={ownedClubs.length}
            icon={Crown}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
          />
          <StatCard
            label="Total Admins"
            value={adminCaps.length}
            icon={Users}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 animate-slideUp animation-delay-400">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Owner Assignment Info
              </h3>
              <p className="text-sm text-blue-800">
                Currently, club ownership is managed through ClubAdminCap NFTs on the blockchain.
                The club creator automatically receives the admin capability. To transfer ownership,
                the current owner would need to transfer their ClubAdminCap NFT to the new owner.
              </p>
            </div>
          </div>
        </div>

        {/* Club List Section */}
        <div className="bg-white rounded-xl shadow-elevation-2 p-6 animate-slideUp animation-delay-600">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              All Clubs
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {filteredClubs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No clubs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClubs.map((club) => {
                const isOwned = ownedClubIds.has(club.id);
                return (
                  <div
                    key={club.id}
                    className="border border-gray-200 rounded-lg p-4 hover-lift transition-all cursor-pointer"
                    onClick={() =>
                      setSelectedClub(selectedClub === club.id ? null : club.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {club.name}
                          </h3>
                          {isOwned && <OwnerBadge size="sm" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {club.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Owner: {club.owner.slice(0, 6)}...{club.owner.slice(-4)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            ID: {club.id.slice(0, 6)}...{club.id.slice(-4)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          selectedClub === club.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>

                    {/* Expanded section */}
                    {selectedClub === club.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 animate-slideUp">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Owner Management
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Current Owner:</strong>
                          </p>
                          <p className="text-xs font-mono text-gray-600 bg-white px-3 py-2 rounded border border-gray-200">
                            {club.owner}
                          </p>
                        </div>
                        
                        {isOwned ? (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700 mb-2">
                              You own this club. To transfer ownership, transfer your ClubAdminCap NFT to the new owner's address.
                            </p>
                            <GamifiedButton
                              variant="secondary"
                              size="sm"
                              icon={UserPlus}
                              onClick={() => router.push(`/clubs/${club.id}/manage`)}
                            >
                              Manage Club
                            </GamifiedButton>
                          </div>
                        ) : (
                          <Badge variant="default" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                            Only the owner can manage this club
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Your Owned Clubs */}
        {ownedClubs.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-elevation-2 p-6 border border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-yellow-600 fill-current" />
              Your Owned Clubs
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {ownedClubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-white rounded-lg p-4 border border-yellow-200 hover-lift transition-all cursor-pointer"
                  onClick={() => router.push(`/clubs/${club.id}/manage`)}
                >
                  <h3 className="font-bold text-gray-900 mb-1">{club.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{club.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="success" size="sm">
                      {club.events.length} Events
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
