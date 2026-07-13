import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getComplaintById } from "@/lib/complaints";
import { getAuthedUid } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const uid = await getAuthedUid(req);
    if (!uid) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.data()?.role as "student" | "admin" | undefined;

    const complaint = await getComplaintById(id, role === "admin");

    if (role !== "admin" && complaint.studentId !== uid) {
      return NextResponse.json({ error: "You don't have access to this complaint." }, { status: 403 });
    }

    return NextResponse.json(complaint);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Complaint not found." },
      { status: 404 }
    );
  }
}
