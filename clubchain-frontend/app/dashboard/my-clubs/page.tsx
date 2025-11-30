"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Users, Crown, Zap, Search, Award, User, Calendar, CheckCircle2, Clock, Building2, PlusCircle, Settings, Shield, Plus } from "lucide-react";
import { useUserMemberClubs, useUserOwnedClubs, useIsAnyClubOwner } from "@/hooks/useClubOwnership";
import { useRouter } from "next/navigation";
import { useUserClubOwnerBadges } from "@/hooks/useClubOwnerBadge";
import { useMemberBadge } from "@/hooks/useMemberBadge";
import { useParticipationBadges } from "@/hooks/useParticipationBadges";
import { useCanCreateEvent } from "@/hooks/useBadgeAuth";
import { useCurrentAccount } from "@mysten/dapp-kit";
import GamifiedButton from "@/components/ui/GamifiedButton";
import OwnerBadge from "@/components/ui/OwnerBadge";

export default function MyClubsPage() {
  const router = useRouter();
  const { data: memberClubs = [], isLoading: memberLoading } = useUserMemberClubs();
  const { data: ownedClubs = [], isLoading: ownedLoading } = useUserOwnedClubs();
  
  // Get user's badges
  const { data: clubOwnerBadges = [], isLoading: badgesLoading } = useUserClubOwnerBadges();
  const { data: memberBadge, isLoading: memberBadgeLoading } = useMemberBadge();
  const { data: participationBadges = [], isLoading: participationLoading } = useParticipationBadges();
  
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
      <div className="space-y-6 animate-fadeIn">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Clubs</h1>
            <p className="text-gray-400">Clubs you've joined and manage</p>
          </div>
          <Link href="/clubs">
            <Button variant="primary">
              Browse All Clubs
            </Button>
          </Link>
        </div>

        {/* Create Your Club Section */}
        {account && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl shadow-elevation-2 p-6 border border-primary/20 animate-slideUp">
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
          </div>
        )}

        {/* Owner Dashboard Section */}
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
                        <div className="p-2 bg-yellow-50 rounded-lg">
                          <Crown className="w-5 h-5 text-yellow-600" />
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
        
        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-yellow-50 rounded-lg mb-2">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{ownedClubs.length}</p>
              <p className="text-sm text-gray-400">Owned Clubs</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-green-50 rounded-lg mb-2">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{allMyClubs.length}</p>
              <p className="text-sm text-gray-400">Total Memberships</p>
            </CardBody>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="animate-slideUp animation-delay-300 mt-8">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Your Badges</h2>
            </div>
            
            {badgesLoading || memberBadgeLoading || participationLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="mt-3 text-text-muted">Loading badges...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {/* Member Badge */}
                <div className={`p-4 rounded-lg border-2 ${
                  memberBadge 
                    ? "bg-success/10 border-success/30" 
                    : "bg-secondary/50 border-border"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      memberBadge ? "bg-success/20" : "bg-secondary"
                    }`}>
                      <User className={`w-5 h-5 ${
                        memberBadge ? "text-success" : "text-text-muted"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Member Badge</h3>
                      <p className="text-xs text-text-muted">System Registration</p>
                    </div>
                    {memberBadge ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  {memberBadge ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-foreground">
                        <span className="font-medium">Intra ID:</span> {memberBadge.intraId}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">Username:</span> {memberBadge.username}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-text-muted">
                        Register to get your MemberBadge
                      </p>
                      <Link href="/membership/register">
                        <GamifiedButton variant="primary" size="sm" className="w-full">
                          Register Now
                        </GamifiedButton>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Club Owner Badges */}
                <div className={`p-4 rounded-lg border-2 ${
                  clubOwnerBadges.length > 0
                    ? "bg-warning/10 border-warning/30" 
                    : "bg-secondary/50 border-border"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      clubOwnerBadges.length > 0 ? "bg-warning/20" : "bg-secondary"
                    }`}>
                      <Crown className={`w-5 h-5 ${
                        clubOwnerBadges.length > 0 ? "text-warning" : "text-text-muted"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Club Owner</h3>
                      <p className="text-xs text-text-muted">
                        {clubOwnerBadges.length} Badge{clubOwnerBadges.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {clubOwnerBadges.length > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-warning" />
                    ) : (
                      <Clock className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  {clubOwnerBadges.length > 0 ? (
                    <div className="space-y-2">
                      {clubOwnerBadges.slice(0, 2).map((badge) => {
                        const expirationDate = new Date(badge.expirationMs);
                        const isExpiringSoon = badge.expirationMs - Date.now() < 7 * 24 * 60 * 60 * 1000;
                        return (
                          <div key={badge.objectId} className="text-sm">
                            <p className="text-foreground font-medium">
                              Club: {badge.clubId.slice(0, 8)}...
                            </p>
                            <p className={`text-xs ${
                              isExpiringSoon ? "text-error" : "text-text-muted"
                            }`}>
                              Expires: {expirationDate.toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                      {clubOwnerBadges.length > 2 && (
                        <p className="text-xs text-text-muted">
                          +{clubOwnerBadges.length - 2} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">
                      No club owner badges yet
                    </p>
                  )}
                </div>

                {/* Participation Badges */}
                <div className={`p-4 rounded-lg border-2 ${
                  participationBadges.length > 0
                    ? "bg-accent/10 border-accent/30" 
                    : "bg-secondary/50 border-border"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      participationBadges.length > 0 ? "bg-accent/20" : "bg-secondary"
                    }`}>
                      <Calendar className={`w-5 h-5 ${
                        participationBadges.length > 0 ? "text-accent" : "text-text-muted"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Participation</h3>
                      <p className="text-xs text-text-muted">
                        {participationBadges.length} Event{participationBadges.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {participationBadges.length > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <Clock className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  {participationBadges.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {participationBadges.slice(0, 3).map((badge) => (
                        <div key={badge.objectId} className="text-sm">
                          <p className="text-foreground font-medium truncate">
                            {badge.eventTitle || "Event"}
                          </p>
                          <p className="text-xs text-text-muted">
                            ID: {badge.eventId.slice(0, 8)}...
                          </p>
                        </div>
                      ))}
                      {participationBadges.length > 3 && (
                        <p className="text-xs text-text-muted">
                          +{participationBadges.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">
                      No participation badges yet. Join events to earn badges!
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}

