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
};

const CLUB_STRUCT = `${PACKAGE_ID}::club::Club`;
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
  };
};

export async function fetchClubsFromChain(): Promise<Club[]> {
  try {
    const suiClient = getClient();

    // Method 1: Try registry if available
    if (CLUB_REGISTRY_OBJECT_ID) {
      try {
        const registryResponse = await suiClient.getObject({
          id: CLUB_REGISTRY_OBJECT_ID,
          options: { showContent: true },
        });

        if (
          registryResponse.data?.content?.dataType === "moveObject" &&
          registryResponse.data.content
        ) {
          const clubs = await extractClubsFromRegistry(
            registryResponse.data.content as RegistryContent
          );
          if (clubs.length) {
            return clubs;
          }
        }
      } catch (err) {
        // Registry query failed - continue to fallback method
      }
    }

    // Method 2: Query all shared Club objects by type
    try {
      // Use queryTransactionBlocks to find created Club objects
      const queryResponse = await suiClient.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: PACKAGE_ID,
            module: "club",
            function: "create_club",
          },
        },
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
        limit: 50,
      });

      const clubs: Club[] = [];
      const seenClubIds = new Set<string>();

      for (const tx of queryResponse.data) {
        // Look in objectChanges for created Club objects
        const createdClubs = tx.objectChanges?.filter(
          (change: any) =>
            change.type === "created" &&
            change.objectType?.includes("::club::Club")
        ) ?? [];

        for (const change of createdClubs) {
          const clubId = (change as any).objectId;
          if (!clubId || seenClubIds.has(clubId)) continue;
          
          seenClubIds.add(clubId);
          
          try {
            const club = await fetchClubObject(clubId, suiClient);
            if (club) {
              clubs.push(club);
            }
          } catch (err) {
            // Failed to fetch club - skip silently
          }
        }
      }

      return clubs;
    } catch (err) {
      console.error("Query by type failed:", err);
    }

    return [];
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

