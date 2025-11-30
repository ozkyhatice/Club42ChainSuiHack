"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID } from "@/lib/constants";

export interface ParticipationBadge {
  objectId: string;
  eventId: string;
  eventTitle: string;
  imageBlobId: string;
}

/**
 * Hook to get all ParticipationBadges owned by the current user
 */
export function useParticipationBadges() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["participation-badges", account?.address],
    queryFn: async (): Promise<ParticipationBadge[]> => {
      if (!account?.address || !PACKAGE_ID) return [];

      try {
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::club_system::ParticipationBadge`,
          },
          options: {
            showContent: true,
          },
        });

        const badges: ParticipationBadge[] = [];

        for (const obj of objects.data) {
          const content = obj.data?.content;
          if (content && "fields" in content) {
            const fields = content.fields as any;
            badges.push({
              objectId: obj.data!.objectId,
              eventId: fields.event_id || "",
              eventTitle: fields.event_title || "",
              imageBlobId: fields.image_blob_id || "",
            });
          }
        }

        return badges;
      } catch (error) {
        console.error("Error getting participation badges:", error);
        return [];
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 30000, // 30 seconds
  });
}

