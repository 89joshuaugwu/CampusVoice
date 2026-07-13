import { NextRequest, NextResponse } from "next/server";
import { getComplaintByTrackingCode } from "@/lib/complaints";

export async function POST(req: NextRequest) {
  try {
    const { trackingCode } = await req.json();
    if (!trackingCode || typeof trackingCode !== "string") {
      return NextResponse.json({ error: "A tracking code is required." }, { status: 400 });
    }
    const complaint = await getComplaintByTrackingCode(trackingCode.trim().toUpperCase());
    return NextResponse.json(complaint);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No complaint found for this code." },
      { status: 404 }
    );
  }
}
