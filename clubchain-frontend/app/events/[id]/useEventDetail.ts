import { useState, useEffect, useCallback } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { buildJoinEventTx } from "@/modules/contracts/event";
import { PACKAGE_ID } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useHasMemberBadge } from "@/hooks/useMemberBadge";
import toast from "react-hot-toast";

export type EventDetail = {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string;
  date: number;
  participants: string[];
};

export function useEventDetail(eventId: string) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data: hasMemberBadge, isLoading: isCheckingBadge } = useHasMemberBadge();

  // Get user's MemberBadge
  const { data: memberBadgeId } = useQuery({
    queryKey: ["member-badge-id", currentAccount?.address],
    queryFn: async () => {
      if (!currentAccount?.address) return null;
      const objects = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::club_system::MemberBadge`,
        },
        options: {
          showContent: true,
        },
        limit: 1,
      });
      return objects.data[0]?.data?.objectId || null;
    },
    enabled: !!currentAccount?.address,
  });

  // Fetch event details
  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }

      const data = await response.json();
      setEvent(data.event);
      setError(null);
    } catch (err) {
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  // Check if current user is a participant by checking their ParticipationBadges
  const { data: userParticipationBadges = [] } = useQuery({
    queryKey: ["user-participation-badges", currentAccount?.address, eventId],
    queryFn: async () => {
      if (!currentAccount?.address || !eventId) return [];
      
      try {
        const objects = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${PACKAGE_ID}::club_system::ParticipationBadge`,
          },
          options: {
            showContent: true,
          },
        });

        const normalizeId = (id: string | any): string => {
          if (!id) return "";
          const str = typeof id === "object" && id !== null ? (id.id || id.value || String(id)) : String(id);
          const cleaned = str.startsWith("0x") ? str.slice(2) : str;
          return cleaned.toLowerCase();
        };

        const normalizedEventId = normalizeId(eventId);
        
        return objects.data
          .map(obj => {
            const content = obj.data?.content;
            if (content && "fields" in content) {
              const fields = content.fields as any;
              let badgeEventId = fields.event_id || fields.eventId || "";
              if (typeof badgeEventId === "object" && badgeEventId !== null) {
                badgeEventId = badgeEventId.id || badgeEventId.value || String(badgeEventId);
              }
              return {
                objectId: obj.data?.objectId,
                eventId: String(badgeEventId),
                normalizedEventId: normalizeId(badgeEventId),
              };
            }
            return null;
          })
          .filter(badge => badge && badge.normalizedEventId === normalizedEventId);
      } catch (error) {
        console.error("Error fetching user participation badges:", error);
        return [];
      }
    },
    enabled: !!currentAccount?.address && !!eventId,
    staleTime: 10000, // 10 seconds
  });

  // Check if current user is a participant
  useEffect(() => {
    if (event && currentAccount?.address) {
      const normalizedUserAddress = currentAccount.address.toLowerCase();
      // Check both from event participants list and from user's badges
      const isInParticipantsList = event.participants?.some(
        (addr) => addr?.toLowerCase() === normalizedUserAddress
      ) ?? false;
      const hasBadge = userParticipationBadges.length > 0;
      const isParticipating = isInParticipantsList || hasBadge;
      
      console.log("isParticipant check:", {
        userAddress: currentAccount.address,
        normalizedUserAddress,
        participants: event.participants,
        isInParticipantsList,
        hasBadge,
        userBadges: userParticipationBadges,
        isParticipating
      });
      
      setIsParticipant(isParticipating);
    } else {
      setIsParticipant(false);
    }
  }, [event, currentAccount, userParticipationBadges]);

  const handleJoin = async () => {
    if (!currentAccount?.address || !event) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!hasMemberBadge || !memberBadgeId) {
      toast.error("You need to register as a member first to join events");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const tx = buildJoinEventTx(PACKAGE_ID, memberBadgeId, event.id);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            toast.success("Successfully joined the event! Participation badge minted.");
            setShowSuccessMessage(true);
            // Refresh event data after a delay to allow blockchain to update
            // Try multiple times as blockchain updates may take a moment
            setTimeout(async () => {
              await fetchEvent();
            }, 3000);
            setTimeout(async () => {
              await fetchEvent();
            }, 6000);
          },
          onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : "Failed to join event";
            toast.error(errorMessage);
            setError(errorMessage);
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to join event";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Note: leave_event function is not available in the new contract
  const handleLeave = async () => {
    setError("Leaving events is not supported in the current contract version.");
  };

  return {
    event,
    loading,
    error,
    isParticipant,
    actionLoading,
    handleJoin,
    handleLeave,
    isConnected: !!currentAccount?.address,
    hasMemberBadge: hasMemberBadge ?? false,
    isCheckingBadge,
    showSuccessMessage,
    currentAccount: currentAccount?.address,
  };
}

