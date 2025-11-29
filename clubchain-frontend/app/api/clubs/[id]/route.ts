import { NextResponse } from "next/server";
import { getClubById } from "@/src/services/blockchain/getClubs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const club = await getClubById(id);
    
    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ club });
  } catch (error) {
    console.error(`GET /api/clubs/${(await params).id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to fetch club" },
      { status: 500 }
    );
  }
}
