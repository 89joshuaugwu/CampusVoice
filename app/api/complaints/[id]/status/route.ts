import { NextRequest, NextResponse } from "next/server";
import { updateStatus } from "@/lib/complaints";
import { getAuthedUid } from "@/lib/api-auth";
import type { ComplaintStatus } from "@/types/complaint";

const VALID: ComplaintStatus[] = ["pending", "in_review", "resolved", "rejected"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const uid = await getAuthedUid(req);
    const { status } = await req.json();

    if (!VALID.includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    await updateStatus(id, uid, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update status." },
      { status: 403 }
    );
  }
}
