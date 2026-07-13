import { NextRequest, NextResponse } from "next/server";
import { addResponse } from "@/lib/complaints";
import { getAuthedUid } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const uid = await getAuthedUid(req);
    const { complaintId, trackingCode, message } = await req.json();

    if (!complaintId || !message || !message.trim()) {
      return NextResponse.json({ error: "A message is required." }, { status: 400 });
    }

    const response = await addResponse(complaintId, trackingCode ?? null, uid, message.trim());
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not post reply." },
      { status: 403 }
    );
  }
}
