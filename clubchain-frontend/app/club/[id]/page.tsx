"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import type { Club } from "@/src/services/blockchain/getClubs";
import { EventList } from "@/src/modules/events/EventList";
import { EventCreateModal } from "@/src/modules/events/EventCreateModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OwnerBadge from "@/components/ui/OwnerBadge";
import { Building2, ArrowLeft, Users, Sparkles, Copy, CheckCircle2, UserPlus, UserMinus, AlertCircle, Heart, Coins } from "lucide-react";
import Card, { CardBody } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildJoinEventTx } from "@/modules/contracts/event";
import { buildDonateToClubTx } from "@/modules/contracts/club";
import { PACKAGE_ID } from "@/lib/constants";
import { useHasMemberBadge, useMemberBadge } from "@/hooks/useMemberBadge";
import toast from "react-hot-toast";
import Link from "next/link";

// Membership is now determined by having a MemberBadge on-chain
// No need for localStorage - membership is automatic if user has MemberBadge

export default function ClubPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();
  const { data: hasMemberBadge, isLoading: isCheckingBadge, refetch: refetchMemberBadge } = useHasMemberBadge();
  const [club, setClub] = useState<Club | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data: memberBadge } = useMemberBadge();

  // Refetch member badge when page becomes visible (e.g., returning from registration)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && account?.address) {
        console.log("Page visible, refetching member badge...");
        queryClient.invalidateQueries({ queryKey: ["member-badge", account.address] });
        queryClient.invalidateQueries({ queryKey: ["member-badge-detail", account.address] });
        refetchMemberBadge();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [account?.address, queryClient, refetchMemberBadge]);

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

  // Check membership status - if user has MemberBadge, they are automatically a member
  useEffect(() => {
    console.log("ClubPage: Membership check", {
      address: account?.address,
      hasMemberBadge,
      isCheckingBadge,
    });

    // Only set membership status if we're done checking
    if (!isCheckingBadge) {
      if (account?.address && hasMemberBadge === true) {
        // If user has MemberBadge, they are considered a member
        setIsMember(true);
        console.log("ClubPage: User is a member (has MemberBadge)");
      } else {
        setIsMember(false);
        console.log("ClubPage: User is not a member", {
          hasAccount: !!account?.address,
          hasMemberBadge,
          isCheckingBadge,
        });
      }
    }
  }, [account?.address, hasMemberBadge, isCheckingBadge]);

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

  // User status: Owner if they own the club, Member if they have MemberBadge, otherwise Not a Member
  // Only show "Member" if we're sure (not checking and has badge)
  const userStatus = isOwner 
    ? "Owner" 
    : (!isCheckingBadge && hasMemberBadge) 
      ? "Member" 
      : "Not a Member";


  const handleDonate = async () => {
    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!hasMemberBadge || !memberBadge) {
      toast.error("You need a MemberBadge to donate");
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    const amountSui = parseFloat(donationAmount);
    if (isNaN(amountSui) || amountSui <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
    const amountMist = BigInt(Math.floor(amountSui * 1_000_000_000));

    setIsDonating(true);

    try {
      if (!PACKAGE_ID) {
        toast.error("Configuration error: PACKAGE_ID not set");
        return;
      }

      const tx = buildDonateToClubTx(
        PACKAGE_ID,
        memberBadge.objectId,
        params.id,
        amountMist
      );

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            toast.success(`Successfully donated ${donationAmount} SUI!`);
            setDonationAmount("");
            // Refresh club data
            fetch(`/api/clubs/${params.id}`, { cache: "no-store" })
              .then((res) => res.json())
              .then((data) => setClub(data.club))
              .catch(console.error);
          },
          onError: (err) => {
            toast.error(err.message || "Failed to donate");
          },
          onSettled: () => {
            setIsDonating(false);
          },
        }
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to create donation transaction");
      setIsDonating(false);
    }
  };

  // Format balance from MIST to SUI
  const formatBalance = (balanceMist?: number): string => {
    if (!balanceMist) return "0.00";
    const sui = balanceMist / 1_000_000_000;
    return sui.toFixed(2);
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

        {/* Donation Box */}
        <Card className="animate-slideUp animation-delay-300">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Bağış Kutusu</h2>
                <p className="text-sm text-text-muted">Kulübe bağış yaparak destek olun</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-accent" />
                  <span className="text-sm text-text-muted">Toplam Bağış:</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {formatBalance(club.balance)} SUI
                </span>
              </div>
            </div>

            {hasMemberBadge ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Bağış Miktarı (SUI)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    disabled={isDonating}
                  />
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDonate}
                  disabled={isDonating || !donationAmount || parseFloat(donationAmount) <= 0}
                  className="w-full group"
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {isDonating ? "Bağış Yapılıyor..." : "Bağış Yap"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-2" />
                <p className="text-text-muted mb-4">
                  Bağış yapmak için önce üye olmanız gerekiyor
                </p>
                <Link href="/membership/register">
                  <Button variant="outline" size="lg" className="w-full">
                    <UserPlus className="w-5 h-5" />
                    Üye Ol
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Membership Status - Automatic with MemberBadge */}
        {!isOwner && account?.address && (
          <div className="flex justify-center animate-slideUp animation-delay-300">
            <Card className="w-full max-w-md">
              <CardBody className="text-center p-6">
                {isCheckingBadge ? (
                  <div className="space-y-4">
                    <p className="text-text-muted">Checking membership status...</p>
                  </div>
                ) : !hasMemberBadge ? (
                  <div className="space-y-4">
                    <AlertCircle className="w-12 h-12 text-warning mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Join This Club</h3>
                    <p className="text-text-muted mb-4">
                      To join this club and participate in events, you need to register as a member first. Your 42 account will be linked to your Sui wallet.
                    </p>
                    <Link href={`/membership/register?returnUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : `/club/${params.id}`)}`}>
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full group"
                      >
                        <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Join Club (Register as Member)
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4 border-2 border-success/40">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">You are a Member!</h3>
                    <p className="text-text-muted mb-4">
                      Your MemberBadge gives you automatic access to all clubs. You can participate in events and make donations.
                    </p>
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                      <p className="text-sm text-success font-medium">
                        ✓ MemberBadge Active - You can participate in all club events
                      </p>
                    </div>
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

