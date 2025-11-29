import { SuiClient } from "@mysten/sui/client";
import { PACKAGE_ID } from "@/lib/constants";

/**
 * Admin Capability Contract SDK
 * Helpers for checking and interacting with ClubAdminCap objects
 */

export interface ClubAdminCap {
  id: string;
  club_id: string;
}

/**
 * Check if a user owns an admin capability for a specific club
 */
export async function hasAdminCapForClub(
  client: SuiClient,
  userAddress: string,
  clubId: string
): Promise<boolean> {
  const caps = await getUserAdminCaps(client, userAddress);
  return caps.some((cap) => cap.club_id === clubId);
}

/**
 * Get all admin capabilities owned by a user
 */
export async function getUserAdminCaps(
  client: SuiClient,
  userAddress: string
): Promise<ClubAdminCap[]> {
  try {
    if (!PACKAGE_ID) {
      return [];
    }

    const objects = await client.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${PACKAGE_ID}::club_system::ClubAdminCap`,
      },
      options: {
        showContent: true,
      },
    });

    return objects.data
      .filter((obj) => obj.data?.content?.dataType === "moveObject")
      .map((obj) => {
        const content = obj.data!.content as any;
        return {
          id: obj.data!.objectId,
          club_id: content.fields.club_id,
        };
      });
  } catch (error) {
    console.error("Error fetching admin caps:", error);
    return [];
  }
}

/**
 * Find the admin cap for a specific club owned by a user
 */
export async function getAdminCapForClub(
  client: SuiClient,
  userAddress: string,
  clubId: string
): Promise<string | null> {
  const caps = await getUserAdminCaps(client, userAddress);
  const cap = caps.find((c) => c.club_id === clubId);
  return cap ? cap.id : null;
}

