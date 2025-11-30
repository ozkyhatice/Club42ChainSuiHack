import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  PACKAGE_ID,
  NETWORK,
  CLUB_REGISTRY_OBJECT_ID,
} from "@/lib/constants";

export type EventInfo = {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string;
  date: number;
  participants?: string[];
};

export type Club = {
  id: string;
  owner: string;
  name: string;
  description: string;
  events: EventInfo[];
  balance?: number; // Donation balance in MIST (1 SUI = 1,000,000,000 MIST)
};

const CLUB_STRUCT = `${PACKAGE_ID}::club_system::Club`;
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

const extractEventsFromClub = (fields: Record<string, any>): string[] => {
  if (!("events" in fields)) return [];
  return toAddressVector(fields.events);
};

const buildEventFromObject = (objectId: string, fields: Record<string, any>): EventInfo => ({
  id: objectId,
  clubId: fields.club_id,
  createdBy: fields.created_by,
  title: fields.title,
  description: fields.description,
  date: Number(fields.date ?? 0),
  participants: toAddressVector(fields.participants),
});

const fetchEventObjects = async (ids: string[]): Promise<EventInfo[]> => {
  const suiClient = getClient();
  const events: EventInfo[] = [];

  for (const id of ids) {
    try {
      const response = await suiClient.getObject({
        id,
        options: { showContent: true },
      });
      const content = response.data?.content;
      if (
        content?.dataType === "moveObject" &&
        content.type === EVENT_STRUCT &&
        content.fields
      ) {
        events.push(buildEventFromObject(id, content.fields as any));
      }
    } catch (error) {
      // Event load failed - skip silently
    }
  }

  return events;
};

type RegistryContent = {
  dataType: "moveObject";
  type: string;
  fields?: Record<string, any>;
};

export const extractClubsFromRegistry = async (
  registry: RegistryContent | null
): Promise<Club[]> => {
  if (!registry?.fields) return [];

  const contents =
    registry.fields.clubs?.fields?.contents ??
    registry.fields.clubs?.fields?.data ??
    [];

  if (!Array.isArray(contents)) return [];

  const clubs: Club[] = [];

  for (const entry of contents) {
    const key = entry.fields?.key ?? entry.key;
    const value = entry.fields?.value ?? entry.value;
    if (!value?.fields) continue;
    const fields = value.fields;
    const eventIds = extractEventsFromClub(fields);
    const events = await fetchEventObjects(eventIds);
    clubs.push({
      id: key ?? fields.id ?? "",
      owner: fields.owner ?? fields.admin ?? "",
      name: fields.name ?? "Unnamed Club",
      description: fields.description ?? "No description provided",
      events,
      balance: fields.balance ? Number(fields.balance) : 0,
    });
  }

  return clubs.filter((club) => Boolean(club.id));
};

const fetchClubObject = async (
  clubId: string,
  suiClient: SuiClient
): Promise<Club | null> => {
  const response = await suiClient.getObject({
    id: clubId,
    options: { showContent: true },
  });

  const content = response.data?.content;
  if (
    content?.dataType !== "moveObject" ||
    content.type !== CLUB_STRUCT ||
    !content.fields
  ) {
    return null;
  }

  const fields = content.fields as Record<string, any>;
  const eventIds = extractEventsFromClub(fields);
  const events = await fetchEventObjects(eventIds);

  return {
    id: clubId,
    owner: fields.owner ?? "",
    name: fields.name ?? "Unnamed Club",
    description: fields.description ?? "",
    events,
    balance: fields.balance ? Number(fields.balance) : 0,
  };
};

export async function fetchClubsFromChain(): Promise<Club[]> {
  try {
    const suiClient = getClient();
    const clubs: Club[] = [];
    const seenClubIds = new Set<string>();

    console.log("🔍 Fetching clubs with PACKAGE_ID:", PACKAGE_ID);

    // Method: Query all shared Club objects by transaction history
    try {
      // Use queryTransactionBlocks to find created Club objects
      // Reduced limit and better error handling
      console.log("🔍 Querying transaction blocks for create_club...");
      const queryResponse = await suiClient.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: PACKAGE_ID,
            module: "club_system",
            function: "create_club",
          },
        },
        options: {
          showEffects: true,
          showObjectChanges: true,
          showInput: false,
          showEvents: false,
        },
        limit: 50, // Reduced limit to avoid timeout
        order: "descending",
      }).catch((error) => {
        console.error("❌ queryTransactionBlocks error:", error);
        throw error;
      });

      console.log(`📦 Found ${queryResponse.data.length} create_club transactions`);

      for (const tx of queryResponse.data) {
        // Method 1: Check objectChanges for shared objects
        if (tx.objectChanges) {
          for (const change of tx.objectChanges) {
            // Check if it's a created shared Club object
            if (
              change.type === "created" &&
              change.objectType?.includes("::club_system::Club")
            ) {
              const clubId = (change as any).objectId;
              const owner = (change as any).owner;
              
              // Shared objects have owner.Shared (object with Shared property)
              const isShared = 
                typeof owner === "object" && 
                owner !== null && 
                "Shared" in owner;
              
              if (clubId && isShared) {
                if (!seenClubIds.has(clubId)) {
                  seenClubIds.add(clubId);
                  try {
                    const club = await fetchClubObject(clubId, suiClient);
                    if (club) {
                      clubs.push(club);
                      console.log(`  Found club: ${club.name} (${clubId})`);
                    }
                  } catch (err) {
                    console.warn(`Failed to fetch club ${clubId}:`, err);
                  }
                }
              }
            }
          }
        }

        // Method 2: Check effects.created for shared objects
        if (tx.effects?.created) {
          for (const created of tx.effects.created) {
            const objectId = created.reference?.objectId;
            if (!objectId || seenClubIds.has(objectId)) continue;
            
            try {
              const obj = await suiClient.getObject({
                id: objectId,
                options: { 
                  showType: true, 
                  showContent: true,
                  showOwner: true,
                },
              });
              
              // Check if it's a shared Club object
              const owner = obj.data?.owner;
              const isShared = 
                typeof owner === "object" && 
                owner !== null && 
                "Shared" in owner;
              
              if (
                obj.data?.type?.includes("::club_system::Club") &&
                isShared
              ) {
                seenClubIds.add(objectId);
                const club = await fetchClubObject(objectId, suiClient);
                if (club) {
                  clubs.push(club);
                  console.log(`  Found club from effects: ${club.name} (${objectId})`);
                }
              }
          } catch (err) {
              // Skip silently
            }
          }
        }
      }

      console.log(`  Total clubs found: ${clubs.length}`);
      return clubs;
    } catch (err) {
      console.error("❌ Query transaction blocks failed:", err);
      // Log more details about the error
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      // Return empty array instead of throwing
      return [];
    }
  } catch (error) {
    console.error("❌ Failed to fetch clubs from chain:", error);
    return [];
  }
}

export async function getClubs(): Promise<Club[]> {
  return await fetchClubsFromChain();
}

export async function getClubById(id: string): Promise<Club | null> {
  try {
    const suiClient = getClient();
    const club = await fetchClubObject(id, suiClient);
    return club ?? null;
  } catch (error) {
    console.error(`Failed to load club ${id}:`, error);
    return null;
  }
}

export async function isClubOwner(
  clubId: string,
  wallet: string
): Promise<boolean> {
  const club = await getClubById(clubId);
  if (!club || !wallet) return false;
  return club.owner.toLowerCase() === wallet.toLowerCase();
}

