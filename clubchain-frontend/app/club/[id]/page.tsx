"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type { Club } from "@/src/services/blockchain/getClubs";
import { EventList } from "@/src/modules/events/EventList";
import { EventCreateModal } from "@/src/modules/events/EventCreateModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OwnerBadge from "@/components/ui/OwnerBadge";
import { Building2, ArrowLeft, Users, Sparkles, Copy, CheckCircle2, UserPlus, UserMinus } from "lucide-react";
import Card, { CardBody } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildJoinEventTx, buildLeaveEventTx } from "@/modules/contracts/event";
import { PACKAGE_ID } from "@/lib/constants";

export default function ClubPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const account = useCurrentAccount();
  const [club, setClub] = useState<Club | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await fetch(`/api/clubs/${params.id}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Kulüp bulunamadı");
        }
        const data = await response.json();
        setClub(data.club);
        setStatus("success");
      } catch (error) {
        setStatus("error");
      }
    };

    fetchClub();
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-elevation-2 border border-border p-12 animate-pulse">
            <div className="h-8 bg-secondary/50 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-secondary/50 rounded w-1/2"></div>
          </div>
      </div>
      </DashboardLayout>
    );
  }

  if (status === "error" || !club) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card className="border-error/20">
            <CardBody className="text-center py-12">
              <div className="inline-flex p-4 bg-error/10 rounded-full mb-4">
                <Building2 className="w-12 h-12 text-error" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Club Not Found
              </h2>
              <p className="text-text-muted mb-6">
                The club information could not be loaded. Please try again later.
              </p>
              <button
                onClick={() => router.push("/clubs")}
                className="px-6 py-2 bg-primary/20 text-primary border border-primary/30 shadow-sm hover:bg-primary/30 hover:scale-105 active:scale-95 rounded-lg font-medium transition-all group"
              >
                Back to Clubs
              </button>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isOwner =
    !!account?.address &&
    account.address.toLowerCase() === club.owner.toLowerCase();

  // Check if user is a member (participated in at least one event)
  const isMember = !!account?.address && club.events.some(event => 
    event.participants?.some(participant => 
      participant.toLowerCase() === account.address.toLowerCase()
    )
  );

  const userStatus = isOwner ? "Owner" : (isMember ? "Member" : "Not a Member");

  // Get first available event for joining
  const firstEvent = club.events.find(event => 
    !event.participants?.some(p => p.toLowerCase() === account?.address?.toLowerCase())
  );

  const handleJoinClub = async () => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }

    if (club.events.length === 0) {
      alert("This club has no events yet. Please wait for the owner to create events.");
      return;
    }

    // Scroll to events section
    const eventsSection = document.getElementById("events-section");
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLeaveClub = async () => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }

    // Find all events user is participating in
    const userEvents = club.events.filter(event =>
      event.participants?.some(p => p.toLowerCase() === account.address.toLowerCase())
    );

    if (userEvents.length === 0) {
      alert("You are not a member of this club.");
      return;
    }

    if (!confirm(`Are you sure you want to leave this club? This will remove you from ${userEvents.length} event(s).`)) {
      return;
    }

    try {
      setActionLoading(true);
      
      // Leave from all events
      for (const event of userEvents) {
        try {
          const tx = buildLeaveEventTx(PACKAGE_ID, event.id);
          await new Promise((resolve, reject) => {
            signAndExecute(
              { transaction: tx },
              {
                onSuccess: resolve,
                onError: reject,
              }
            );
          });
        } catch (error) {
          console.error(`Failed to leave event ${event.id}:`, error);
        }
      }

      // Refresh page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Failed to leave club:", error);
      alert("Failed to leave club. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/clubs")}
          className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Clubs</span>
        </button>

        {/* Header Section */}
        <div className="bg-primary rounded-xl p-8 text-white shadow-elevation-3 animate-slideUp">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-10 h-10 animate-icon-pulse" />
                <h1 className="text-3xl md:text-4xl font-bold">{club.name}</h1>
                {isOwner && <OwnerBadge size="lg" />}
              </div>
              <p className="text-white/90 text-lg mb-4">{club.description}</p>
              
              {/* Club Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-primary-light/30 px-3 py-1.5 rounded-lg">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">
                    {club.events.length} Event{club.events.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(club.id)}
                  className="flex items-center gap-2 bg-primary-light/30 px-3 py-1.5 rounded-lg hover:bg-primary-light/40 transition-colors group"
                >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-mono text-xs">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-mono text-xs">
                          ID: {club.id.slice(0, 8)}...{club.id.slice(-6)}
                        </span>
                      </>
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 animate-slideUp animation-delay-200">
          <StatCard
            label="Total Events"
            value={club.events.length}
            icon={Sparkles}
            iconColor="text-accent"
            iconBgColor="bg-accent/10"
          />
          <StatCard
            label="Club Owner"
            value={club.owner.slice(0, 6) + "..." + club.owner.slice(-4)}
            icon={Users}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatCard
            label="Status"
            value={userStatus}
            icon={Building2}
            iconColor={isOwner ? "text-warning" : (isMember ? "text-success" : "text-gray-400")}
            iconBgColor={isOwner ? "bg-warning/10" : (isMember ? "bg-success/10" : "bg-gray-100")}
          />
        </div>

        {/* Join/Leave Club Button - Prominent */}
        {!isOwner && account?.address && (
          <div className="flex justify-center animate-slideUp animation-delay-300">
            <Card className="w-full max-w-md">
              <CardBody className="text-center p-6">
                {isMember ? (
                  <div className="space-y-4">
                    <p className="text-text-muted mb-4">You are a member of this club</p>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLeaveClub}
                      disabled={actionLoading}
                      className="w-full group"
                    >
                      <UserMinus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      {actionLoading ? "Leaving..." : "Üyelikten Çık"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-text-muted mb-4">Join this club to participate in events</p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleJoinClub}
                      className="w-full group"
                    >
                      <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Üye Ol
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Events Section */}
        <div id="events-section" className="animate-slideUp animation-delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" />
              Events
          </h2>
            {isOwner && (
              <EventCreateModal clubId={club.id} isOwner={isOwner} />
            )}
          </div>
          <EventList events={club.events} />
        </div>
      </div>
    </DashboardLayout>
  );
}

