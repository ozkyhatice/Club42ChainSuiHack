"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEventDetail } from "../../../[id]/useEventDetail";
import { useCanJoinEvent } from "@/hooks/useBadgeAuth";
import { AlertCircle, X } from "lucide-react";
import Link from "next/link";
import Card, { CardBody } from "@/components/ui/Card";

export default function EventDetailModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    event,
    loading,
    error,
    isParticipant,
    actionLoading,
    handleJoin,
    handleLeave,
    isConnected,
    hasMemberBadge,
    isCheckingBadge,
    showSuccessMessage,
    currentAccount,
  } = useEventDetail(id);
  const canJoinEvent = useCanJoinEvent();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-elevation-3 animate-slideUp">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary hover:bg-secondary-hover text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {loading && (
            <div className="animate-pulse">
              <div className="h-8 bg-secondary rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-secondary rounded w-1/2 mb-6"></div>
              <div className="h-32 bg-secondary rounded mb-6"></div>
              <div className="h-10 bg-secondary rounded w-32"></div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-error mb-6">
              {error}
            </div>
          )}

          {!loading && event && (
            <>
              {/* Event Header */}
              <div className="mb-8 pr-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  {event.title}
                </h1>
                <div className="flex items-center gap-4 text-text-muted">
                  <span className="text-sm">
                    📅{" "}
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Event Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  About This Event
                </h2>
                <p className="text-text-muted leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mb-6 bg-success/10 border border-success/30 rounded-lg p-4">
                  <p className="text-success font-medium">
                      Bu etkinliğe kayıt oldunuz!
                  </p>
                </div>
              )}

              {/* Participants Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Participants ({event.participants?.length || 0})
                </h2>
                {!event.participants || event.participants.length === 0 ? (
                  <p className="text-text-secondary text-sm">
                    No participants yet. Be the first to join!
                  </p>
                ) : (
                  <div className="bg-secondary rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                    {event.participants.map((participant, index) => {
                      const isCurrentUser = currentAccount && participant?.toLowerCase() === currentAccount.toLowerCase();
                      return (
                        <div
                          key={participant}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCurrentUser 
                              ? "bg-primary/10 border-primary/30 text-primary" 
                              : "bg-card border-border text-text-muted"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                              isCurrentUser 
                                ? "bg-primary text-white" 
                                : "bg-secondary text-text-muted"
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className={`font-medium ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                                {isCurrentUser ? "You" : `Participant ${index + 1}`}
                              </p>
                              <p className="text-xs text-text-secondary font-mono">
                                {participant.slice(0, 6)}...{participant.slice(-4)}
                              </p>
                            </div>
                          </div>
                          {isCurrentUser && (
                            <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 items-center flex-wrap">
                {!isConnected ? (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-warning">
                    Please connect your wallet to join this event
                  </div>
                ) : isCheckingBadge ? (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-primary">
                    Checking membership status...
                  </div>
                ) : !hasMemberBadge ? (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-warning font-medium mb-2">
                          You need to register as a member first
                        </p>
                        <p className="text-warning/80 text-sm mb-3">
                          Register to get your MemberBadge and join events
                        </p>
                        <Link
                          href="/membership/register"
                          className="inline-block bg-warning text-white px-4 py-2 rounded-lg hover:bg-warning-light transition font-medium text-sm"
                        >
                          Register as Member
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : isParticipant ? (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="bg-secondary text-foreground px-8 py-3 rounded-lg hover:bg-secondary-hover transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? "Processing..." : "Leave Event"}
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading}
                    className="bg-primary/20 text-primary border border-primary/30 shadow-sm hover:bg-primary/30 hover:scale-105 active:scale-95 px-8 py-3 rounded-lg font-medium transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                  >
                    {actionLoading ? "Processing..." : "Join Event"}
                  </button>
                )}

                <Link
                  href={`/club/${event.clubId}`}
                  className="bg-secondary text-foreground px-8 py-3 rounded-lg hover:bg-secondary-hover transition font-semibold"
                >
                  View Club
                </Link>
              </div>

              {/* Event Info Footer */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Event ID:</span>
                    <p className="text-text-muted font-mono text-xs break-all">
                      {event.id}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Created By:</span>
                    <p className="text-text-muted font-mono text-xs break-all">
                      {event.createdBy}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

