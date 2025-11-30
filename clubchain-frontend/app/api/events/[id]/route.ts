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
    
    // Get the event object ID - this is what's stored in ParticipationBadge.event_id
    // In Sui, when we use object::uid_to_inner(&event.id), we get the object ID
    // The event object ID is what's stored in ParticipationBadge.event_id
    // Use the provided id parameter (which is the event object ID from the URL)
    const eventObjectId = id;
    
    // Fetch participants from ParticipationBadge objects
    // Participants are stored in ParticipationBadge, not in Event object
    const participants: string[] = [];
    try {
      // Normalize event ID for comparison (remove 0x prefix and lowercase)
      const normalizeId = (eventId: string | undefined | null): string => {
        if (!eventId) return "";
        const str = String(eventId);
        const cleaned = str.startsWith("0x") ? str.slice(2) : str;
        return cleaned.toLowerCase();
      };
      
      const normalizedEventId = normalizeId(eventObjectId);
      
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

      console.log(`🔍 Checking ${participationBadges.data.length} ParticipationBadges for event ${id} (normalized event ID: ${normalizedEventId})`);

      // Filter badges for this event and extract owner addresses
      for (const badge of participationBadges.data) {
        const badgeContent = badge.data?.content;
        if (badgeContent && "fields" in badgeContent) {
          const badgeFields = badgeContent.fields as any;
          // event_id is stored as ID type, which can be a string or object with id field
          let badgeEventId = badgeFields.event_id || badgeFields.eventId || "";
          
          // Handle ID type - it might be an object with an 'id' field or a direct string
          if (typeof badgeEventId === "object" && badgeEventId !== null) {
            badgeEventId = badgeEventId.id || badgeEventId.value || String(badgeEventId);
          }
          badgeEventId = String(badgeEventId);
          
          // Normalize and compare event IDs
          const normalizedBadgeEventId = normalizeId(badgeEventId);
          
          // Debug log - show first few badges for debugging
          if (participationBadges.data.indexOf(badge) < 5) {
            console.log(`  Badge #${participationBadges.data.indexOf(badge)}: event_id="${badgeEventId}" -> normalized="${normalizedBadgeEventId}", event ID="${normalizedEventId}", matches=${normalizedBadgeEventId === normalizedEventId}`);
          }
          
          // Check if this badge belongs to our event
          // Try both normalized comparison and direct comparison
          const matches = normalizedBadgeEventId === normalizedEventId || 
                         badgeEventId.toLowerCase() === id.toLowerCase() ||
                         normalizeId(badgeEventId) === normalizeId(id);
          
          if (matches) {
            const owner = badge.data?.owner;
            if (owner && typeof owner === "object" && "AddressOwner" in owner) {
              const address = (owner as any).AddressOwner;
              if (address && !participants.includes(address)) {
                participants.push(address);
                console.log(`  Found participant: ${address} (badge event_id: ${badgeEventId}, badge object ID: ${badge.data?.objectId})`);
              }
            }
          }
        }
      }
      
      console.log(`  Found ${participants.length} participants for event ${id}`);
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

