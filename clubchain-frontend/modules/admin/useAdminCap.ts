"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import {
  getUserAdminCaps,
  hasAdminCapForClub,
  getAdminCapForClub,
  type ClubAdminCap,
} from "@/modules/contracts/admin-cap";

/**
 * Hook to get all admin capabilities owned by the current user
 */
export function useAdminCaps() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [caps, setCaps] = useState<ClubAdminCap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCaps() {
      if (!account?.address) {
        setCaps([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userCaps = await getUserAdminCaps(client, account.address);
        setCaps(userCaps);
      } catch (err) {
        setError("Failed to fetch admin capabilities");
        setCaps([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCaps();
  }, [account?.address, client]);

  return { caps, loading, error };
}

/**
 * Hook to check if the current user is an admin for a specific club
 */
export function useIsClubAdmin(clubId: string | null | undefined) {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminCapId, setAdminCapId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      if (!account?.address || !clubId) {
        setIsAdmin(false);
        setAdminCapId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const hasAdmin = await hasAdminCapForClub(
          client,
          account.address,
          clubId
        );
        setIsAdmin(hasAdmin);

        if (hasAdmin) {
          const capId = await getAdminCapForClub(
            client,
            account.address,
            clubId
          );
          setAdminCapId(capId);
        } else {
          setAdminCapId(null);
        }
      } catch (err) {
        setIsAdmin(false);
        setAdminCapId(null);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [account?.address, clubId, client]);

  return { isAdmin, loading, adminCapId };
}

/**
 * Hook to get the admin cap ID for a specific club
 */
export function useAdminCapForClub(clubId: string | null | undefined) {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [capId, setCapId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCapId() {
      if (!account?.address || !clubId) {
        setCapId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const id = await getAdminCapForClub(client, account.address, clubId);
        setCapId(id);
      } catch (err) {
        setError("Failed to fetch admin capability");
        setCapId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCapId();
  }, [account?.address, clubId, client]);

  return { capId, loading, error };
}

