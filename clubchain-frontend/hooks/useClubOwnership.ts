"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { getUserAdminCaps, hasAdminCapForClub } from "@/modules/contracts/admin-cap";
import { getClubs, isClubOwner } from "@/src/services/blockchain/getClubs";
import { useUserClubOwnerBadges } from "@/hooks/useClubOwnerBadge";
import { PACKAGE_ID } from "@/lib/constants";

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
 * Uses ClubOwnerBadge to determine ownership
 */
export function useUserOwnedClubs() {
  const account = useCurrentAccount();
  const { data: clubOwnerBadges = [] } = useUserClubOwnerBadges();
  
  return useQuery({
    queryKey: ["user-owned-clubs", account?.address, clubOwnerBadges],
    queryFn: async () => {
      if (!account?.address) return [];
      
      const allClubs = await getClubs();
      
      // Get club IDs from ClubOwnerBadges
      const ownedClubIds = new Set(
        clubOwnerBadges.map(badge => badge.clubId)
      );
      
      // Filter clubs where user has a valid ClubOwnerBadge
      const ownedClubs = allClubs.filter(club => 
        ownedClubIds.has(club.id)
      );
      
      console.log("useUserOwnedClubs:", {
        account: account.address,
        clubOwnerBadgesCount: clubOwnerBadges.length,
        allClubsCount: allClubs.length,
        ownedClubIds: Array.from(ownedClubIds),
        ownedClubsCount: ownedClubs.length,
      });
      
      return ownedClubs;
    },
    enabled: !!account?.address,
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

/**
 * Hook to get all clubs where current user is a member
 * A user is considered a member if:
 * 1. They have a MemberBadge (general membership - access to all clubs)
 * 2. They have participated in at least one event of that club
 */
export function useUserMemberClubs() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  return useQuery({
    queryKey: ["user-member-clubs", account?.address],
    queryFn: async () => {
      if (!account?.address) return [];
      
      try {
        // First check if user has MemberBadge (general membership)
        let hasMemberBadge = false;
        try {
          const memberBadgeResult = await suiClient.getOwnedObjects({
            owner: account.address,
            filter: {
              StructType: `${PACKAGE_ID}::club_system::MemberBadge`,
            },
            options: {
              showContent: true,
            },
            limit: 1,
          });
          hasMemberBadge = memberBadgeResult.data.length > 0;
        } catch (error) {
          console.error("Error checking MemberBadge:", error);
        }
        
        const allClubs = await getClubs();
        const userAddress = account.address.toLowerCase();
        
        // If user has MemberBadge, they are a member of all clubs (except owned ones)
        if (hasMemberBadge) {
          console.log("User has MemberBadge - showing all clubs as member clubs");
          // Return all clubs (they will be filtered to exclude owned clubs in the component)
          return allClubs;
        }
        
        // Otherwise, filter clubs where user has participated in at least one event
        const memberClubs = allClubs.filter(club => {
          // Check if user has participated in any event of this club
          const hasParticipated = club.events.some(event => {
            if (!event.participants || event.participants.length === 0) {
              return false;
            }
            return event.participants.some(participant => {
              // Participants should be strings (addresses)
              const participantAddress = typeof participant === "string" 
                ? participant 
                : String(participant || "");
              return participantAddress.toLowerCase() === userAddress;
            });
          });
          
          return hasParticipated;
        });
        
        return memberClubs;
      } catch (error) {
        console.error("Error fetching user member clubs:", error);
        // Return empty array on error to prevent UI crash
        return [];
      }
    },
    enabled: !!account?.address,
    staleTime: 30000, // 30 seconds - shorter cache for more real-time updates
    retry: 2, // Retry twice on failure
    retryDelay: 1000, // Wait 1 second between retries
  });
}


