"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
// zkLogin utilities - using Sui SDK
import { 
  genAddressSeed, 
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/sui/zklogin";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { PACKAGE_ID, MEMBER_REGISTRY_ID } from "@/lib/constants";

// Note: Using Sui SDK's built-in zkLogin functions instead of external services
// For production, you may want to use your own salt/prover services
const PROVER_URL = process.env.NEXT_PUBLIC_ZK_PROVER_URL || "https://prover.sui.io/v1";
const SALT_SERVICE_URL = process.env.NEXT_PUBLIC_SALT_SERVICE_URL || "https://salt.sui.io";

export interface ZkLoginProvider {
  name: string;
  clientId: string;
  url: string;
  icon?: string;
}

export const ZK_LOGIN_PROVIDERS: ZkLoginProvider[] = [
  {
    name: "Google",
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    url: "https://accounts.google.com",
  },
  {
    name: "Facebook",
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || "",
    url: "https://www.facebook.com",
  },
  {
    name: "Apple",
    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
    url: "https://appleid.apple.com",
  },
  {
    name: "Twitch",
    clientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "",
    url: "https://id.twitch.tv",
  },
];

export function useZkLogin() {
  const router = useRouter();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSalt = useCallback(async (jwt: string): Promise<string> => {
    try {
      // Try to get salt from service first
      if (SALT_SERVICE_URL && SALT_SERVICE_URL !== "https://salt.sui.io") {
        const response = await fetch(`${SALT_SERVICE_URL}/get-salt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jwt }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.salt;
        }
      }
    } catch (err) {
      console.warn("Salt service unavailable, generating client-side salt:", err);
    }

    // Fallback: Generate a deterministic salt from JWT (unique per user)
    // This ensures the same user always gets the same address
    // In production, you should use a proper salt service
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      const sub = payload.sub || "";
      
      // Create a deterministic salt from JWT sub (user ID)
      // This ensures same user = same address across sessions
      const encoder = new TextEncoder();
      const data = encoder.encode(sub + "sui-zklogin-salt");
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      
      // Convert to BigInt string (first 16 chars as hex)
      return BigInt("0x" + hashHex.substring(0, 16)).toString();
    } catch (err) {
      console.error("Error generating salt:", err);
      // Last resort: random salt (will create different address each time)
      return Math.random().toString(36).substring(2, 15);
    }
  }, []);

  const getZkProof = useCallback(async (
    jwt: string,
    ephemeralKeyPair: Ed25519Keypair,
    maxEpoch: number,
    jwtRandomness: string,
    salt: string
  ) => {
    try {
      // Try to get proof from service first
      if (PROVER_URL && PROVER_URL !== "https://prover.sui.io/v1") {
        const response = await fetch(`${PROVER_URL}/zklogin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jwt,
            ephemeralPublicKey: ephemeralKeyPair.getPublicKey().toBase64(),
            maxEpoch,
            jwtRandomness,
            salt,
            keyClaimName: "sub",
          }),
        });

        if (response.ok) {
          return await response.json();
        }
      }
    } catch (err) {
      console.warn("Prover service unavailable:", err);
    }

    // ZK proof service is required for zkLogin to work
    // You need to either:
    // 1. Set up your own prover service and set NEXT_PUBLIC_ZK_PROVER_URL
    // 2. Use Sui's official prover service (if available)
    throw new Error(
      "ZK Prover service is not available. " +
      "Please set up a prover service or configure NEXT_PUBLIC_ZK_PROVER_URL. " +
      "For development, you may need to run your own prover service."
    );
  }, []);

  const loginWithZkLogin = useCallback(async (
    provider: ZkLoginProvider,
    jwt: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get salt
      const salt = await getSalt(jwt);

      // Step 2: Generate ephemeral key pair
      const ephemeralKeyPair = new Ed25519Keypair();
      const maxEpoch = 2; // 2 epochs from now
      const jwtRandomness = Math.random().toString(36).substring(2, 15);

      // Step 3: Get ZK proof (optional for basic login, required for transactions)
      let zkProof = null;
      let proverError = null;
      try {
        zkProof = await getZkProof(
          jwt,
          ephemeralKeyPair,
          maxEpoch,
          jwtRandomness,
          salt
        );
      } catch (err) {
        console.warn("ZK Prover service unavailable. Login will work but transactions may fail:", err);
        proverError = err instanceof Error ? err.message : "Prover service unavailable";
        // Continue without proof - user can still login but transactions won't work
      }

      // Step 4: Derive address
      const address = jwtToAddress(jwt, BigInt(salt));

      // Step 5: Store zkLogin session data
      // Serialize ephemeral keypair to secret key array for storage
      // Sui SDK's Ed25519Keypair stores secret key internally
      // We need to extract it for storage and later reconstruction
      let secretKeyArray: number[];
      try {
        // Try to access secretKey property (most common in Sui SDK)
        const keypair = ephemeralKeyPair as any;
        if (keypair.secretKey) {
          secretKeyArray = Array.from(keypair.secretKey);
        } 
        // Try getSecretKey() method if available
        else if (typeof keypair.getSecretKey === 'function') {
          const secretKey = keypair.getSecretKey();
          secretKeyArray = Array.from(secretKey);
        }
        // Try toSecretKey() method if available
        else if (typeof keypair.toSecretKey === 'function') {
          const secretKey = keypair.toSecretKey();
          secretKeyArray = Array.from(secretKey);
        }
        else {
          // If we can't serialize, we'll need to regenerate it later
          // For now, store a placeholder (transactions won't work but login will)
          console.warn("Could not serialize ephemeral keypair - transactions may not work");
          secretKeyArray = [];
        }
      } catch (err) {
        console.error("Error serializing ephemeral keypair:", err);
        secretKeyArray = [];
      }
      
      const sessionData = {
        address,
        jwt,
        salt,
        ephemeralKeyPair: secretKeyArray, // Store as array for JSON serialization
        maxEpoch,
        jwtRandomness,
        zkProof,
        provider: provider.name,
        proverError, // Store error if prover failed
      };

      localStorage.setItem("zkLoginSession", JSON.stringify(sessionData));

      // Step 6: Show warning if prover service is unavailable
      if (proverError) {
        console.warn("⚠️ ZK Prover service unavailable. You are logged in but transactions may not work.");
        // Don't show alert - just log the warning
        // User can still use the app, just transactions won't work
      }

      // Step 7: Redirect to dashboard immediately (registration can happen in background)
      setIsLoading(false);
      router.push("/dashboard");

      // Step 8: Auto-register user in background (don't block redirect)
      // Only register if we have a valid zkProof
      if (zkProof && !proverError) {
        registerWithZkLogin(address, jwt, salt).catch(err => {
          console.warn("Auto-registration failed, continuing anyway:", err);
        });
      } else {
        console.warn("Skipping auto-registration: ZK proof not available");
      }
    } catch (err) {
      console.error("zkLogin error:", err);
      setError(err instanceof Error ? err.message : "Failed to login with zkLogin");
      setIsLoading(false);
    }
  }, [getSalt, getZkProof, router]);

  const registerWithZkLogin = useCallback(async (
    address: string,
    jwt: string,
    salt: string
  ) => {
    try {
      // Parse JWT to get user info
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      const sub = payload.sub || "";
      const username = payload.name || payload.email || sub.substring(0, 10);

      // Create transaction to register
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::club_system::register_member`,
        arguments: [
          tx.object(MEMBER_REGISTRY_ID),
          tx.pure.string(sub),
          tx.pure.string(username),
        ],
      });

      tx.setGasBudget(10000000);

      // Sign with zkLogin
      const sessionData = JSON.parse(localStorage.getItem("zkLoginSession") || "{}");
      if (!sessionData.zkProof || !sessionData.ephemeralKeyPair) {
        throw new Error("zkLogin session not found");
      }

      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
        new Uint8Array(Object.values(sessionData.ephemeralKeyPair))
      );

      const signature = await getZkLoginSignature({
        inputs: {
          ...sessionData.zkProof,
          addressSeed: genAddressSeed(BigInt(salt), "sub", sub, sessionData.aud || "").toString(),
        },
        maxEpoch: sessionData.maxEpoch,
        userSignature: await ephemeralKeyPair.signPersonalMessage(
          new TextEncoder().encode(JSON.stringify(tx))
        ),
      });

      // Execute transaction
      await new Promise((resolve, reject) => {
        signAndExecute(
          { 
            transaction: tx,
            account: {
              address,
              publicKey: ephemeralKeyPair.getPublicKey().toBase64(),
            },
            zkLoginSignature: signature,
          } as any,
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });
    } catch (err) {
      console.error("Registration error:", err);
      // Don't throw - registration is optional
    }
  }, [signAndExecute]);

  // Always return all providers, even if clientId is not set (for UI display)
  // The button will handle the case when clientId is missing
  return {
    loginWithZkLogin,
    isLoading,
    error,
    providers: ZK_LOGIN_PROVIDERS, // Show all providers, let button handle missing clientId
  };
}

