"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  TrendingUp,
  Shield,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Crown
} from "lucide-react";
import { useSynchronizedSignOut } from "@/hooks/useSynchronizedSignOut";
import { useUserClubOwnerBadges } from "@/hooks/useClubOwnerBadge";
import { useMemberBadge } from "@/hooks/useMemberBadge";
import { useParticipationBadges } from "@/hooks/useParticipationBadges";
import Link from "next/link";
import GamifiedButton from "@/components/ui/GamifiedButton";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const account = useCurrentAccount();
  const { handleSignOut } = useSynchronizedSignOut();
  
  // Get user's badges
  const { data: clubOwnerBadges = [], isLoading: badgesLoading } = useUserClubOwnerBadges();
  const { data: memberBadge, isLoading: memberBadgeLoading } = useMemberBadge();
  const { data: participationBadges = [], isLoading: participationLoading } = useParticipationBadges();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#6b5b95] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!session) {
    return null;
  }
  
  const userInitials = session.user?.login
    ? session.user.login.substring(0, 2).toUpperCase()
    : "42";
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Profile Header */}
        <Card className="animate-slideUp">
          <CardBody className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary flex items-center justify-center text-white font-bold text-4xl shadow-lg group-hover:scale-105 transition-transform">
                  {userInitials}
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7c6ba0] to-[#6b5b95] opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {session.user?.login || "Student"}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 text-text-muted">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#8b7ba8]" />
                    <span className="text-[#8b7ba8]">42 Student</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-warning" />
                    Active Member
                  </span>
                </div>
                {session.user?.email && (
                  <p className="text-sm text-text-secondary mt-2 flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {session.user.email}
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-error hover:bg-error/10"
                  onClick={() => handleSignOut("/")}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp animation-delay-200">
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="p-3 bg-primary/10 rounded-lg inline-flex mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">--</p>
              <p className="text-sm text-text-muted">Clubs Joined</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="p-3 bg-accent/10 rounded-lg inline-flex mb-3">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl font-bold text-foreground">--</p>
              <p className="text-sm text-text-muted">Events Attended</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="p-3 bg-success/10 rounded-lg inline-flex mb-3">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">--</p>
              <p className="text-sm text-text-muted">Events Created</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="p-3 bg-warning/10 rounded-lg inline-flex mb-3">
                <Award className="w-6 h-6 text-warning" />
              </div>
              <p className="text-2xl font-bold text-foreground">--</p>
              <p className="text-sm text-text-muted">Achievements</p>
            </CardBody>
          </Card>
        </div>
        
        {/* Connection Status */}
        <div className="grid sm:grid-cols-2 gap-6 animate-slideUp animation-delay-400">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Authentication
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                  <span className="text-sm font-medium text-[#8b7ba8]">42 OAuth</span>
                  <span className="flex items-center gap-2 text-success font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border ${account ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'}`}>
                  <span className="text-sm font-medium text-foreground">Sui Wallet</span>
                  {account ? (
                    <span className="flex items-center gap-2 text-success font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-warning font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Account Details
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-secondary">Username</p>
                    <p className="text-sm font-medium text-foreground">{session.user?.login || "N/A"}</p>
                  </div>
                </div>
                {account && (
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-text-muted mt-0.5" />
                    <div>
                      <p className="text-xs text-text-secondary">Wallet Address</p>
                      <p className="text-sm font-medium text-foreground font-mono break-all">
                        {account.address}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-secondary">Member Since</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="animate-slideUp animation-delay-600">
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
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-secondary/50 border-border"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      clubOwnerBadges.length > 0 ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <Crown className={`w-5 h-5 ${
                        clubOwnerBadges.length > 0 ? "text-primary" : "text-text-muted"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Club Owner</h3>
                      <p className="text-xs text-text-muted">
                        {clubOwnerBadges.length} Badge{clubOwnerBadges.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {clubOwnerBadges.length > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
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


