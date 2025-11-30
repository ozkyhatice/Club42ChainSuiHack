"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID } from "@/lib/constants";

export interface MemberBadge {
  objectId: string;
  intraId: string;
  username: string;
}

/**
 * Hook to check if current user has a MemberBadge
 */
export function useHasMemberBadge() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["member-badge", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return false;

      try {
        console.log("useHasMemberBadge: Checking for MemberBadge", {
          address: account.address,
          packageId: PACKAGE_ID,
        });

        // Use pagination to ensure we check all objects
        let cursor: string | null = null;
        let hasNextPage = true;
        let found = false;
        let totalChecked = 0;

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

          totalChecked += result.data.length;
          console.log("useHasMemberBadge: Query result", {
            address: account.address,
            cursor,
            hasNextPage: result.hasNextPage,
            dataLength: result.data.length,
            totalChecked,
            objectIds: result.data.map(obj => obj.data?.objectId),
          });

          if (result.data.length > 0) {
            found = true;
            console.log("useHasMemberBadge: Found MemberBadge!", {
              address: account.address,
              count: result.data.length,
              objectIds: result.data.map(obj => obj.data?.objectId),
            });
          }

          hasNextPage = result.hasNextPage;
          cursor = result.nextCursor || null;
        }

        console.log("useHasMemberBadge: Final result", {
          address: account.address,
          hasMemberBadge: found,
          totalChecked,
        });

        return found;
      } catch (error) {
        console.error("Error checking member badge:", error);
        return false;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 10000, // 10 seconds - reduced for faster updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/**
 * Hook to get the current user's MemberBadge
 */
export function useMemberBadge() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["member-badge-detail", account?.address],
    queryFn: async (): Promise<MemberBadge | null> => {
      if (!account?.address || !PACKAGE_ID) return null;

      try {
        // Use pagination to ensure we check all objects
        let cursor: string | null = null;
        let hasNextPage = true;
        let memberBadge: MemberBadge | null = null;

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
                username: fields.username || "",
              };
            }
          }

          hasNextPage = result.hasNextPage;
          cursor = result.nextCursor || null;
        }

        return memberBadge;
      } catch (error) {
        console.error("Error getting member badge:", error);
        return null;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 10000, // 10 seconds - reduced for faster updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

