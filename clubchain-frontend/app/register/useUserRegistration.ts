"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, USER_REGISTRY_ID, CLOCK_OBJECT_ID } from "@/lib/constants"; 
import type { RegistrationState, UserRegistrationData } from "./types";

export function useUserRegistration() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [state, setState] = useState<RegistrationState>({
    isRegistering: false,
    error: "",
    success: false,
  });

  const register = async (userData: UserRegistrationData) => {
    if (!account) {
      setState(prev => ({ ...prev, error: "Please connect wallet first" }));
      return;
    }

    setState({ isRegistering: true, error: "", success: false });

    try {
      const tx = new Transaction();

      // Call register_user on the member module
      tx.moveCall({
        target: `${PACKAGE_ID}::member::register_user`,
        arguments: [
          tx.object(USER_REGISTRY_ID),
          tx.pure.u64(userData.intraId),
          tx.pure.string(userData.username),
          tx.pure.string(userData.email),
          tx.object(CLOCK_OBJECT_ID),
        ],
      });

      // Set gas budget - higher for club owners who may have more objects in wallet
      tx.setGasBudget(10000000); // 10M MIST = 0.01 SUI

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Registration successful:", result);
            setState({ isRegistering: false, error: "", success: true });
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          },
          onError: (err) => {
            console.error("Registration error:", err);
            console.error("Error details:", JSON.stringify(err, null, 2));
            
            // Extract error message from various possible formats
            let errorMessage = "";
            if (typeof err === 'string') {
              errorMessage = err;
            } else if (err instanceof Error) {
              errorMessage = err.message;
            } else if (err && typeof err === 'object') {
              errorMessage = err.message || err.error || JSON.stringify(err);
            } else {
              errorMessage = String(err);
            }
            
            console.log("Parsed error message:", errorMessage);
            
            // Check for error codes from Move contract
            // Error code 1: intra_id already registered
            // Error code 2: wallet already registered
            const errorCode1 = /MoveAbort.*[,\s]1\)/i.test(errorMessage) || 
                              errorMessage.includes("code 1") ||
                              errorMessage.includes("}, 1)") ||
                              errorMessage.includes(", 1)");
            
            const errorCode2 = /MoveAbort.*[,\s]2\)/i.test(errorMessage) || 
                              errorMessage.includes("code 2") ||
                              errorMessage.includes("}, 2)") ||
                              errorMessage.includes(", 2)");
            
            const isAlreadyRegistered = errorCode1 || errorCode2 || 
                                       errorMessage.toLowerCase().includes("already registered");
            
            if (isAlreadyRegistered) {
              // User is already registered, redirect to dashboard
              console.log("User is already registered, redirecting to dashboard...");
              setState({ isRegistering: false, error: "", success: true });
              setTimeout(() => {
                router.push("/dashboard");
              }, 1000);
            } else {
              // Show detailed error message
              let userFriendlyError = errorMessage;
              
              // Provide more specific error messages
              if (errorMessage.includes("insufficient gas") || errorMessage.includes("gas")) {
                userFriendlyError = "Insufficient gas. Please ensure you have enough SUI tokens in your wallet.";
              } else if (errorMessage.includes("object") && errorMessage.includes("not found")) {
                userFriendlyError = "Transaction failed: Required object not found. Please try again.";
              } else if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
                userFriendlyError = "Permission denied. Please check your wallet connection.";
              } else if (errorMessage.length > 200) {
                // Truncate very long error messages
                userFriendlyError = errorMessage.substring(0, 200) + "...";
              }
              
              setState({
                isRegistering: false,
                error: userFriendlyError,
                success: false,
              });
            }
          },
        }
      );
    } catch (err) {
      console.error("Transaction error:", err);
      setState({
        isRegistering: false,
        error: String(err),
        success: false,
      });
    }
  };

  return {
    ...state,
    register,
    isConfigured: true, // Artık ID'miz var, her zaman true dönebiliriz
  };
}

