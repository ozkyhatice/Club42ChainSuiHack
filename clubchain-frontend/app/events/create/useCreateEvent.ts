"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { buildCreateEventTx, buildCreateEventAsAdminTx } from "@/modules/contracts/event";
import { PACKAGE_ID, CLOCK_OBJECT_ID } from "@/lib/constants";
import { useUserClubOwnerBadges } from "@/hooks/useClubOwnerBadge";
import { useIsSuperAdmin, useSuperAdminCapId } from "@/hooks/useSuperAdmin";
import type { EventFormData } from "../types";

interface CreateEventState {
  isSubmitting: boolean;
  txStatus: string;
}

export function useCreateEvent() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data: userBadges = [] } = useUserClubOwnerBadges();
  const { data: isSuperAdmin } = useIsSuperAdmin();
  const { data: superAdminCapId } = useSuperAdminCapId();
  const [state, setState] = useState<CreateEventState>({
    isSubmitting: false,
    txStatus: "",
  });

  const createEvent = async (formData: EventFormData, clubId: string) => {
    if (!account) {
      setState({ isSubmitting: false, txStatus: "Please connect wallet first" });
      return;
    }

    if (!clubId) {
      setState({ isSubmitting: false, txStatus: "Club ID not found" });
      return;
    }

    setState({ isSubmitting: true, txStatus: "Creating transaction..." });

    try {
      if (!PACKAGE_ID) {
        setState({ 
          isSubmitting: false, 
          txStatus: "Configuration error: PACKAGE_ID not set" 
        });
        return;
      }

      const eventData = {
        clubId: clubId,
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
      };

      let tx;
      
      // If SuperAdmin, use create_event_as_admin (no badge needed)
      if (isSuperAdmin && superAdminCapId) {
        tx = buildCreateEventAsAdminTx(
          PACKAGE_ID,
          superAdminCapId,
          clubId,
          eventData,
          "" // encrypted_content_blob_id - can be added later
        );
      } else {
        // If ClubOwner, use create_event with ClubOwnerBadge
        const validBadge = userBadges.find(badge => badge.clubId === clubId);
        
        if (!validBadge) {
          setState({ 
            isSubmitting: false, 
            txStatus: "No valid ClubOwnerBadge found for this club. Please contact a Super Admin to issue a badge." 
          });
          return;
        }

        tx = buildCreateEventTx(
          PACKAGE_ID,
          validBadge.objectId,  // Use ClubOwnerBadge
          clubId,
          eventData,
          "", // encrypted_content_blob_id - can be added later
          CLOCK_OBJECT_ID
        );
      }
      
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            setState({
              isSubmitting: false,
              txStatus: `Success! Event created. Digest: ${result.digest}`,
            });
          },
          onError: (error) => {
            setState({
              isSubmitting: false,
              txStatus: `Error: ${error.message}`,
            });
          },
        }
      );
    } catch (error) {
      setState({
        isSubmitting: false,
        txStatus: `Error: ${error}`,
      });
    }
  };

  const resetStatus = () => {
    setState({ isSubmitting: false, txStatus: "" });
  };

  return {
    ...state,
    createEvent,
    resetStatus,
  };
}
