import { Transaction } from "@mysten/sui/transactions";

/**
 * Event Contract SDK
 * Transaction builders for event-related operations
 */

export interface EventData {
  clubId: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Build a transaction to create a new event (admin only)
 * Requires a ClubAdminCap for the specified club
 */
export function buildCreateEventTx(
  packageId: string,
  clockObjectId: string,
  adminCapId: string,
  eventData: EventData
): Transaction {
  if (!packageId || !clockObjectId || !adminCapId) {
    console.error("buildCreateEventTx: missing required parameters", {
      packageId,
      clockObjectId,
      adminCapId,
    });
    throw new Error("Package ID, Clock ID, and Admin Cap ID are required");
  }

  if (!eventData.clubId || !eventData.title || !eventData.startTime || !eventData.endTime) {
    console.error("buildCreateEventTx: incomplete event data", eventData);
    throw new Error("Complete event data is required");
  }

  const tx = new Transaction();

  // Convert dates to milliseconds
  const startTimeMs = eventData.startTime.getTime();
  const endTimeMs = eventData.endTime.getTime();

  if (isNaN(startTimeMs) || isNaN(endTimeMs)) {
    console.error("buildCreateEventTx: invalid dates", {
      startTime: eventData.startTime,
      endTime: eventData.endTime,
    });
    throw new Error("Invalid date values");
  }

  tx.moveCall({
    target: `${packageId}::event::create_event`,
    arguments: [
      tx.object(adminCapId),
      tx.pure.address(eventData.clubId),
      tx.pure.string(eventData.title),
      tx.pure.string(eventData.description),
      tx.pure.string(eventData.location),
      tx.pure.u64(startTimeMs),
      tx.pure.u64(endTimeMs),
      tx.object(clockObjectId),
    ],
  });

  console.log("✅ Transaction built:", {
    function: "create_event",
    packageId,
    adminCapId,
    eventData: {
      ...eventData,
      startTimeMs,
      endTimeMs,
    },
  });

  return tx;
}

/**
 * Build a transaction to update an event (admin only)
 */
export function buildUpdateEventTx(
  packageId: string,
  adminCapId: string,
  eventId: string,
  eventData: Omit<EventData, "clubId">
): Transaction {
  const tx = new Transaction();

  // Convert dates to milliseconds
  const startTimeMs = eventData.startTime.getTime();
  const endTimeMs = eventData.endTime.getTime();

  tx.moveCall({
    target: `${packageId}::event::update_event`,
    arguments: [
      tx.object(adminCapId),
      tx.object(eventId),
      tx.pure.string(eventData.title),
      tx.pure.string(eventData.description),
      tx.pure.string(eventData.location),
      tx.pure.u64(startTimeMs),
      tx.pure.u64(endTimeMs),
    ],
  });

  return tx;
}

/**
 * Build a transaction to cancel an event (admin only)
 */
export function buildCancelEventTx(
  packageId: string,
  adminCapId: string,
  eventId: string
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::event::cancel_event`,
    arguments: [tx.object(adminCapId), tx.object(eventId)],
  });

  return tx;
}

/**
 * Build a transaction to uncancel an event (admin only)
 */
export function buildUncancelEventTx(
  packageId: string,
  adminCapId: string,
  eventId: string
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::event::uncancel_event`,
    arguments: [tx.object(adminCapId), tx.object(eventId)],
  });

  return tx;
}

