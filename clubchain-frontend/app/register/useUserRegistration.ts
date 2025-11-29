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
        setState({
          isRegistering: false,
          error: "Configuration error: Required IDs not set",
          success: false,
        });
        return;
      }

      const tx = buildRegisterUserTx(
        PACKAGE_ID,
        CLOCK_OBJECT_ID,
        REGISTRY_OBJECT_ID,
        userData
      );

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setState({ isRegistering: false, error: "", success: true });
            setTimeout(() => {
              router.push("/");
            }, 2000);
          },
          onError: (err) => {
            setState({
              isRegistering: false,
              error: err.message,
              success: false,
            });
          },
        }
      );
    } catch (err) {
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

