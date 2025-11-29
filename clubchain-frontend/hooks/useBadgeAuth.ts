"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID, CLOCK_OBJECT_ID } from "@/lib/constants";
import { useIsSuperAdmin } from "./useSuperAdmin";
import { useUserClubOwnerBadges } from "./useClubOwnerBadge";
import { useIsRegistered } from "./useRegistrationStatus";

/**
 * Unified Badge-Based Authentication Hook
 * 
 * Returns comprehensive permission state based on owned badges:
 * - SuperAdmin: Has SuperAdminCap
 * - ClubOwner: Has valid (non-expired) ClubOwnerBadge
 * - Member: Has UserProfile (verified student via 42 Intra)
 * - Guest: No wallet or no badges
 */
export interface BadgeAuthState {
  isSuperAdmin: boolean;
  isClubOwner: boolean;
  ownedClubIds: string[]; // List of club IDs this user owns (via valid badges)
  isMember: boolean; // Based on UserProfile existence
  isLoading: boolean;
}

export function useBadgeAuth(): BadgeAuthState {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  // Check SuperAdmin status
  const { data: isSuperAdmin = false, isLoading: superAdminLoading } = useIsSuperAdmin();
  
  // Check ClubOwner badges
  const { data: clubOwnerBadges = [], isLoading: badgesLoading } = useUserClubOwnerBadges();
  
  // Check Member status (UserProfile)
  const { data: isMember = false, isLoading: memberLoading } = useIsRegistered();
  
  // Validate badges against clock (on-chain check)
  const { data: validatedClubIds = [], isLoading: validationLoading } = useQuery({
    queryKey: ["validated-club-ids", clubOwnerBadges, CLOCK_OBJECT_ID],
    queryFn: async () => {
      if (!CLOCK_OBJECT_ID || clubOwnerBadges.length === 0) return [];
      
      const validClubIds: string[] = [];
      const currentTime = Date.now();
      
      // Filter badges that are not expired (client-side check first)
      const nonExpiredBadges = clubOwnerBadges.filter(
        (badge) => badge.expirationMs > currentTime
      );
      
      // For each non-expired badge, verify on-chain if possible
      // Note: We do client-side validation first for performance
      // On-chain validation would require devInspect which is expensive
      for (const badge of nonExpiredBadges) {
        // Client-side validation: check expiration
        if (badge.expirationMs > currentTime) {
          validClubIds.push(badge.clubId);
        }
      }
      
      return [...new Set(validClubIds)]; // Remove duplicates
    },
    enabled: clubOwnerBadges.length > 0 && !!CLOCK_OBJECT_ID,
    staleTime: 10000, // 10 seconds
  });
  
  const isLoading = superAdminLoading || badgesLoading || memberLoading || validationLoading;
  
  return {
    isSuperAdmin,
    isClubOwner: validatedClubIds.length > 0,
    ownedClubIds: validatedClubIds,
    isMember,
    isLoading,
  };
}

/**
 * Hook to check if user can create clubs (SuperAdmin only)
 */
export function useCanCreateClub(): boolean {
  const { isSuperAdmin } = useBadgeAuth();
  return isSuperAdmin;
}

/**
 * Hook to check if user can create events (has valid ClubOwnerBadge)
 */
export function useCanCreateEvent(): boolean {
  const { isClubOwner } = useBadgeAuth();
  return isClubOwner;
}

/**
 * Hook to check if user can join events (Member with UserProfile)
 */
export function useCanJoinEvent(): boolean {
  const { isMember } = useBadgeAuth();
  return isMember;
}

