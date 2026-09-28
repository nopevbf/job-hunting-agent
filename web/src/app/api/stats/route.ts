import { NextResponse } from "next/server";
import { firestoreJobService } from "@/lib/firestore";

export async function GET() {
  try {
    const stats = await firestoreJobService.getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
