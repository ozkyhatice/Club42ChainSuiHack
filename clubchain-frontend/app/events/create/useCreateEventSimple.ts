"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, CLOCK_OBJECT_ID } from "@/lib/constants";
import { useUserClubOwnerBadges } from "@/hooks/useClubOwnerBadge";
import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import type { EventFormData } from "../types";

interface CreateEventState {
  isSubmitting: boolean;
  txStatus: string;
}

export function useCreateEvent() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [state, setState] = useState<CreateEventState>({
    isSubmitting: false,
    txStatus: "",
  });

  // Get user's club owner badges
  const { data: clubOwnerBadges = [] } = useUserClubOwnerBadges();

  const createEvent = async (formData: EventFormData, clubId: string) => {
    if (!account) {
      setState({ isSubmitting: false, txStatus: "Please connect wallet first" });
      return;
    }

    if (!clubId) {
      setState({ isSubmitting: false, txStatus: "Club ID not found" });
      return;
    }

    // Find a valid club owner badge for this club
    // useUserClubOwnerBadges already filters expired badges, so we just need to match clubId
    const validBadge = clubOwnerBadges.find(badge => badge.clubId === clubId);
    if (!validBadge) {
      setState({ 
        isSubmitting: false, 
        txStatus: "❌ No valid ClubOwnerBadge found for this club. Please make sure you have a valid badge for the selected club." 
      });
      console.error("No valid badge found:", {
        clubId,
        availableBadges: clubOwnerBadges.map(b => ({ clubId: b.clubId, objectId: b.objectId })),
      });
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

      console.log("Creating event with:", {
        clubId,
        title: formData.title,
        description: formData.description,
        badgeId: validBadge.objectId,
        badgeClubId: validBadge.clubId,
        date: formData.date,
        packageId: PACKAGE_ID,
        clockId: CLOCK_OBJECT_ID,
        account: account.address,
      });

      // Parse date and convert to timestamps (in milliseconds for Move)
      const eventDate = new Date(formData.date);
      const startTime = eventDate.getTime(); // This is already in milliseconds
      const endTime = startTime + (2 * 60 * 60 * 1000); // Add 2 hours in milliseconds

      // Debug logging
      console.log("Date conversion debug:", {
        originalDate: formData.date,
        parsedDate: eventDate,
        startTimeMs: startTime,
        endTimeMs: endTime,
        startTimeISO: new Date(startTime).toISOString(),
        endTimeISO: new Date(endTime).toISOString(),
      });

      // Build transaction
      const tx = new Transaction();
      
      // Set gas budget (100 million MIST = 0.1 SUI)
      tx.setGasBudget(100000000);
      
      // Debug logging
      console.log("Transaction details:", {
        target: `${PACKAGE_ID}::club_system::create_event`,
        badgeId: validBadge.objectId,
        badgeClubId: validBadge.clubId,
        clubId,
        title: formData.title,
        description: formData.description,
        startTime,
        endTime,
        clockId: CLOCK_OBJECT_ID,
        gasBudget: 100000000,
      });

      // Validate inputs before building transaction
      if (!formData.title || formData.title.length === 0) {
        setState({ 
          isSubmitting: false, 
          txStatus: "❌ Event title cannot be empty" 
        });
        return;
      }

      if (!formData.description || formData.description.length === 0) {
        setState({ 
          isSubmitting: false, 
          txStatus: "❌ Event description cannot be empty" 
        });
        return;
      }

      if (startTime <= Date.now()) {
        setState({ 
          isSubmitting: false, 
          txStatus: "❌ Event date must be in the future" 
        });
        return;
      }

      try {
        // Build the move call
        // Signature: create_event(badge: &ClubOwnerBadge, club: &Club, title: String, start_time: u64, end_time: u64, blob_id: String, description: String, clock: &Clock, ctx: &mut TxContext)
        tx.moveCall({
          target: `${PACKAGE_ID}::club_system::create_event`,
          arguments: [
            tx.object(validBadge.objectId), // badge: &ClubOwnerBadge
            tx.object(clubId), // club: &Club
            tx.pure.string(formData.title), // title: String
            tx.pure.u64(startTime), // start_time: u64
            tx.pure.u64(endTime), // end_time: u64
            tx.pure.string(""), // blob_id: String (encrypted_blob_id)
            tx.pure.string(formData.description), // description: String
            tx.object(CLOCK_OBJECT_ID), // clock: &Clock
          ],
        });

        console.log("Transaction built successfully, calling wallet...");
      } catch (buildError: any) {
        console.error("Failed to build transaction:", buildError);
        setState({ 
          isSubmitting: false, 
          txStatus: `❌ Transaction build error: ${buildError.message}` 
        });
        return;
      }

      setState({ isSubmitting: true, txStatus: "Waiting for signature..." });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Event creation successful:", result);
            setState({ 
              isSubmitting: false, 
              txStatus: "  Event created successfully!" 
            });
          },
          onError: (error) => {
            console.error("Event creation failed:", error);
            
            let errorMessage = "Unknown error occurred";
            if (error && typeof error === 'object') {
              if ('message' in error) {
                errorMessage = (error as any).message;
              } else if ('code' in error) {
                // Handle specific error codes
                const errorCode = (error as any).code;
                switch (errorCode) {
                  case 4001:
                    errorMessage = "Transaction was rejected by user";
                    break;
                  case -32603:
                    errorMessage = "Internal wallet error occurred";
                    break;
                  default:
                    errorMessage = `Wallet error (code: ${errorCode})`;
                }
              }
            } else if (typeof error === 'string') {
              errorMessage = error;
            }
            
            // Check for specific error patterns
            let isUserCancellation = false;
            let statusIcon = "❌";
            let statusPrefix = "Failed";
            
            if (errorMessage.includes("User rejected") || 
                errorMessage.includes("User denied") ||
                errorMessage.includes("Transaction was rejected")) {
              errorMessage = "Transaction cancelled by user";
              isUserCancellation = true;
              statusIcon = "⚠️";
              statusPrefix = "Cancelled";
            } else if (errorMessage.includes("No function was found with function name")) {
              errorMessage = "Function not found in contract. Please check if the contract is properly deployed.";
            } else if (errorMessage.includes("Insufficient gas")) {
              errorMessage = "Not enough SUI for gas fees. Please ensure you have sufficient SUI in your wallet.";
            } else if (errorMessage.includes("Invalid admin capability")) {
              errorMessage = "You don't have admin rights for this club.";
            }
            
            setState({ 
              isSubmitting: false, 
              txStatus: `${statusIcon} ${statusPrefix}: ${errorMessage}` 
            });
          },
        }
      );
    } catch (err: any) {
      console.error("Transaction building failed:", err);
      
      let errorMessage = "Transaction setup failed";
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setState({ 
        isSubmitting: false, 
        txStatus: `❌ Setup Error: ${errorMessage}` 
      });
    }
  };

  const resetStatus = () => {
    setState(prev => ({ ...prev, txStatus: "" }));
  };

  return {
    isSubmitting: state.isSubmitting,
    txStatus: state.txStatus,
    createEvent,
    resetStatus,
    clubOwnerBadges: clubOwnerBadges,
    adminCaps: clubOwnerBadges, // For backward compatibility
  };
}
