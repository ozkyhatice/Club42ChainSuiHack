"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, CLOCK_OBJECT_ID } from "@/lib/constants";
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

  const createEvent = async (formData: EventFormData) => {
    if (!account) {
      setState({ isSubmitting: false, txStatus: "Please connect wallet first" });
      return;
    }

    setState({ isSubmitting: true, txStatus: "Creating transaction..." });

    try {
      const tx = new Transaction();

      // Convert datetime to unix timestamp (milliseconds)
      const startTimeMs = new Date(formData.startTime).getTime();
      const endTimeMs = new Date(formData.endTime).getTime();

      tx.moveCall({
        target: `${PACKAGE_ID}::event::create_event`,
        arguments: [
          tx.pure.address(formData.clubId || account.address),
          tx.pure.string(formData.title),
          tx.pure.string(formData.description),
          tx.pure.string(formData.location),
          tx.pure.u64(startTimeMs),
          tx.pure.u64(endTimeMs),
          tx.object(CLOCK_OBJECT_ID),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            setState({
              isSubmitting: false,
              txStatus: `Success! Digest: ${result.digest}`,
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

