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

const EVENT_STRUCT = `${PACKAGE_ID}::event::Event`;

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
  clubId: fields.club_id,
  createdBy: fields.created_by,
  title: fields.title,
  description: fields.description,
  date: Number(fields.date ?? 0),
  participants: toAddressVector(fields.participants),
  encryptedContentBlobId: fields.encrypted_content_blob_id || undefined,
});

/**
 * Fetch all events directly from the blockchain by querying transaction history
 * This method finds events created via create_event_with_cap function
 */
export async function fetchEventsFromChain(): Promise<EventInfo[]> {
  try {
    const suiClient = getClient();
    const events: EventInfo[] = [];
    const seenEventIds = new Set<string>();

    // Query transactions that created events via create_event_with_cap
    try {
      const queryResponse = await suiClient.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: PACKAGE_ID,
            module: "event",
            function: "create_event_with_cap",
          },
        },
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
        limit: 50,
      });

      for (const tx of queryResponse.data) {
        const createdEvents = tx.objectChanges?.filter(
          (change: any) =>
            change.type === "created" &&
            change.objectType?.includes("::event::Event")
        ) ?? [];

        for (const change of createdEvents) {
          const eventId = (change as any).objectId;
          if (!eventId || seenEventIds.has(eventId)) continue;
          
          seenEventIds.add(eventId);
          
          try {
            const event = await fetchEventById(eventId);
            if (event) {
              events.push(event);
            }
          } catch (err) {
            console.error(`Failed to fetch event ${eventId}:`, err);
          }
        }
      }
    } catch (err) {
      console.error("Query create_event_with_cap failed:", err);
    }

    // Also query events created via create_event (with ClubOwnerBadge)
    try {
      const queryResponse = await suiClient.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: PACKAGE_ID,
            module: "event",
            function: "create_event",
          },
        },
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
        limit: 50,
      });

      for (const tx of queryResponse.data) {
        const createdEvents = tx.objectChanges?.filter(
          (change: any) =>
            change.type === "created" &&
            change.objectType?.includes("::event::Event")
        ) ?? [];

        for (const change of createdEvents) {
          const eventId = (change as any).objectId;
          if (!eventId || seenEventIds.has(eventId)) continue;
          
          seenEventIds.add(eventId);
          
          try {
            const event = await fetchEventById(eventId);
            if (event) {
              events.push(event);
            }
          } catch (err) {
            console.error(`Failed to fetch event ${eventId}:`, err);
          }
        }
      }
    } catch (err) {
      console.error("Query create_event failed:", err);
    }

    // Also query events created via create_event_as_admin (SuperAdmin)
    try {
      const queryResponse = await suiClient.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: PACKAGE_ID,
            module: "event",
            function: "create_event_as_admin",
          },
        },
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
        limit: 50,
      });

      for (const tx of queryResponse.data) {
        const createdEvents = tx.objectChanges?.filter(
          (change: any) =>
            change.type === "created" &&
            change.objectType?.includes("::event::Event")
        ) ?? [];

        for (const change of createdEvents) {
          const eventId = (change as any).objectId;
          if (!eventId || seenEventIds.has(eventId)) continue;
          
          seenEventIds.add(eventId);
          
          try {
            const event = await fetchEventById(eventId);
            if (event) {
              events.push(event);
            }
          } catch (err) {
            console.error(`Failed to fetch event ${eventId}:`, err);
          }
        }
      }
    } catch (err) {
      console.error("Query create_event_as_admin failed:", err);
    }

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
