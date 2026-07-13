import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getReportsData } from "@/lib/complaints";
import { getAuthedUid } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const uid = await getAuthedUid(req);
    if (!uid) return NextResponse.json({ error: "Login required." }, { status: 401 });

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const data = await getReportsData();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load reports." },
      { status: 500 }
    );
  }
}
