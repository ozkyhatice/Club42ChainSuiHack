import { Transaction } from "@mysten/sui/transactions";

/**
 * Event Contract SDK
 * Transaction builders for event-related operations
 */

export interface EventData {
  clubId: string;
  title: string;
  description: string;
  date: Date;
}

/**
 * Build a transaction to create a new event (requires valid ClubOwnerBadge)
 * Requires a ClubOwnerBadge that must be valid (not expired)
 * 
 * Smart contract signature:
 * create_event(badge: &ClubOwnerBadge, club: &Club, title: String, start_time: u64, end_time: u64, blob_id: String, description: String, clock: &Clock, ctx: &mut TxContext)
 */
export function buildCreateEventTx(
  packageId: string,
  ownerBadgeId: string,
  clubId: string,
  eventData: EventData,
  encryptedContentBlobId: string = "",
  clockObjectId: string = "0x6" // Standard Sui Clock object ID
): Transaction {
  if (!packageId || !ownerBadgeId || !clubId) {
    throw new Error("Package ID, Owner Badge ID, and Club ID are required");
  }

  if (!eventData.title || !eventData.description || !eventData.date) {
    throw new Error("Complete event data is required");
  }

  const tx = new Transaction();

  // Convert date to milliseconds for start_time
  const startTimeMs = eventData.date.getTime();
  // End time is 2 hours after start (default)
  const endTimeMs = startTimeMs + (2 * 60 * 60 * 1000);

  if (isNaN(startTimeMs)) {
    throw new Error("Invalid date value");
  }

  tx.moveCall({
    target: `${packageId}::club_system::create_event`,
    arguments: [
      tx.object(ownerBadgeId),              // badge: &ClubOwnerBadge
      tx.object(clubId),                     // club: &Club
      tx.pure.string(eventData.title),       // title: String
      tx.pure.u64(startTimeMs),             // start_time: u64
      tx.pure.u64(endTimeMs),               // end_time: u64
      tx.pure.string(encryptedContentBlobId), // blob_id: String
      tx.pure.string(eventData.description), // description: String
      tx.object(clockObjectId),              // clock: &Clock
    ],
  });

  return tx;
}

// Note: create_event_as_admin function is not available in the new contract

/**
 * Build a transaction to join an event
 * Requires MemberBadge to join
 * 
 * Smart contract signature:
 * join_event(_: &MemberBadge, event: &Event, ctx: &mut TxContext)
 */
export function buildJoinEventTx(
  packageId: string,
  memberBadgeId: string,
  eventId: string
): Transaction {
  if (!packageId) {
    throw new Error("Package ID is required");
  }

  if (!memberBadgeId || memberBadgeId.trim() === "") {
    throw new Error("Member Badge ID is required");
  }

  if (!eventId || eventId.trim() === "") {
    throw new Error("Event ID is required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::club_system::join_event`,
    arguments: [
      tx.object(memberBadgeId), // MemberBadge
      tx.object(eventId),        // Event
    ],
  });

  return tx;
}

// Note: leave_event function is not available in the new contract
