import { useState, useEffect } from "react";
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
  useEffect(() => {
    async function fetchEvent() {
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
    }

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Check if current user is a participant
  useEffect(() => {
    if (event && currentAccount?.address) {
      const isParticipating = event.participants.some(
        (addr) => addr.toLowerCase() === currentAccount.address.toLowerCase()
      );
      setIsParticipant(isParticipating);
    } else {
      setIsParticipant(false);
    }
  }, [event, currentAccount]);

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
          onSuccess: (result) => {
            toast.success("Successfully joined the event! Participation badge minted.");
            // Refresh event data
            setTimeout(() => {
              window.location.reload();
            }, 1500);
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
  };
}

