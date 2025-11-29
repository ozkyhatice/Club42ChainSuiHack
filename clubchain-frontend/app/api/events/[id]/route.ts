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
    const participants = toAddressVector(fields.participants);
    
    const event = {
      id,
      clubId: fields.club_id,
      createdBy: fields.created_by,
      title: fields.title,
      description: fields.description,
      date: Number(fields.date ?? 0),
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

