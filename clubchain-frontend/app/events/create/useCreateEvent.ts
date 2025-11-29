"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildCreateEventTx } from "@/modules/contracts/event";
import { PACKAGE_ID } from "@/lib/constants";
import type { EventFormData } from "../types";

interface CreateEventState {
  isSubmitting: boolean;
  txStatus: string;
}

export function useCreateEvent() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [state, setState] = useState<CreateEventState>({
    isSubmitting: false,
    txStatus: "",
  });

  const createEvent = async (formData: EventFormData, adminCapId: string, clubId: string) => {
    if (!account) {
      setState({ isSubmitting: false, txStatus: "Please connect wallet first" });
      return;
    }

    if (!adminCapId) {
      setState({ isSubmitting: false, txStatus: "Admin capability not found" });
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

      const tx = buildCreateEventTx(
        PACKAGE_ID,
        adminCapId,
        clubId,
        eventData
      );
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
