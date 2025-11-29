import { NextResponse } from "next/server";
import { buildLeaveEventTx } from "@/modules/contracts/event";
import { PACKAGE_ID } from "@/lib/constants";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    // Build the transaction
    const tx = buildLeaveEventTx(PACKAGE_ID, eventId);
    
    // Serialize and return
    const txBytes = await tx.build({ client: undefined as any });
    
    return NextResponse.json({ 
      success: true,
      eventId,
    });
  } catch (error) {
    console.error(`POST /api/events/leave failed:`, error);
    return NextResponse.json(
      { error: "Failed to build leave transaction" },
      { status: 500 }
    );
  }
}

