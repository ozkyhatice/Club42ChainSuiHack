"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ModuleCard from "./ModuleCard";
import OwnerBadge from "@/components/ui/OwnerBadge";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { getClubs } from "@/src/services/blockchain/getClubs";
import { useIsAnyClubOwner } from "@/hooks/useClubOwnership";
import { 
  Building2, 
  Sparkles, 
  Crown,
  PlusCircle,
  Settings,
  Shield
} from "lucide-react";

export default function DashboardHome() {
  const router = useRouter();
  
  // Fetch all clubs for stats
  const { data: allClubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["dashboard-clubs"],
    queryFn: getClubs,
    staleTime: 60000,
  });
  
  // Get user's owned clubs
  const { isOwner, clubCount } = useIsAnyClubOwner();
  
  // Calculate stats
  const totalEvents = allClubs.reduce((sum, club) => sum + club.events.length, 0);
  
  return (
    <div className="space-y-6">
      {/* Owner-Only Quick Actions */}
      {isOwner && (
        <div className="bg-gradient-to-br from-warning/3 to-warning/2 rounded-xl shadow-elevation-2 p-6 border border-warning/5 animate-slideUp animation-delay-400">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-warning fill-current animate-icon-pulse" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Owner Dashboard</h2>
            <OwnerBadge size="sm" />
          </div>
          <p className="text-base sm:text-lg text-foreground mb-4 font-medium">
            You own {clubCount} club{clubCount !== 1 ? 's' : ''}. Manage your clubs and create events.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <GamifiedButton
              variant="gradient"
              size="md"
              icon={PlusCircle}
              onClick={() => router.push("/events/create")}
              fullWidth
            >
              Create Event
            </GamifiedButton>
            <GamifiedButton
              variant="primary"
              size="md"
              icon={Settings}
              onClick={() => router.push("/dashboard/my-clubs")}
              fullWidth
            >
              Manage Clubs
            </GamifiedButton>
            <GamifiedButton
              variant="secondary"
              size="md"
              icon={Shield}
              onClick={() => router.push("/admin")}
              fullWidth
            >
              Admin Panel
            </GamifiedButton>
          </div>
        </div>
      )}
      
      {/* Modular Dashboard Cards */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slideUp animation-delay-500">
        {/* All Clubs Module */}
        <ModuleCard
          title="Club Directory"
          description="Discover all clubs on campus and find your community"
          icon={Building2}
          iconColor="text-[#6b5b95]"
          stats={[
            { label: "Total Clubs", value: clubsLoading ? "--" : allClubs.length.toString() },
            { label: "Active", value: clubsLoading ? "--" : allClubs.length.toString() }
          ]}
          actions={[
            { label: "Explore Clubs", href: "/clubs" }
          ]}
          onClick={() => router.push("/clubs")}
        />
        
        {/* All Events Module */}
        <ModuleCard
          title="Event Listings"
          description="Browse upcoming events and register to participate"
          icon={Sparkles}
          iconColor="text-warning"
          stats={[
            { label: "Total Events", value: clubsLoading ? "--" : totalEvents.toString() },
            { label: "This Week", value: "--" }
          ]}
          actions={[
            { label: "View Events", href: "/events" }
          ]}
          badge={undefined}
          onClick={() => router.push("/events")}
        />
      </div>
    </div>
  );
}

