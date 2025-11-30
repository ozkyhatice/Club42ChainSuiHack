"use client";

import { useState, useEffect } from "react";

export interface ZkLoginSession {
  address: string;
  jwt: string;
  salt: string;
  ephemeralKeyPair: any;
  maxEpoch: number;
  jwtRandomness: string;
  zkProof: any;
  provider: string;
}

export function useZkLoginSession() {
  const [session, setSession] = useState<ZkLoginSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zkLoginSession");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSession(parsed);
      }
    } catch (error) {
      console.error("Error reading zkLogin session:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSession = () => {
    localStorage.removeItem("zkLoginSession");
    setSession(null);
  };

  return {
    session,
    isAuthenticated: !!session,
    address: session?.address || null,
    isLoading,
    clearSession,
  };
}


