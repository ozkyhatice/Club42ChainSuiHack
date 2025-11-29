/**
 * Admin Guard Utilities
 * Functions to help gate UI elements and actions based on admin status
 */

import type { ClubAdminCap } from "@/modules/contracts/admin-cap";

/**
 * Check if a user has admin capability for a specific club
 */
export function canManageClub(
  caps: ClubAdminCap[],
  clubId: string
): boolean {
  return caps.some((cap) => cap.club_id === clubId);
}

/**
 * Get all club IDs that the user is an admin of
 */
export function getAdminClubIds(caps: ClubAdminCap[]): string[] {
  return caps.map((cap) => cap.club_id);
}

/**
 * Check if a user is an admin of at least one club
 */
export function isAdminOfAnyClub(caps: ClubAdminCap[]): boolean {
  return caps.length > 0;
}

/**
 * Find the admin cap ID for a specific club
 */
export function findAdminCapId(
  caps: ClubAdminCap[],
  clubId: string
): string | null {
  const cap = caps.find((c) => c.club_id === clubId);
  return cap ? cap.id : null;
}

