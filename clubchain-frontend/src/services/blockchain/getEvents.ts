import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { PACKAGE_ID, NETWORK } from "@/lib/constants";

export type EventInfo = {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string;
  date: number;
  participants: string[];
  encryptedContentBlobId?: string;
};

const EVENT_STRUCT = `${PACKAGE_ID}::club_system::Event`;

let client: SuiClient | null = null;
const getClient = () => {
  if (client) return client;
  client = new SuiClient({ url: getFullnodeUrl(NETWORK) });
  return client;
};

const toAddressVector = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (Array.isArray(value?.fields?.contents)) {
    return value.fields.contents.map((entry: any) => entry?.fields?.value ?? entry?.value ?? entry);
  }
  if (Array.isArray(value?.fields?.data)) {
    return value.fields.data.map((entry: any) => entry);
  }
  return [];
};

const buildEventFromObject = (objectId: string, fields: Record<string, any>): EventInfo => ({
  id: objectId,
  clubId: fields.club_id || fields.clubId || "",
  createdBy: "", // Not available in new contract
  title: fields.title || "",
  description: fields.description || "",
  date: Number(fields.start_time ?? fields.startTime ?? 0), // Use start_time as date
  participants: [], // Not available in new contract (stored in ParticipationBadge)
  encryptedContentBlobId: fields.encrypted_blob_id || fields.encryptedBlobId || undefined,
});

/**
 * Fetch all events directly from the blockchain
 * Uses queryObjects for shared Event objects (primary method)
 * Falls back to queryTransactionBlocks if needed
 */
export async function fetchEventsFromChain(): Promise<EventInfo[]> {
  try {
    const suiClient = getClient();
    const events: EventInfo[] = [];
    const seenEventIds = new Set<string>();

    console.log("🔍 Fetching events from chain...");

    // Method 1: Query shared Event objects directly (most reliable)
    try {
      const objectsResponse = await suiClient.queryObjects({
        filter: {
          StructType: EVENT_STRUCT,
        },
        options: {
          showContent: true,
          showType: true,
          showOwner: true,
        },
        limit: 100,
      });

      console.log(`📦 Found ${objectsResponse.data.length} Event objects via queryObjects`);

      for (const item of objectsResponse.data) {
        const objectId = item.data?.objectId;
        if (!objectId || seenEventIds.has(objectId)) continue;

        const owner = item.data?.owner;
        const isShared =
          typeof owner === "object" &&
          owner !== null &&
          "Shared" in owner;

        if (!isShared) continue; // Only process shared events

        seenEventIds.add(objectId);

        const content = item.data?.content;
        if (
          content?.dataType === "moveObject" &&
          content.type === EVENT_STRUCT &&
          content.fields
        ) {
          const event = buildEventFromObject(objectId, content.fields as any);
          events.push(event);
          console.log(`✅ Found event: ${event.title} (${objectId.slice(0, 8)}...)`);
        }
      }
    } catch (err) {
      console.error("❌ Query objects failed:", err);
    }

    // Method 2: Fallback to queryTransactionBlocks if no events found
    if (events.length === 0) {
      console.log("⚠️ No events found via queryObjects, trying queryTransactionBlocks...");
      try {
        const queryResponse = await suiClient.queryTransactionBlocks({
          filter: {
            MoveFunction: {
              package: PACKAGE_ID,
              module: "club_system",
              function: "create_event",
            },
          },
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
          order: "descending",
          limit: 100,
        });

        for (const tx of queryResponse.data) {
          // Check objectChanges first
          const createdEvents = tx.objectChanges?.filter(
            (change: any) =>
              change.type === "created" &&
              change.objectType?.includes("::club_system::Event")
          ) ?? [];

          for (const change of createdEvents) {
            const eventId = (change as any).objectId;
            if (!eventId || seenEventIds.has(eventId)) continue;

            seenEventIds.add(eventId);

            try {
              const event = await fetchEventById(eventId);
              if (event) {
                events.push(event);
                console.log(`✅ Found event from tx: ${event.title} (${eventId.slice(0, 8)}...)`);
              }
            } catch (err) {
              console.error(`Failed to fetch event ${eventId}:`, err);
            }
          }

          // Also check effects.created for shared objects
          if (tx.effects?.created) {
            for (const created of tx.effects.created) {
              const objectId = created.reference?.objectId;
              if (!objectId || seenEventIds.has(objectId)) continue;

              try {
                const obj = await suiClient.getObject({
                  id: objectId,
                  options: {
                    showType: true,
                    showContent: true,
                    showOwner: true,
                  },
                });

                const owner = obj.data?.owner;
                const isShared =
                  typeof owner === "object" &&
                  owner !== null &&
                  "Shared" in owner;

                if (
                  obj.data?.type?.includes("::club_system::Event") &&
                  isShared
                ) {
                  seenEventIds.add(objectId);
                  const event = await fetchEventById(objectId);
                  if (event) {
                    events.push(event);
                    console.log(`✅ Found event from effects: ${event.title} (${objectId.slice(0, 8)}...)`);
                  }
                }
              } catch (err) {
                // Skip silently
              }
            }
          }
        }
      } catch (err) {
        console.error("❌ Query transaction blocks failed:", err);
      }
    }

    console.log(`✅ Total events found: ${events.length}`);
    return events;
  } catch (error) {
    console.error("❌ Failed to fetch events from chain:", error);
    return [];
  }
}

/**
 * Fetch a single event by its object ID
 */
export async function fetchEventById(eventId: string): Promise<EventInfo | null> {
  try {
    const suiClient = getClient();
    
    const response = await suiClient.getObject({
      id: eventId,
      options: { showContent: true },
    });

    const content = response.data?.content;
    if (
      content?.dataType === "moveObject" &&
      content.type === EVENT_STRUCT &&
      content.fields
    ) {
      return buildEventFromObject(eventId, content.fields as any);
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch event ${eventId}:`, error);
    return null;
  }
}

/**
 * Fetch events for a specific club
 */
export async function fetchEventsByClubId(clubId: string): Promise<EventInfo[]> {
  const allEvents = await fetchEventsFromChain();
  return allEvents.filter(event => event.clubId === clubId);
}

/**
 * Main export function to get all events
 */
export async function getEvents(): Promise<EventInfo[]> {
  return await fetchEventsFromChain();
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<EventInfo | null> {
  return await fetchEventById(id);
}
