"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID } from "@/lib/constants";

/**
 * Hook to check if current user is registered on-chain
 * Checks if user owns a UserProfile object
 */
export function useIsRegistered() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["is-registered", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return false;

      try {
        // Check if user owns MemberBadge (using pagination)
        let cursor: string | null = null;
        let hasNextPage = true;
        let found = false;

        while (hasNextPage && !found) {
          const result = await suiClient.getOwnedObjects({
            owner: account.address,
            filter: {
              StructType: `${PACKAGE_ID}::club_system::MemberBadge`,
            },
            options: {
              showContent: true,
            },
            cursor: cursor || undefined,
            limit: 50,
          });

          if (result.data.length > 0) {
            found = true;
          }

          hasNextPage = result.hasNextPage;
          cursor = result.nextCursor || null;
        }

        return found;
      } catch (error) {
        console.error("Error checking registration status:", error);
        return false;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to get the UserProfile object for current user
 */
export function useUserProfile() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["user-profile", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return null;

      try {
        // Use pagination to find MemberBadge
        let cursor: string | null = null;
        let hasNextPage = true;
        let memberBadge: any = null;

        while (hasNextPage && !memberBadge) {
          const result = await suiClient.getOwnedObjects({
            owner: account.address,
            filter: {
              StructType: `${PACKAGE_ID}::club_system::MemberBadge`,
            },
            options: {
              showContent: true,
            },
            cursor: cursor || undefined,
            limit: 50,
          });

          if (result.data.length > 0) {
            const obj = result.data[0];
            const content = obj.data?.content;
            if (content && "fields" in content) {
              const fields = content.fields as any;
              memberBadge = {
                objectId: obj.data!.objectId,
                intraId: fields.intra_id || "",
                walletAddress: account.address,
                username: fields.username || "",
                email: "", // MemberBadge doesn't have email
                isRegistered: true,
              };
            }
          }

          hasNextPage = result.hasNextPage;
          cursor = result.nextCursor || null;
        }
        
        return memberBadge;
      } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 60000,
  });
}

