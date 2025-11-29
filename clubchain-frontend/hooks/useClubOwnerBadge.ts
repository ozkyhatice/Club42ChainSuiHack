"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID, CLOCK_OBJECT_ID } from "@/lib/constants";

/**
 * Hook to check if current user has a valid ClubOwnerBadge for a specific club
 * Valid means: badge exists, matches the club, and is not expired
 */
export function useHasValidClubOwnerBadge(clubId: string | undefined) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["club-owner-badge", clubId, account?.address],
    queryFn: async () => {
      if (!clubId || !account?.address || !PACKAGE_ID) return false;

      try {
        // Check if user owns ClubOwnerBadge
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::club::ClubOwnerBadge`,
          },
          options: {
            showContent: true,
          },
        });

        if (objects.data.length === 0) return false;

        // Check if any badge is valid (not expired) and matches the club
        const currentTime = Date.now();
        
        for (const obj of objects.data) {
          const content = obj.data?.content;
          if (content && "fields" in content) {
            const fields = content.fields as any;
            const badgeClubId = fields.club_id;
            const expirationMs = fields.expiration_ms;
            
            // Check if badge matches club and is not expired
            if (badgeClubId === clubId && Number(expirationMs) > currentTime) {
              return true;
            }
          }
        }

        return false;
      } catch (error) {
        console.error("Error checking club owner badge:", error);
        return false;
      }
    },
    enabled: !!clubId && !!account?.address && !!PACKAGE_ID,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to check if current user has ANY valid ClubOwnerBadge
 * Useful for checking if user can create events at all
 */
export function useHasAnyValidClubOwnerBadge() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["any-club-owner-badge", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return false;

      try {
        // Check if user owns any ClubOwnerBadge
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::club::ClubOwnerBadge`,
          },
          options: {
            showContent: true,
          },
        });

        if (objects.data.length === 0) return false;

        // Check if any badge is valid (not expired)
        const currentTime = Date.now();
        
        for (const obj of objects.data) {
          const content = obj.data?.content;
          if (content && "fields" in content) {
            const fields = content.fields as any;
            const expirationMs = fields.expiration_ms;
            
            // Check if badge is not expired
            if (Number(expirationMs) > currentTime) {
              return true;
            }
          }
        }

        return false;
      } catch (error) {
        console.error("Error checking club owner badge:", error);
        return false;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get all valid ClubOwnerBadges for current user
 * Returns array of badge objects with club_id and expiration
 */
export function useUserClubOwnerBadges() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["user-club-owner-badges", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return [];

      try {
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::club::ClubOwnerBadge`,
          },
          options: {
            showContent: true,
          },
        });

        const currentTime = Date.now();
        const validBadges: Array<{
          objectId: string;
          clubId: string;
          expirationMs: number;
        }> = [];

        for (const obj of objects.data) {
          const content = obj.data?.content;
          if (content && "fields" in content) {
            const fields = content.fields as any;
            const expirationMs = Number(fields.expiration_ms);
            
            // Only include non-expired badges
            if (expirationMs > currentTime) {
              validBadges.push({
                objectId: obj.data?.objectId || "",
                clubId: fields.club_id,
                expirationMs,
              });
            }
          }
        }

        return validBadges;
      } catch (error) {
        console.error("Error getting club owner badges:", error);
        return [];
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 30000,
  });
}


