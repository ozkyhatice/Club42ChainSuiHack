import { NextResponse } from "next/server";
import { getClubs } from "@/src/services/blockchain/getClubs";

export async function GET() {
  try {
    const clubs = await getClubs();
    return NextResponse.json({ clubs });
  } catch (error) {
    console.error("GET /api/clubs failed:", error);
    return NextResponse.json(
      { clubs: [], error: "Failed to fetch clubs from blockchain" },
      { status: 500 }
    );
  }
}

