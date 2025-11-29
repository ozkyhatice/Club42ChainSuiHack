import { NextResponse } from "next/server";
import { isClubOwner } from "@/src/services/blockchain/getClubs";

type CreateEventRequest = {
  clubId: string;
  walletAddress: string;
  title: string;
  description: string;
  date: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateEventRequest;
    if (!body?.clubId || !body?.walletAddress) {
      return NextResponse.json(
        { message: "clubId and walletAddress are required" },
        { status: 400 }
      );
    }

    const allowed = await isClubOwner(body.clubId, body.walletAddress);
    if (!allowed) {
      return NextResponse.json(
        { message: "Only club owners can create events" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/events/create failed:", error);
    return NextResponse.json(
      { message: "Unable to validate event creation request" },
      { status: 500 }
    );
  }
}

