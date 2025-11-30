"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Users, Crown, Zap, Search, Building2, PlusCircle, Plus } from "lucide-react";
import { useUserMemberClubs, useUserOwnedClubs, useIsAnyClubOwner } from "@/hooks/useClubOwnership";
import { useRouter } from "next/navigation";
import { useCanCreateEvent } from "@/hooks/useBadgeAuth";
import { useCurrentAccount } from "@mysten/dapp-kit";
import GamifiedButton from "@/components/ui/GamifiedButton";
import OwnerBadge from "@/components/ui/OwnerBadge";

export default function MyClubsPage() {
  const router = useRouter();
  const { data: memberClubs = [], isLoading: memberLoading } = useUserMemberClubs();
  const { data: ownedClubs = [], isLoading: ownedLoading } = useUserOwnedClubs();
  
  // Get owner status and account
  const { isOwner, clubCount } = useIsAnyClubOwner();
  const canCreateEvent = useCanCreateEvent();
  const account = useCurrentAccount();
  
  // Combine owned and member clubs, removing duplicates
  const allMyClubs = [
    ...ownedClubs,
    ...memberClubs.filter(club => !ownedClubs.some(owned => owned.id === club.id))
  ];
  
  const isLoading = memberLoading || ownedLoading;
  
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Owner Dashboard Section - Moved to top */}
        {isOwner && (
          <Card className="hover-lift">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-primary fill-current animate-icon-pulse" />
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Owner Dashboard</h2>
                <OwnerBadge size="sm" />
          </div>
              <p className="text-base sm:text-lg text-foreground mb-4 font-medium">
                You own {clubCount} club{clubCount !== 1 ? 's' : ''}. Manage your clubs and create events.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {account && (
                  <GamifiedButton
                    variant="primary"
                    size="md"
                    icon={Plus}
                    onClick={() => router.push("/clubs/create")}
                    fullWidth
                  >
                    Create New Club
                  </GamifiedButton>
                )}
                {canCreateEvent && (
                  <GamifiedButton
                    variant="gradient"
                    size="md"
                    icon={PlusCircle}
                    onClick={() => router.push("/events/create")}
                    fullWidth
                  >
                    Create Event
                  </GamifiedButton>
                )}
        </div>
            </CardBody>
          </Card>
        )}

        {/* Create Your Club Section - Only show if not owner */}
        {account && !isOwner && (
          <Card className="hover-lift">
            <CardBody className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary animate-icon-pulse" />
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Create Your Club</h2>
              </div>
              <GamifiedButton
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => router.push("/clubs/create")}
              >
                Create New Club
              </GamifiedButton>
            </div>
            </CardBody>
          </Card>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-primary/20 rounded-lg mb-2">
                <Crown className="w-8 h-8 text-primary" />
            </div>
              <p className="text-2xl font-bold text-foreground">{ownedClubs.length}</p>
              <p className="text-sm text-gray-400">Owned Clubs</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-accent/20 rounded-lg mb-2">
                <Zap className="w-8 h-8 text-accent" />
            </div>
              <p className="text-2xl font-bold text-foreground">{allMyClubs.length}</p>
              <p className="text-sm text-gray-400">Total Memberships</p>
            </CardBody>
          </Card>
          </div>
        
        {/* Clubs grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="col-span-full hover-lift">
              <CardBody className="text-center py-12">
                <p className="text-gray-400">Loading clubs...</p>
              </CardBody>
            </Card>
          </div>
        ) : allMyClubs.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="col-span-full hover-lift">
              <CardBody className="text-center py-12">
                <div className="inline-flex p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4 border border-primary/20">
                  <Users className="w-16 h-16 text-primary animate-icon-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No clubs yet</h3>
                <p className="text-gray-400 mb-6">Join clubs or participate in events to see them here</p>
                <Link href="/clubs">
                  <Button variant="primary" className="gap-2">
                    <Search className="w-4 h-4" />
                    Explore Clubs
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMyClubs.map((club) => {
              const isOwner = ownedClubs.some(owned => owned.id === club.id);
              return (
                <Card key={club.id} className="hover-lift cursor-pointer" onClick={() => router.push(`/club/${club.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1">{club.name}</h3>
                        <p className="text-sm text-gray-400">
                          {isOwner ? "Role: Owner" : "Role: Member"}
                        </p>
                      </div>
                      {isOwner && (
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Crown className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {club.description || "No description provided"}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/club/${club.id}`);
                        }}
                      >
                        View Details
                      </Button>
                      {isOwner && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/clubs/${club.id}/manage`);
                          }}
                        >
                          Manage
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

