import { NextRequest, NextResponse } from "next/server";
import { submitComplaint } from "@/lib/complaints";
import { getAuthedUid } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const uid = await getAuthedUid(req);
    const body = await req.json();
    const { title, category, description, attachments, isAnonymous } = body;

    if (!title || !category || !description) {
      return NextResponse.json({ error: "Title, category, and description are required." }, { status: 400 });
    }

    const result = await submitComplaint({
      title,
      category,
      description,
      attachments: Array.isArray(attachments) ? attachments : [],
      isAnonymous: !!isAnonymous,
      studentId: isAnonymous ? null : uid,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not submit complaint." },
      { status: 500 }
    );
  }
}
