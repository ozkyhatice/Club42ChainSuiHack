"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
// USER_REGISTRY_ID'yi import ediyoruz
import { PACKAGE_ID, USER_REGISTRY_ID } from "@/lib/constants"; 
import type { RegistrationState, UserRegistrationData } from "./types";

// Buradaki satırı siliyoruz veya constants'tan gelen ile değiştiriyoruz
const REGISTRY_OBJECT_ID = USER_REGISTRY_ID;

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

      // Call register_user on the member module (renamed from user_registry)
      tx.moveCall({
        target: `${PACKAGE_ID}::member::register_user`,
        arguments: [
          tx.object(REGISTRY_OBJECT_ID),
          tx.pure.u64(userData.intraId),
          tx.pure.string(userData.username),
          tx.pure.string(userData.email),
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Registration successful:", result);
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
    isConfigured: true, // Artık ID'miz var, her zaman true dönebiliriz
  };
}

