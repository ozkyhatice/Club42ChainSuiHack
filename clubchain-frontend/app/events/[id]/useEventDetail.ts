import { useState, useEffect } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { buildJoinEventTx, buildLeaveEventTx } from "@/modules/contracts/event";
import { PACKAGE_ID } from "@/lib/constants";

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
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

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
      setError("Please connect your wallet");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const tx = buildJoinEventTx(PACKAGE_ID, event.id);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            // Refresh event data
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
          onError: () => {
            setError("Failed to join event. You may already be a participant.");
          },
        }
      );
    } catch (err) {
      setError("Failed to join event");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!currentAccount?.address || !event) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const tx = buildLeaveEventTx(PACKAGE_ID, event.id);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            // Refresh event data
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
          onError: () => {
            setError("Failed to leave event. You may not be a participant.");
          },
        }
      );
    } catch (err) {
      setError("Failed to leave event");
    } finally {
      setActionLoading(false);
    }
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
  };
}

