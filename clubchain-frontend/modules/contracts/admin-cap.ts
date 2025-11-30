import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
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
 * Build a transaction to issue a ClubOwnerBadge (Super Admin only)
 * 
 * Function signature: issue_owner_badge(_: &SuperAdminCap, club: &Club, recipient: address, days_valid: u64, clock: &Clock, ctx: &mut TxContext)
 */
export function buildIssueOwnerBadgeTx(
  packageId: string,
  superAdminCapId: string,
  clubId: string,
  recipientAddress: string,
  daysValid: number,
  clockObjectId: string = "0x6"
): Transaction {
  if (!packageId || !superAdminCapId || !clubId || !recipientAddress) {
    throw new Error("Package ID, SuperAdminCap ID, Club ID, and recipient address are required");
  }

  if (daysValid <= 0) {
    throw new Error("Days valid must be greater than 0");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club_system::issue_owner_badge`,
    arguments: [
      tx.object(superAdminCapId), // _: &SuperAdminCap
      tx.object(clubId), // club: &Club
      tx.pure.address(recipientAddress), // recipient: address
      tx.pure.u64(daysValid), // days_valid: u64
      tx.object(clockObjectId), // clock: &Clock
    ],
  });

  tx.setGasBudget(100_000_000); // 100 MIST

  return tx;
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

