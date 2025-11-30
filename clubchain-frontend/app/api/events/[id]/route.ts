import { NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { PACKAGE_ID, NETWORK } from "@/lib/constants";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const suiClient = getClient();
    
    const response = await suiClient.getObject({
      id,
      options: { showContent: true },
    });

    const content = response.data?.content;
    if (
      content?.dataType !== "moveObject" ||
      content.type !== EVENT_STRUCT ||
      !content.fields
    ) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const fields = content.fields as Record<string, any>;
    
    // Get the event's UID inner ID (this is what's stored in ParticipationBadge.event_id)
    // The event object ID might be different from the UID inner ID
    // We need to get the UID inner ID from the event object
    const eventUidInnerId = response.data?.data?.objectId || id;
    
    // Fetch participants from ParticipationBadge objects
    // Participants are stored in ParticipationBadge, not in Event object
    const participants: string[] = [];
    try {
      // Normalize event ID for comparison
      const normalizeId = (eventId: string) => {
        if (!eventId) return "";
        // Handle both object ID format and UID inner ID format
        const cleaned = typeof eventId === "string" 
          ? (eventId.startsWith("0x") ? eventId.slice(2) : eventId)
          : String(eventId);
        return cleaned.toLowerCase();
      };
      
      // Try both the object ID and potential UID inner ID
      const normalizedEventId1 = normalizeId(eventUidInnerId);
      const normalizedEventId2 = normalizeId(id);
      
      // Query all ParticipationBadge objects
      const participationBadges = await suiClient.queryObjects({
        filter: {
          StructType: `${PACKAGE_ID}::club_system::ParticipationBadge`,
        },
        options: {
          showContent: true,
          showOwner: true,
        },
        limit: 1000, // Large limit to get all badges
      });

      console.log(`🔍 Checking ${participationBadges.data.length} ParticipationBadges for event ${id} (normalized: ${normalizedEventId1}, ${normalizedEventId2})`);

      // Filter badges for this event and extract owner addresses
      for (const badge of participationBadges.data) {
        const badgeContent = badge.data?.content;
        if (badgeContent && "fields" in badgeContent) {
          const badgeFields = badgeContent.fields as any;
          const badgeEventId = badgeFields.event_id || badgeFields.eventId || "";
          
          // Normalize and compare event IDs
          const normalizedBadgeEventId = normalizeId(badgeEventId);
          
          // Check if this badge belongs to our event
          if (normalizedBadgeEventId && 
              (normalizedBadgeEventId === normalizedEventId1 || normalizedBadgeEventId === normalizedEventId2)) {
            const owner = badge.data?.owner;
            if (owner && typeof owner === "object" && "AddressOwner" in owner) {
              const address = (owner as any).AddressOwner;
              if (address && !participants.includes(address)) {
                participants.push(address);
                console.log(`✅ Found participant: ${address.slice(0, 8)}... (badge event_id: ${badgeEventId})`);
              }
            }
          }
        }
      }
      
      console.log(`✅ Found ${participants.length} participants for event ${id}`);
    } catch (err) {
      console.error("Failed to fetch participants from ParticipationBadge:", err);
      // Continue with empty participants array
    }
    
    const event = {
      id,
      clubId: fields.club_id || fields.clubId || "",
      createdBy: "", // Not available in new contract
      title: fields.title || "",
      description: fields.description || "",
      date: Number(fields.start_time ?? fields.startTime ?? 0),
      participants,
    };
    
    return NextResponse.json({ event });
  } catch (error) {
    console.error(`GET /api/events failed:`, error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

