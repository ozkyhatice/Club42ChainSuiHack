"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ModuleCard from "./ModuleCard";
import Card, { CardBody } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import OwnerBadge from "@/components/ui/OwnerBadge";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { getClubs } from "@/src/services/blockchain/getClubs";
import { useUserOwnedClubs, useIsAnyClubOwner } from "@/hooks/useClubOwnership";
import { 
  Users, 
  Calendar, 
  Building2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Crown,
  PlusCircle,
  Settings,
  Shield
} from "lucide-react";

export default function DashboardHome() {
  const account = useCurrentAccount();
  const router = useRouter();
  
  // Fetch all clubs for stats
  const { data: allClubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["dashboard-clubs"],
    queryFn: getClubs,
    staleTime: 60000,
  });
  
  // Get user's owned clubs
  const { data: ownedClubs = [], isLoading: ownedLoading } = useUserOwnedClubs();
  const { isOwner, clubCount } = useIsAnyClubOwner();
  
  // Calculate stats
  const totalEvents = allClubs.reduce((sum, club) => sum + club.events.length, 0);
  const myClubEvents = ownedClubs.reduce((sum, club) => sum + club.events.length, 0);
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 sm:p-8 text-white shadow-lg animate-slideUp relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 animate-icon-pulse" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  Welcome back, User!
                </h1>
                {isOwner && <OwnerBadge size="md" />}
              </div>
              <p className="text-blue-100 text-base sm:text-lg">
                {isOwner 
                  ? `Managing ${clubCount} club${clubCount !== 1 ? 's' : ''}. Keep up the great work! 👑`
                  : "Ready to explore clubs and events on campus? Let's make it happen! 🚀"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Dashboard */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp animation-delay-200">
        <StatCard
          label="Total Clubs"
          value={clubsLoading ? "..." : allClubs.length}
          icon={Building2}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          onClick={() => router.push("/clubs")}
        />
        <StatCard
          label="Total Events"
          value={clubsLoading ? "..." : totalEvents}
          icon={Sparkles}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          onClick={() => router.push("/events")}
        />
        {isOwner && (
          <>
            <StatCard
              label="My Clubs"
              value={ownedLoading ? "..." : clubCount}
              icon={Crown}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-50"
              onClick={() => router.push("/dashboard/my-clubs")}
            />
            <StatCard
              label="My Events"
              value={ownedLoading ? "..." : myClubEvents}
              icon={Calendar}
              iconColor="text-green-600"
              iconBgColor="bg-green-50"
              onClick={() => router.push("/dashboard/my-events")}
            />
          </>
        )}
      </div>
      
      {/* Connection Status */}
      <div className="grid sm:grid-cols-2 gap-4 animate-slideUp animation-delay-300">
        {/* 42 Auth Status */}
        <Card className="hover-lift">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">42 Authentication</p>
                <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Connected
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Wallet Status */}
        <Card className="hover-lift">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sui Wallet</p>
                {account ? (
                  <>
                    <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Connected
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-orange-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Not Connected
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${account ? 'bg-green-50' : 'bg-orange-50'}`}>
                <TrendingUp className={`w-8 h-8 ${account ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Info Card - For Non-Owners */}
      {!isOwner && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-elevation-2 p-6 border-2 border-blue-200 animate-slideUp animation-delay-400">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-blue-600 animate-icon-pulse" />
            <h2 className="text-2xl font-bold text-gray-900">Club Membership</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Browse available clubs and join communities! Club ownership is managed by the Super Admin.
          </p>
          <GamifiedButton
            variant="primary"
            size="lg"
            icon={Building2}
            onClick={() => router.push("/clubs")}
            fullWidth
          >
            Explore Clubs
          </GamifiedButton>
        </div>
      )}

      {/* Owner-Only Quick Actions */}
      {isOwner && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-elevation-2 p-6 border-2 border-yellow-200 animate-slideUp animation-delay-400">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-yellow-600 fill-current animate-icon-pulse" />
            <h2 className="text-2xl font-bold text-gray-900">Owner Dashboard</h2>
            <OwnerBadge size="sm" />
          </div>
          <p className="text-gray-700 mb-4">
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
        {/* My Clubs Module */}
        <ModuleCard
          title="My Clubs"
          description="Manage your club memberships and explore new communities"
          icon={Users}
          iconColor="text-blue-600"
          stats={[
            { label: "Clubs Joined", value: "--" },
            { label: "Owned Clubs", value: clubCount.toString() }
          ]}
          actions={[
            { label: "View All", href: "/dashboard/my-clubs", variant: "secondary" },
            { label: "Browse Clubs", href: "/clubs", variant: "primary" }
          ]}
          badge={isOwner ? { label: "Owner", color: "bg-yellow-100 text-yellow-800" } : { label: "Active", color: "bg-green-100 text-green-800" }}
          onClick={() => router.push("/dashboard/my-clubs")}
        />
        
        {/* My Events Module */}
        <ModuleCard
          title="My Events"
          description="Track your registered events and create new ones"
          icon={Calendar}
          iconColor="text-purple-600"
          stats={[
            { label: "Registered", value: "--" },
            { label: "Created", value: isOwner ? myClubEvents.toString() : "--" }
          ]}
          actions={
            isOwner 
              ? [
                  { label: "My Events", href: "/dashboard/my-events", variant: "secondary" },
                  { label: "Create Event", href: "/events/create", variant: "primary" }
                ]
              : [
                  { label: "My Events", href: "/dashboard/my-events", variant: "secondary" },
                  { label: "Browse Events", href: "/events", variant: "primary" }
                ]
          }
          badge={{ label: "Upcoming", color: "bg-purple-100 text-purple-800" }}
          onClick={() => router.push("/dashboard/my-events")}
        />
        
        {/* All Clubs Module */}
        <ModuleCard
          title="Club Directory"
          description="Discover all clubs on campus and find your community"
          icon={Building2}
          iconColor="text-indigo-600"
          stats={[
            { label: "Total Clubs", value: clubsLoading ? "--" : allClubs.length.toString() },
            { label: "Active", value: clubsLoading ? "--" : allClubs.length.toString() }
          ]}
          actions={[
            { label: "Explore Clubs", href: "/clubs", variant: "primary" }
          ]}
          onClick={() => router.push("/clubs")}
        />
        
        {/* All Events Module */}
        <ModuleCard
          title="Event Listings"
          description="Browse upcoming events and register to participate"
          icon={Sparkles}
          iconColor="text-pink-600"
          stats={[
            { label: "Total Events", value: clubsLoading ? "--" : totalEvents.toString() },
            { label: "This Week", value: "--" }
          ]}
          actions={[
            { label: "View Events", href: "/events", variant: "primary" }
          ]}
          badge={{ label: "Live", color: "bg-pink-100 text-pink-800" }}
          onClick={() => router.push("/events")}
        />
      </div>
    </div>
  );
}

