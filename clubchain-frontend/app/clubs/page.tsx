"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getClubs } from "@/src/services/blockchain/getClubs";
import { ClubList } from "@/src/modules/clubs/ClubList";
import GamifiedButton from "@/components/ui/GamifiedButton";
import StatCard from "@/components/ui/StatCard";
import { useIsSuperAdmin } from "@/hooks/useSuperAdmin";
import { Building2, Search, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ClubsPage() {
  const router = useRouter();
  const { data: isSuperAdmin } = useIsSuperAdmin();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all clubs
  const { data: clubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["all-clubs"],
    queryFn: getClubs,
    staleTime: 60000,
  });

  // Filter clubs by search
  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl p-8 shadow-elevation-3 animate-slideUp" style={{ background: 'linear-gradient(90deg, #A78BFA 0%, #60A5FA 100%)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-10 h-10 animate-icon-pulse" style={{ color: '#FFFFFF' }} />
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#FFFFFF' }}>All Clubs</h1>
          </div>
          <p className="text-lg" style={{ color: '#FFFFFF' }}>
            Discover and explore all clubs on campus
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 animate-slideUp animation-delay-200">
          <StatCard
            label="Total Clubs"
            value={clubsLoading ? "..." : clubs.length}
            icon={Building2}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatCard
            label="Total Events"
            value={
              clubsLoading
                ? "..."
                : clubs.reduce((sum, club) => sum + club.events.length, 0)
            }
            icon={Sparkles}
            iconColor="text-accent"
            iconBgColor="bg-accent/10"
          />
          <StatCard
            label="Active Clubs"
            value={clubsLoading ? "..." : clubs.length}
            icon={Building2}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
        </div>

        {/* Search Bar */}
        <div className="bg-card rounded-xl shadow-elevation-2 p-6 border border-border animate-slideUp animation-delay-300">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search clubs by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
            {searchTerm && (
              <GamifiedButton
                variant="secondary"
                size="md"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </GamifiedButton>
            )}
          </div>
        </div>

        {/* Clubs List */}
        <div className="animate-slideUp animation-delay-400">
          {clubsLoading ? (
            <div className="bg-card rounded-xl shadow-elevation-2 border border-border p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text-muted">Loading clubs...</p>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="bg-card rounded-xl shadow-elevation-2 border border-border p-12 text-center">
              <div className="inline-flex p-6 bg-secondary/50 rounded-2xl mb-6">
                <Building2 className="w-16 h-16 text-text-muted" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {searchTerm ? "No clubs found" : "No clubs yet"}
              </h3>
              <p className="text-text-muted mb-6">
                {searchTerm
                  ? "Try a different search term"
                  : "Be the first to create a club!"}
              </p>
              {!searchTerm && isSuperAdmin && (
                <GamifiedButton
                  variant="primary"
                  icon={Plus}
                  onClick={() => router.push("/clubs/create")}
                >
                  Create First Club
                </GamifiedButton>
              )}
            </div>
          ) : (
            <ClubList clubs={filteredClubs} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


