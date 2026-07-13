import { NextRequest, NextResponse } from "next/server";
import { updateInternalNotes } from "@/lib/complaints";
import { getAuthedUid } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const uid = await getAuthedUid(req);
    const { internalNotes } = await req.json();

    await updateInternalNotes(id, uid, internalNotes ?? "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save notes." },
      { status: 403 }
    );
  }
}
