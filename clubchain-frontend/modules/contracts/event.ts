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
 * Build a transaction to create a new event (admin only)
 * Requires a ClubAdminCap for the specified club
 * 
 * Smart contract signature:
 * create_event(cap: &ClubAdminCap, club: &mut Club, title: String, description: String, date: u64, ctx: &mut TxContext)
 */
export function buildCreateEventTx(
  packageId: string,
  adminCapId: string,
  clubId: string,
  eventData: EventData
): Transaction {
  if (!packageId || !adminCapId || !clubId) {
    throw new Error("Package ID, Admin Cap ID, and Club ID are required");
  }

  if (!eventData.title || !eventData.description || !eventData.date) {
    throw new Error("Complete event data is required");
  }

  const tx = new Transaction();

  // Convert date to milliseconds
  const dateMs = eventData.date.getTime();

  if (isNaN(dateMs)) {
    throw new Error("Invalid date value");
  }

  tx.moveCall({
    target: `${packageId}::event::create_event`,
    arguments: [
      tx.object(adminCapId),        // cap: &ClubAdminCap
      tx.object(clubId),             // club: &mut Club
      tx.pure.string(eventData.title),      // title: String
      tx.pure.string(eventData.description), // description: String
      tx.pure.u64(dateMs),           // date: u64
    ],
  });

  return tx;
}

/**
 * Build a transaction to join an event
 * Any user can join an event
 */
export function buildJoinEventTx(
  packageId: string,
  eventId: string
): Transaction {
  if (!packageId) {
    throw new Error("Package ID is required");
  }

  if (!eventId || eventId.trim() === "") {
    throw new Error("Event ID is required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::event::join_event`,
    arguments: [tx.object(eventId)],
  });

  return tx;
}

/**
 * Build a transaction to leave an event
 * User must be a participant to leave
 */
export function buildLeaveEventTx(
  packageId: string,
  eventId: string
): Transaction {
  if (!packageId) {
    throw new Error("Package ID is required");
  }

  if (!eventId || eventId.trim() === "") {
    throw new Error("Event ID is required");
  }

  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::event::leave_event`,
    arguments: [tx.object(eventId)],
  });

  return tx;
}
