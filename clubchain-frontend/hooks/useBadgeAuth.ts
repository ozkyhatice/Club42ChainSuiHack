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
  
  // Check SuperAdmin status - don't use default false, let it be undefined until loaded
  const { data: isSuperAdmin, isLoading: superAdminLoading, isError: superAdminError } = useIsSuperAdmin();
  
  // Check ClubOwner badges
  // useUserClubOwnerBadges already filters out expired badges
  const { data: clubOwnerBadges = [], isLoading: badgesLoading } = useUserClubOwnerBadges();
  
  // Check Member status (UserProfile)
  const { data: isMember = false, isLoading: memberLoading } = useIsRegistered();
  
  // Extract club IDs from valid badges (useUserClubOwnerBadges already validates expiration)
  const ownedClubIds = clubOwnerBadges.map(badge => badge.clubId);
  
  const isLoading = superAdminLoading || badgesLoading || memberLoading;
  
  // Only return definitive values when loading is complete
  const finalIsSuperAdmin = superAdminLoading ? false : (isSuperAdmin ?? false);
  const finalIsClubOwner = badgesLoading ? false : (clubOwnerBadges.length > 0);
  
  // Debug logging
  if (account) {
    console.log("useBadgeAuth state:", {
      account: account.address,
      isSuperAdmin,
      finalIsSuperAdmin,
      superAdminLoading,
      superAdminError,
      clubOwnerBadgesCount: clubOwnerBadges.length,
      clubOwnerBadges,
      ownedClubIds,
      isClubOwner: finalIsClubOwner,
      isMember,
      isLoading,
      badgesLoading,
      memberLoading,
    });
  }
  
  return {
    isSuperAdmin: finalIsSuperAdmin,
    isClubOwner: finalIsClubOwner,
    ownedClubIds: [...new Set(ownedClubIds)], // Remove duplicates
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
 * Hook to check if user can create events (has valid ClubOwnerBadge OR is SuperAdmin)
 * Returns false while loading to prevent premature access, true when user has permission
 */
export function useCanCreateEvent(): boolean {
  const { isSuperAdmin, isClubOwner, isLoading } = useBadgeAuth();
  // While loading, return false to be safe (will update once loaded)
  if (isLoading) return false;
  return isSuperAdmin || isClubOwner;
}

/**
 * Hook to check if user can join events (Member with UserProfile)
 */
export function useCanJoinEvent(): boolean {
  const { isMember } = useBadgeAuth();
  return isMember;
}

