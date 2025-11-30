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
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::club_system::MemberBadge`,
          },
          options: {
            showContent: true,
          },
        });

        return objects.data.length > 0;
      } catch (error) {
        console.error("Error checking member badge:", error);
        return false;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 30000, // 30 seconds
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
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::club_system::MemberBadge`,
          },
          options: {
            showContent: true,
          },
        });

        if (objects.data.length === 0) return null;

        const obj = objects.data[0];
        const content = obj.data?.content;
        if (content && "fields" in content) {
          const fields = content.fields as any;
          return {
            objectId: obj.data!.objectId,
            intraId: fields.intra_id || "",
            username: fields.username || "",
          };
        }

        return null;
      } catch (error) {
        console.error("Error getting member badge:", error);
        return null;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 30000, // 30 seconds
  });
}

