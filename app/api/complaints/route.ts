import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { listComplaints, listComplaintsForStudent } from "@/lib/complaints";
import { getAuthedUid } from "@/lib/api-auth";
import type { ComplaintStatus } from "@/types/complaint";

export async function GET(req: NextRequest) {
  try {
    const uid = await getAuthedUid(req);
    if (!uid) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.data()?.role as "student" | "admin" | undefined;

    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");

    if (mine) {
      const complaints = await listComplaintsForStudent(uid);
      return NextResponse.json(complaints);
    }

    if (role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const status = searchParams.get("status") as ComplaintStatus | null;
    const category = searchParams.get("category");

    const complaints = await listComplaints({
      status: status ?? undefined,
      category: category ?? undefined,
    });
    return NextResponse.json(complaints);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load complaints." },
      { status: 500 }
    );
  }
}
