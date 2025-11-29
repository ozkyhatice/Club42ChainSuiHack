"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildRegisterUserTx } from "@/modules/contracts/member";
import { PACKAGE_ID, CLOCK_OBJECT_ID, REGISTRY_OBJECT_ID } from "@/lib/constants";
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
      if (!PACKAGE_ID || !CLOCK_OBJECT_ID || !REGISTRY_OBJECT_ID) {
        console.error("Configuration error:", { 
          PACKAGE_ID, 
          CLOCK_OBJECT_ID, 
          REGISTRY_OBJECT_ID 
        });
        setState({
          isRegistering: false,
          error: "Configuration error: Required IDs not set",
          success: false,
        });
        return;
      }

      console.log("Building registration transaction with:", {
        PACKAGE_ID,
        CLOCK_OBJECT_ID,
        REGISTRY_OBJECT_ID,
        userData,
      });

      const tx = buildRegisterUserTx(
        PACKAGE_ID,
        CLOCK_OBJECT_ID,
        REGISTRY_OBJECT_ID,
        userData
      );

      console.log("Transaction block created, signing...");
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Registration successful:", result);
            console.log("You received both a UserProfile and a ClubMemberSBT!");
            setState({ isRegistering: false, error: "", success: true });
            setTimeout(() => {
              router.push("/");
            }, 2000);
          },
          onError: (err) => {
            console.error("Registration error:", err);
            setState({
              isRegistering: false,
              error: err.message,
              success: false,
            });
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
  };
}

