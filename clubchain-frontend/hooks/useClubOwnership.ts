"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { getUserAdminCaps, hasAdminCapForClub } from "@/modules/contracts/admin-cap";
import { getClubs, isClubOwner } from "@/src/services/blockchain/getClubs";

/**
 * Hook to check if current user owns a specific club
 */
export function useIsClubOwner(clubId: string | undefined) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  return useQuery({
    queryKey: ["club-ownership", clubId, account?.address],
    queryFn: async () => {
      if (!clubId || !account?.address) return false;
      
      // Check both via admin cap and club owner field
      const hasAdminCap = await hasAdminCapForClub(
        suiClient,
        account.address,
        clubId
      );
      
      if (hasAdminCap) return true;
      
      // Fallback: check club.owner field
      return await isClubOwner(clubId, account.address);
    },
    enabled: !!clubId && !!account?.address,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get all admin capabilities for current user
 */
export function useUserAdminCaps() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  return useQuery({
    queryKey: ["user-admin-caps", account?.address],
    queryFn: async () => {
      if (!account?.address) return [];
      return await getUserAdminCaps(suiClient, account.address);
    },
    enabled: !!account?.address,
    staleTime: 30000,
  });
}

/**
 * Hook to get all clubs where current user is owner
 */
export function useUserOwnedClubs() {
  const account = useCurrentAccount();
  const { data: adminCaps } = useUserAdminCaps();
  
  return useQuery({
    queryKey: ["user-owned-clubs", account?.address, adminCaps],
    queryFn: async () => {
      if (!account?.address) return [];
      
      const allClubs = await getClubs();
      const ownedClubIds = new Set(adminCaps?.map(cap => cap.club_id) || []);
      
      return allClubs.filter(club => 
        ownedClubIds.has(club.id) || 
        club.owner.toLowerCase() === account.address.toLowerCase()
      );
    },
    enabled: !!account?.address && !!adminCaps,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to check if user has admin cap for a specific club
 */
export function useHasAdminCap(clubId: string | undefined) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  return useQuery({
    queryKey: ["has-admin-cap", clubId, account?.address],
    queryFn: async () => {
      if (!clubId || !account?.address) return false;
      return await hasAdminCapForClub(suiClient, account.address, clubId);
    },
    enabled: !!clubId && !!account?.address,
    staleTime: 30000,
  });
}

/**
 * Hook to check if user is owner of any club
 */
export function useIsAnyClubOwner() {
  const { data: ownedClubs, isLoading } = useUserOwnedClubs();
  
  return {
    isOwner: (ownedClubs?.length || 0) > 0,
    clubCount: ownedClubs?.length || 0,
    isLoading,
  };
}


